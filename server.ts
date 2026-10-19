import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import multer from 'multer';
import dotenv from 'dotenv';
import { db } from './server/db.ts';
import { calculateCartTotals, type CartItem } from './src/utils/pricing.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isDev = process.env.NODE_ENV !== 'production';

// Ensure uploads folder exists
const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for image and CAD file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.stl', '.3mf', '.obj', '.step', '.stp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${ext} is not supported. Allowed: PNG, JPG, PDF, STL, 3MF, OBJ, STEP.`));
    }
  },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Persistent admin session management
const SESSIONS_FILE = path.join(process.cwd(), 'data', 'sessions.json');

function loadSessions(): Set<string> {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      if (Array.isArray(data)) return new Set(data);
    }
  } catch (err) {
    console.error('Failed to load sessions:', err);
  }
  return new Set();
}

function saveSessions(sessions: Set<string>): void {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(Array.from(sessions)), 'utf-8');
  } catch (err) {
    console.error('Failed to save sessions:', err);
  }
}

const ADMIN_SESSIONS = loadSessions();

function generateToken(): string {
  const token = crypto.randomBytes(32).toString('hex');
  ADMIN_SESSIONS.add(token);
  saveSessions(ADMIN_SESSIONS);
  return token;
}

function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized: Missing admin authorization header' });
    return;
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!ADMIN_SESSIONS.has(token)) {
    res.status(403).json({ error: 'Forbidden: Invalid or expired session' });
    return;
  }
  next();
}

// ======================== API ROUTES ========================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Maker Tank 3D API', timestamp: new Date().toISOString() });
});

// --- Settings & Metadata ---
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(db.getSettings());
});

app.put('/api/settings', adminAuthMiddleware, (req: Request, res: Response) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// --- Categories ---
app.get('/api/categories', (_req: Request, res: Response) => {
  res.json(db.getCategories());
});

app.post('/api/categories', adminAuthMiddleware, (req: Request, res: Response) => {
  const { name, slug, parentId, description, imageUrl, iconName } = req.body;
  if (!name || !slug) {
    res.status(400).json({ error: 'Name and slug are required' });
    return;
  }
  const categories = db.getCategories();
  const newCat = db.createCategory({
    name,
    slug,
    parentId: parentId || null,
    displayOrder: categories.length + 1,
    description,
    imageUrl,
    iconName,
  });
  res.status(201).json(newCat);
});

app.put('/api/categories/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const updated = db.updateCategory(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/categories/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const success = db.deleteCategory(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json({ success: true });
});

app.post('/api/categories/reorder', adminAuthMiddleware, (req: Request, res: Response) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds)) {
    res.status(400).json({ error: 'orderedIds must be an array of category IDs' });
    return;
  }
  const categories = db.reorderCategories(orderedIds);
  res.json(categories);
});

// --- Products ---
app.get('/api/products', (req: Request, res: Response) => {
  let products = db.getProducts();
  const { category, event, search, featured, digital } = req.query;

  if (category && typeof category === 'string') {
    products = products.filter(p => p.categoryId === category || p.subcategoryId === category);
  }
  if (event && typeof event === 'string') {
    products = products.filter(p => p.occasionTags?.includes(event.toLowerCase()));
  }
  if (featured === 'true') {
    products = products.filter(p => p.isFeatured);
  }
  if (digital === 'true') {
    products = products.filter(p => p.isDigital);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    products = products.filter(
      p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  res.json(products);
});

app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = db.getProductById(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
});

app.post('/api/products', adminAuthMiddleware, (req: Request, res: Response) => {
  const { name, basePrice, categoryId } = req.body;
  if (!name || basePrice === undefined || !categoryId) {
    res.status(400).json({ error: 'Name, basePrice, and categoryId are required' });
    return;
  }
  const product = db.createProduct(req.body);
  res.status(201).json(product);
});

app.put('/api/products/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const updated = db.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(updated);
});

app.delete('/api/products/:id', adminAuthMiddleware, (req: Request, res: Response) => {
  const success = db.deleteProduct(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json({ success: true });
});

// --- Server-Side Price & Bulk Tier Validation ---
app.post('/api/cart/validate', (req: Request, res: Response) => {
  const { items } = req.body;
  if (!Array.isArray(items)) {
    res.status(400).json({ error: 'Items array is required' });
    return;
  }

  // Verify against actual DB records to prevent client tampering
  const validatedItems: CartItem[] = [];
  for (const clientItem of items) {
    const dbProduct = db.getProductById(clientItem.productId);
    if (!dbProduct) {
      res.status(400).json({ error: `Product ${clientItem.productId} not found` });
      return;
    }

    // Verify size price modifier if any
    let sizeModifier = 0;
    if (clientItem.selectedSize && dbProduct.sizes) {
      const matchSize = dbProduct.sizes.find(s => s.label === clientItem.selectedSize);
      if (matchSize) sizeModifier = matchSize.priceModifier;
    }

    validatedItems.push({
      id: clientItem.id,
      productId: dbProduct.id,
      name: dbProduct.name,
      basePrice: dbProduct.basePrice,
      selectedColor: clientItem.selectedColor,
      selectedSize: clientItem.selectedSize,
      sizePriceModifier: sizeModifier,
      quantity: Math.max(1, parseInt(clientItem.quantity, 10) || 1),
      coverImage: dbProduct.coverImage,
      bulkTiers: dbProduct.bulkTiers,
    });
  }

  const totals = calculateCartTotals(validatedItems);
  res.json({
    valid: true,
    items: validatedItems,
    totals,
  });
});

// --- File Uploads ---
app.post('/api/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
  });
});

// Multiple file upload for custom quotes or product galleries
app.post('/api/upload-multiple', upload.array('files', 5), (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: 'No files uploaded' });
    return;
  }
  const uploaded = files.map(f => ({
    url: `/uploads/${f.filename}`,
    filename: f.filename,
    originalName: f.originalname,
    size: f.size,
  }));
  res.json({ files: uploaded });
});

// --- Custom CAD & 3D Print Enquiries ---
app.post('/api/custom-enquiry', (req: Request, res: Response) => {
  const { customerName, customerEmail, customerPhone, projectDetails, technology, materialPreference, fileUrls } = req.body;
  if (!customerName || !customerPhone || !projectDetails) {
    res.status(400).json({ error: 'Name, phone, and project details are required' });
    return;
  }

  const enquiry = db.createEnquiry({
    customerName,
    customerEmail: customerEmail || '',
    customerPhone,
    projectDetails,
    technology: technology || 'Unsure',
    materialPreference: materialPreference || 'Standard PLA',
    fileUrls: Array.isArray(fileUrls) ? fileUrls : [],
  });

  console.log(`[Custom CAD Enquiry] Received from ${customerName} (${customerPhone}) - ID: ${enquiry.id}`);
  res.status(201).json({ success: true, enquiry });
});

// --- Contact Form ---
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required' });
    return;
  }

  const saved = db.createMessage({
    name,
    email,
    phone,
    subject,
    message,
  });

  console.log(`[Contact Message] Received from ${name} <${email}>: "${subject || 'General Enquiry'}"`);
  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been sent to our team. We will contact you shortly.',
    id: saved.id,
  });
});

// --- Parametric Tools ---
app.get('/api/parametric-tools', (_req: Request, res: Response) => {
  res.json(db.getParametricTools());
});

// --- Admin Authentication & Dashboard ---
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }
  const isValid = db.verifyAdmin(password, username);
  if (!isValid) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }
  const token = generateToken();
  ADMIN_SESSIONS.add(token);
  res.json({ success: true, token });
});

app.post('/api/admin/logout', adminAuthMiddleware, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '');
    ADMIN_SESSIONS.delete(token);
    saveSessions(ADMIN_SESSIONS);
  }
  res.json({ success: true });
});

app.get('/api/admin/enquiries', adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json(db.getEnquiries());
});

app.put('/api/admin/enquiries/:id/status', adminAuthMiddleware, (req: Request, res: Response) => {
  const { status } = req.body;
  const success = db.updateEnquiryStatus(req.params.id, status);
  if (!success) {
    res.status(404).json({ error: 'Enquiry not found' });
    return;
  }
  res.json({ success: true });
});

app.get('/api/admin/messages', adminAuthMiddleware, (_req: Request, res: Response) => {
  res.json(db.getMessages());
});

// ======================== VITE / PRODUCTION SERVING ========================

async function startServer() {
  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Maker Tank 3D full-stack server running at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
