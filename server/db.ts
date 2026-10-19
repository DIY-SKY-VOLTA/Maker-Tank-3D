import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type {
  Product,
  Category,
  CustomEnquiry,
  ContactMessage,
  ParametricTool,
  SiteSettings,
} from '../src/types/index.ts';
import { ASSETS } from '../src/utils/assets.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

export interface DatabaseSchema {
  categories: Category[];
  products: Product[];
  enquiries: CustomEnquiry[];
  messages: ContactMessage[];
  parametricTools: ParametricTool[];
  settings: SiteSettings;
  adminCredentials: {
    username: string;
    passwordHash: string;
    salt: string;
  };
}

// Initial seed data based on the Maker Tank 3D brief and design mockups
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-plant-pots',
    name: 'Plant Pots & Planters',
    slug: 'plant-pots',
    parentId: null,
    displayOrder: 1,
    description: 'Beautiful geometric and self-watering pots for indoor green spaces.',
    imageUrl: ASSETS.spiralPlantPot,
    iconName: 'Flower2',
  },
  {
    id: 'cat-lamps',
    name: 'Lamps & Lighting',
    slug: 'lamps-lighting',
    parentId: null,
    displayOrder: 2,
    description: 'Modern ambient lithophanes and mood lamps for every room.',
    imageUrl: ASSETS.moonLamp,
    iconName: 'Lamp',
  },
  {
    id: 'cat-phone-stands',
    name: 'Phone Stands',
    slug: 'phone-stands',
    parentId: null,
    displayOrder: 3,
    description: 'Practical, ergonomic desktop phone and tablet stands.',
    imageUrl: ASSETS.phoneStand,
    iconName: 'Smartphone',
  },
  {
    id: 'cat-keychains',
    name: 'Key Chains',
    slug: 'keychains',
    parentId: null,
    displayOrder: 4,
    description: 'Personalised name, brand logo, and character keychains with bulk pricing.',
    imageUrl: ASSETS.keychain,
    iconName: 'Key',
  },
  // Subcategories for Key Chains
  {
    id: 'subcat-name-keychains',
    name: 'Name Key Chains',
    slug: 'name-keychains',
    parentId: 'cat-keychains',
    displayOrder: 1,
    description: 'Custom embossed lettering in vibrant dual-color filament.',
  },
  {
    id: 'subcat-logo-keychains',
    name: 'Logo Key Chains',
    slug: 'logo-keychains',
    parentId: 'cat-keychains',
    displayOrder: 2,
    description: 'Company logos, vehicle insignias, and club emblems.',
  },
  {
    id: 'subcat-anime-keychains',
    name: 'Anime & Characters',
    slug: 'anime-keychains',
    parentId: 'cat-keychains',
    displayOrder: 3,
    description: 'Stylized 3D character charms and mini mascots.',
  },
  {
    id: 'subcat-bulk-keychains',
    name: 'Bulk Orders (10–100+ pcs)',
    slug: 'bulk-orders',
    parentId: 'cat-keychains',
    displayOrder: 4,
    description: 'High-volume batch runs for events, parties, and corporate gifting.',
  },
  {
    id: 'cat-home-living',
    name: 'Home & Living',
    slug: 'home-living',
    parentId: null,
    displayOrder: 5,
    description: 'Useful organizers, coasters, and functional home decor.',
    imageUrl: ASSETS.conceptCad,
    iconName: 'Home',
  },
  {
    id: 'cat-toys-edu',
    name: 'Toys & Educational',
    slug: 'toys-educational',
    parentId: null,
    displayOrder: 6,
    description: 'Articulated fidgets, puzzles, and scientific STEM kits.',
    imageUrl: ASSETS.dragonStl,
    iconName: 'Puzzle',
  },
  {
    id: 'cat-engineering',
    name: 'Engineering Parts',
    slug: 'engineering-parts',
    parentId: null,
    displayOrder: 7,
    description: 'Functional replacement components, gears, and rapid prototypes.',
    imageUrl: ASSETS.conceptCad,
    iconName: 'Cpu',
  },
  {
    id: 'cat-3d-models',
    name: '3D Models (Digital Files)',
    slug: '3d-models',
    parentId: null,
    displayOrder: 8,
    description: 'Curated printable STL & 3MF digital assets for download.',
    imageUrl: ASSETS.dragonStl,
    iconName: 'Box',
  },
];

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-spiral-pot',
    name: 'Modern Spiral Plant Pot',
    slug: 'modern-spiral-plant-pot',
    categoryId: 'cat-plant-pots',
    description: 'A stylish 3D printed plant pot with an elegant spiral design. Features internal drainage reservoir, perfect for home, office or gifting succulents and indoor plants.',
    basePrice: 199,
    currency: 'INR',
    coverImage: ASSETS.spiralPlantPot,
    galleryImages: [ASSETS.spiralPlantPot, ASSETS.conceptCad, ASSETS.heroPrinter],
    colors: [
      { name: 'Pure White', hex: '#ffffff' },
      { name: 'Matte Black', hex: '#1e293b' },
      { name: 'Forest Green', hex: '#15803d' },
      { name: 'Peach Coral', hex: '#fb923c' },
    ],
    sizes: [
      { label: 'Small (8 cm)', priceModifier: 0 },
      { label: 'Medium (10 cm)', priceModifier: 50 },
      { label: 'Large (14 cm)', priceModifier: 120 },
    ],
    printType: 'FDM',
    inStock: true,
    rating: 4.9,
    reviewCount: 28,
    isFeatured: true,
    occasionTags: ['wedding', 'corporate', 'return_gifts', 'home'],
    isDigital: false,
    bulkTiers: [
      { minQty: 5, maxQty: 14, unitPrice: 179, discountPercentage: 10 },
      { minQty: 15, maxQty: 49, unitPrice: 159, discountPercentage: 20 },
      { minQty: 50, maxQty: null, unitPrice: 139, discountPercentage: 30 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-moon-lamp',
    name: 'Moon Lamp with Wooden Stand',
    slug: 'moon-lamp-stand',
    categoryId: 'cat-lamps',
    description: 'High-detail 3D printed spherical moon lamp featuring accurate NASA topographic crater surface details. Includes geometric wooden tripod stand and warm ambient LED lighting.',
    basePrice: 499,
    currency: 'INR',
    coverImage: ASSETS.moonLamp,
    galleryImages: [ASSETS.moonLamp, ASSETS.heroPrinter],
    colors: [
      { name: 'Warm Moonlight', hex: '#fef3c7' },
      { name: 'Cool White', hex: '#f8fafc' },
      { name: 'Golden Amber', hex: '#f59e0b' },
    ],
    sizes: [
      { label: 'Compact 10cm', priceModifier: 0 },
      { label: 'Standard 15cm', priceModifier: 200 },
      { label: 'Statement 20cm', priceModifier: 450 },
    ],
    printType: 'FDM',
    inStock: true,
    rating: 5.0,
    reviewCount: 34,
    isFeatured: true,
    occasionTags: ['birthday', 'wedding', 'festivals'],
    isDigital: false,
    bulkTiers: [
      { minQty: 5, maxQty: 9, unitPrice: 449, discountPercentage: 10 },
      { minQty: 10, maxQty: null, unitPrice: 399, discountPercentage: 20 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-phone-stand',
    name: 'Adjustable Phone & Tablet Stand',
    slug: 'adjustable-phone-stand',
    categoryId: 'cat-phone-stands',
    description: 'Ergonomic dual-angle desktop mobile stand with integrated cable pass-through channel. Anti-slip weighted base engineered for stability during video calls and charging.',
    basePrice: 149,
    currency: 'INR',
    coverImage: ASSETS.phoneStand,
    galleryImages: [ASSETS.phoneStand, ASSETS.conceptCad],
    colors: [
      { name: 'Matte Black', hex: '#0f172a' },
      { name: 'Chalk White', hex: '#ffffff' },
      { name: 'Industrial Grey', hex: '#64748b' },
      { name: 'Flame Orange', hex: '#ea580c' },
    ],
    sizes: [
      { label: 'Standard Phone', priceModifier: 0 },
      { label: 'Tablet XL', priceModifier: 60 },
    ],
    printType: 'FDM',
    inStock: true,
    rating: 4.8,
    reviewCount: 42,
    isFeatured: true,
    occasionTags: ['corporate', 'return_gifts', 'office'],
    isDigital: false,
    bulkTiers: [
      { minQty: 10, maxQty: 24, unitPrice: 129, discountPercentage: 13 },
      { minQty: 25, maxQty: 99, unitPrice: 109, discountPercentage: 27 },
      { minQty: 100, maxQty: null, unitPrice: 89, discountPercentage: 40 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-custom-keychain',
    name: 'Custom Name Keychain',
    slug: 'custom-name-keychain',
    categoryId: 'cat-keychains',
    subcategoryId: 'subcat-name-keychains',
    description: 'Personalised dual-tone 3D printed name keychain. Printed using tough PETG/PLA with embossed custom lettering and heavy-duty steel keyring.',
    basePrice: 59,
    currency: 'INR',
    coverImage: ASSETS.keychain,
    galleryImages: [ASSETS.keychain, ASSETS.heroPrinter],
    colors: [
      { name: 'Red & White', hex: '#dc2626' },
      { name: 'Black & Gold', hex: '#18181b' },
      { name: 'Blue & White', hex: '#2563eb' },
      { name: 'Forest & Mint', hex: '#166534' },
    ],
    sizes: [
      { label: 'Standard Tag (6cm)', priceModifier: 0 },
      { label: 'Large Tag (8cm)', priceModifier: 15 },
    ],
    printType: 'FDM',
    inStock: true,
    rating: 4.9,
    reviewCount: 56,
    isFeatured: true,
    occasionTags: ['birthday', 'wedding', 'return_gifts', 'school', 'parties'],
    isDigital: false,
    bulkTiers: [
      { minQty: 10, maxQty: 24, unitPrice: 49.9, discountPercentage: 15 },
      { minQty: 25, maxQty: 49, unitPrice: 45.0, discountPercentage: 24 },
      { minQty: 50, maxQty: 99, unitPrice: 39.9, discountPercentage: 32 },
      { minQty: 100, maxQty: null, unitPrice: 34.9, discountPercentage: 41 },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-cake-topper',
    name: 'Custom Celebration Cake Topper',
    slug: 'custom-cake-topper',
    categoryId: 'cat-home-living',
    description: 'Food-safe 3D printed cake topper customized with names, age numbers, or celebration greetings for birthdays, anniversaries, and weddings.',
    basePrice: 99,
    currency: 'INR',
    coverImage: ASSETS.keychain,
    galleryImages: [ASSETS.keychain],
    colors: [
      { name: 'Metallic Gold', hex: '#eab308' },
      { name: 'Rose Pink', hex: '#f43f5e' },
      { name: 'Classic Black', hex: '#18181b' },
      { name: 'Glitter Blue', hex: '#0284c7' },
    ],
    sizes: [
      { label: 'Medium (15cm wide)', priceModifier: 0 },
      { label: 'Large (20cm wide)', priceModifier: 40 },
    ],
    printType: 'FDM',
    inStock: true,
    rating: 4.8,
    reviewCount: 19,
    isFeatured: false,
    occasionTags: ['birthday', 'wedding', 'parties'],
    isDigital: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-couple-name-plaque',
    name: 'Couple Name Plaque Stand',
    slug: 'couple-name-plaque',
    categoryId: 'cat-home-living',
    description: 'Elegant interlocking script name plaque with anniversary date. Perfect wedding or housewarming keepsake printed in silk dual-color filaments.',
    basePrice: 249,
    currency: 'INR',
    coverImage: ASSETS.eventGifting,
    galleryImages: [ASSETS.eventGifting],
    colors: [
      { name: 'Silk Gold & Walnut', hex: '#d97706' },
      { name: 'Silk Rose & White', hex: '#fb7185' },
    ],
    sizes: [
      { label: 'Standard 22cm', priceModifier: 0 },
      { label: 'Grand 30cm', priceModifier: 100 },
    ],
    printType: 'FDM',
    inStock: true,
    rating: 5.0,
    reviewCount: 22,
    isFeatured: false,
    occasionTags: ['wedding', 'parties'],
    isDigital: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-logo-keychain-bulk',
    name: 'Corporate Branded Logo Keychains (Batch of 50)',
    slug: 'corporate-logo-keychains-batch',
    categoryId: 'cat-keychains',
    subcategoryId: 'subcat-logo-keychains',
    description: 'Precision printed company logo keychains. Custom color matched to your company brand palette. Turnaround in 48 hours with bulk pack discount.',
    basePrice: 1999,
    currency: 'INR',
    coverImage: ASSETS.keychain,
    galleryImages: [ASSETS.keychain],
    colors: [
      { name: 'Brand Customized', hex: '#ea580c' },
    ],
    sizes: [
      { label: '50 Pieces Pack', priceModifier: 0 },
      { label: '100 Pieces Pack', priceModifier: 1500 },
    ],
    printType: 'FDM',
    inStock: true,
    rating: 4.9,
    reviewCount: 31,
    isFeatured: false,
    occasionTags: ['corporate', 'return_gifts'],
    isDigital: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  // Digital 3D Models (Downloadable STL)
  {
    id: 'prod-dragon-stl',
    name: 'Articulated Dragon Figurine (STL)',
    slug: 'articulated-dragon-stl',
    categoryId: 'cat-3d-models',
    description: 'Print-in-place articulated fantasy dragon. Smooth print tolerances calibrated for 0.4mm nozzle with zero assembly or supports required.',
    basePrice: 199,
    currency: 'INR',
    coverImage: ASSETS.dragonStl,
    galleryImages: [ASSETS.dragonStl],
    colors: [],
    sizes: [],
    printType: 'FDM',
    inStock: true,
    rating: 4.9,
    reviewCount: 47,
    isFeatured: true,
    occasionTags: ['toys', 'stem'],
    isDigital: true,
    digitalFormat: 'STL',
    fileSizeMb: 14.8,
    downloadUrl: '/api/models/download/dragon-articulated-v2.stl',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-gears-stl',
    name: 'Mechanical Planetary Gear Set (STL)',
    slug: 'mechanical-gear-set-stl',
    categoryId: 'cat-3d-models',
    description: 'High precision 4:1 ratio working planetary gear assembly. Ideal for mechanical demonstrations, desk toys, and engineering prototypes.',
    basePrice: 149,
    currency: 'INR',
    coverImage: ASSETS.conceptCad,
    galleryImages: [ASSETS.conceptCad],
    colors: [],
    sizes: [],
    printType: 'FDM',
    inStock: true,
    rating: 4.8,
    reviewCount: 16,
    isFeatured: true,
    occasionTags: ['engineering', 'stem'],
    isDigital: true,
    digitalFormat: 'STL',
    fileSizeMb: 9.2,
    downloadUrl: '/api/models/download/planetary-gear-set.stl',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-octopus-stl',
    name: 'Articulated Octopus Desk Toy (STL)',
    slug: 'articulated-octopus-stl',
    categoryId: 'cat-3d-models',
    description: 'Popular flexible multi-joint articulated octopus. Prints support-free in a single pass on both FDM and SLA resin 3D printers.',
    basePrice: 199,
    currency: 'INR',
    coverImage: ASSETS.dragonStl,
    galleryImages: [ASSETS.dragonStl],
    colors: [],
    sizes: [],
    printType: 'BOTH',
    inStock: true,
    rating: 5.0,
    reviewCount: 68,
    isFeatured: true,
    occasionTags: ['toys', 'birthday'],
    isDigital: true,
    digitalFormat: 'STL',
    fileSizeMb: 11.5,
    downloadUrl: '/api/models/download/articulated-octopus.stl',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-organizer-stl',
    name: 'Modular Interlocking Desk Organizer (STL)',
    slug: 'modular-organizer-stl',
    categoryId: 'cat-3d-models',
    description: 'Gridfinity compatible modular desk drawer organizer set. Includes pen trays, SD card holders, and hardware parts bins.',
    basePrice: 129,
    currency: 'INR',
    coverImage: ASSETS.conceptCad,
    galleryImages: [ASSETS.conceptCad],
    colors: [],
    sizes: [],
    printType: 'FDM',
    inStock: true,
    rating: 4.7,
    reviewCount: 23,
    isFeatured: true,
    occasionTags: ['corporate', 'home'],
    isDigital: true,
    digitalFormat: 'STL',
    fileSizeMb: 8.4,
    downloadUrl: '/api/models/download/modular-organizer-grid.stl',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const DEFAULT_PARAMETRIC_TOOLS: ParametricTool[] = [
  {
    id: 'tool-gridfinity',
    title: 'Parametric Gridfinity Bin Generator',
    description: 'Generate customized drawer organizers with exact compartment width, depth, and divider slots directly on MakerWorld.',
    makerWorldUrl: 'https://makerworld.com/en/models/parametric-gridfinity',
    category: 'Organizers',
    badge: 'MakerWorld Official',
    thumbnail: ASSETS.conceptCad,
  },
  {
    id: 'tool-lithophane',
    title: 'Custom Curved Lithophane Lamp Creator',
    description: 'Transform any family photo into a custom backlit 3D curved lithophane shade with calibrated layer thickness.',
    makerWorldUrl: 'https://makerworld.com/en/models/parametric-lithophane',
    category: 'Lighting',
    badge: 'Popular',
    thumbnail: ASSETS.moonLamp,
  },
  {
    id: 'tool-threaded-fastener',
    title: 'Parametric ISO Threaded Nut & Bolt Generator',
    description: 'Create functional M3 to M20 metric screws, hex nuts, and threaded connectors with custom pitch and tolerance offsets.',
    makerWorldUrl: 'https://makerworld.com/en/models/parametric-fasteners',
    category: 'Engineering',
    badge: 'Engineering',
    thumbnail: ASSETS.conceptCad,
  },
  {
    id: 'tool-voronoi-vase',
    title: 'Voronoi Organic Vase & Pen Pot Designer',
    description: 'Interactive parametric tool to generate organic Voronoi cellular structures with adjustable wall thickness and density.',
    makerWorldUrl: 'https://makerworld.com/en/models/parametric-voronoi',
    category: 'Home & Decor',
    badge: 'Trending',
    thumbnail: ASSETS.spiralPlantPot,
  },
];

const DEFAULT_SETTINGS: SiteSettings = {
  brandName: 'Maker Tank 3D',
  tagline: 'Print • Design • Create',
  logoUrl: '',
  logoText: 'MAKER TANK 3D',
  logoSubtitle: 'PRINT • DESIGN • CREATE',
  logoColor: '#22c55e',
  primaryColor: '#22c55e',
  primaryHoverColor: '#16a34a',
  buttonTextColor: '#ffffff',
  buttonRadius: 'rounded-xl',
  interfaceTheme: 'light',
  heroHeadline: 'Your Ideas, Printed for Real Life.',
  heroSubheadline: 'Custom 3D printing, personalised gifts, functional parts and innovative designs for every occasion.',
  announcementText: '✨ Bulk discount up to 40% on custom keychains & return gifts! Fast delivery across India.',
  whatsappNumber: '+919876543210',
  contactEmail: 'hello@makertank3d.com',
  phoneNumber: '+91 98765 43210',
  address: 'Studio 4, Innovation Tech Hub, Industrial Layout, Bangalore, India',
  instagramUrl: 'https://instagram.com/makertank3d',
  youtubeUrl: 'https://youtube.com/@makertank3d',

  // Section configs
  heroBadge: 'IDEAS • DESIGNS • FUNCTIONAL PARTS',
  heroPrimaryBtnText: 'Explore Products',
  heroPrimaryBtnLink: 'shop',
  heroSecondaryBtnText: 'Custom CAD & Print',
  heroSecondaryBtnLink: 'custom',
  heroImage: ASSETS.heroPrinter,
  heroImageTag: 'Bambu Lab CoreXY Studio',
  heroImageSubtag: '0.08mm layer precision · Multi-color ready',

  categoriesTitle: 'Shop by Category',
  categoriesSubtitle: 'Explore our curated collection of ready-to-order 3D printed items.',
  showCategoriesSection: true,

  eventsTitle: 'Shop by Event',
  eventsSubtitle: 'Find the perfect return gifts and customised items for every special occasion.',
  showEventsSection: true,

  conceptTag: 'Custom Engineering & Prototyping',
  conceptTitle: 'From a concept to a finished product.',
  conceptDescription: 'We design and 3D print custom models, prototypes, replacement parts and personalised products using industrial FDM and SLA resin technology.',
  conceptBtnText: 'Discuss Your Project',
  conceptBtnLink: 'custom',
  conceptImage: ASSETS.conceptCad,
  showConceptSection: true,

  featuredTitle: 'Featured Products',
  featuredSubtitle: 'Popular designs, ready to be customized and printed for you.',
  showFeaturedSection: true,

  modelsTitle: '3D Models (Digital Files)',
  modelsSubtitle: 'Download and 3D print curated STL and 3MF models on your own machine.',
  showModelsSection: true,

  whyChooseTitle: 'Why Choose Maker Tank 3D?',
  whyChooseSubtitle: 'Engineered with precision hardware, premium filaments, and rapid delivery.',
  showWhyChooseSection: true,

  eventsBannerTag: 'SPECIAL OCCASIONS & BULK RETURN GIFTS',
  eventsBannerTitle: 'Unique 3D Printed Gifts for Every Event',
  eventsBannerSubtitle: 'Make every moment memorable. Customise name keychains, cake toppers, corporate logo stands, and bulk gift boxes with tailored color palettes.',
  eventsBannerImage: ASSETS.eventGifting,
  eventsBannerBtnText: 'Request Custom Occasion Batch',
  eventsBannerBtnLink: 'custom',

  birthdaySectionTitle: 'Popular Picks for Birthdays',
  weddingSectionTitle: 'Popular Picks for Weddings',
  corporateSectionTitle: 'Popular Picks for Office & Corporate',
};

// Helper: Salted PBKDF2 Password Hashing
export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

// Database Service with atomic JSON storage
class DatabaseService {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDataDir();
    this.db = this.loadDatabase();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          categories: parsed.categories || DEFAULT_CATEGORIES,
          products: parsed.products || DEFAULT_PRODUCTS,
          enquiries: parsed.enquiries || [],
          messages: parsed.messages || [],
          parametricTools: parsed.parametricTools || DEFAULT_PARAMETRIC_TOOLS,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          adminCredentials: parsed.adminCredentials || this.createDefaultAdmin(),
        };
      } catch (err) {
        console.error('Error parsing database.json, initializing defaults:', err);
      }
    }

    const initial: DatabaseSchema = {
      categories: DEFAULT_CATEGORIES,
      products: DEFAULT_PRODUCTS,
      enquiries: [],
      messages: [],
      parametricTools: DEFAULT_PARAMETRIC_TOOLS,
      settings: DEFAULT_SETTINGS,
      adminCredentials: this.createDefaultAdmin(),
    };
    this.saveDatabase(initial);
    return initial;
  }

  private createDefaultAdmin() {
    // Default admin credentials: admin / Makertop16@16
    const { hash, salt } = hashPassword('Makertop16@16');
    return {
      username: 'admin',
      passwordHash: hash,
      salt,
    };
  }

  private saveDatabase(data: DatabaseSchema) {
    this.ensureDataDir();
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  }

  // --- Products ---
  getProducts(): Product[] {
    return this.db.products;
  }

  getProductById(id: string): Product | undefined {
    return this.db.products.find(p => p.id === id);
  }

  createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...data,
      id: `prod-${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.db.products.unshift(newProduct);
    this.saveDatabase(this.db);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.db.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    const updated = {
      ...this.db.products[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.db.products[index] = updated;
    this.saveDatabase(this.db);
    return updated;
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.db.products.length;
    this.db.products = this.db.products.filter(p => p.id !== id);
    if (this.db.products.length !== initialLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.db.categories.sort((a, b) => a.displayOrder - b.displayOrder);
  }

  createCategory(data: Omit<Category, 'id'>): Category {
    const newCategory: Category = {
      ...data,
      id: `cat-${crypto.randomUUID().slice(0, 8)}`,
    };
    this.db.categories.push(newCategory);
    this.saveDatabase(this.db);
    return newCategory;
  }

  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const index = this.db.categories.findIndex(c => c.id === id);
    if (index === -1) return null;
    const updated = { ...this.db.categories[index], ...updates };
    this.db.categories[index] = updated;
    this.saveDatabase(this.db);
    return updated;
  }

  deleteCategory(id: string): boolean {
    const initialLen = this.db.categories.length;
    this.db.categories = this.db.categories.filter(c => c.id !== id && c.parentId !== id);
    if (this.db.categories.length !== initialLen) {
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  reorderCategories(orderedIds: string[]): Category[] {
    orderedIds.forEach((id, index) => {
      const cat = this.db.categories.find(c => c.id === id);
      if (cat) cat.displayOrder = index + 1;
    });
    this.saveDatabase(this.db);
    return this.getCategories();
  }

  // --- Enquiries & Messages ---
  getEnquiries(): CustomEnquiry[] {
    return this.db.enquiries;
  }

  createEnquiry(data: Omit<CustomEnquiry, 'id' | 'createdAt' | 'status'>): CustomEnquiry {
    const enquiry: CustomEnquiry = {
      ...data,
      id: `enq-${crypto.randomUUID().slice(0, 8)}`,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    this.db.enquiries.unshift(enquiry);
    this.saveDatabase(this.db);
    return enquiry;
  }

  updateEnquiryStatus(id: string, status: CustomEnquiry['status']): boolean {
    const enq = this.db.enquiries.find(e => e.id === id);
    if (enq) {
      enq.status = status;
      this.saveDatabase(this.db);
      return true;
    }
    return false;
  }

  getMessages(): ContactMessage[] {
    return this.db.messages;
  }

  createMessage(data: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>): ContactMessage {
    const message: ContactMessage = {
      ...data,
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.db.messages.unshift(message);
    this.saveDatabase(this.db);
    return message;
  }

  // --- Parametric Tools ---
  getParametricTools(): ParametricTool[] {
    return this.db.parametricTools;
  }

  // --- Site Settings ---
  getSettings(): SiteSettings {
    return this.db.settings;
  }

  updateSettings(updates: Partial<SiteSettings>): SiteSettings {
    this.db.settings = { ...this.db.settings, ...updates };
    this.saveDatabase(this.db);
    return this.db.settings;
  }

  // --- Admin Authentication ---
  verifyAdmin(password: string, username?: string): boolean {
    const { username: dbUsername, passwordHash, salt } = this.db.adminCredentials;
    if (username && username.trim().toLowerCase() !== (dbUsername || 'admin').toLowerCase()) {
      return false;
    }
    return verifyPassword(password, passwordHash, salt);
  }

  updateAdminPassword(newPassword: string): void {
    const { hash, salt } = hashPassword(newPassword);
    this.db.adminCredentials.passwordHash = hash;
    this.db.adminCredentials.salt = salt;
    this.saveDatabase(this.db);
  }
}

export const db = new DatabaseService();
