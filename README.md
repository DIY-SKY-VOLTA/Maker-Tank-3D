# Maker Tank 3D 🚀

> **Industrial-grade 3D printing, parametric workshop, and e-commerce platform.**  
> Featuring on-demand rapid prototyping, custom parametric tools, bulk manufacturing, an instant quoting calculator, and an integrated in-place visual content & image editor.

---

## ✨ Features

- **🛍️ Complete E-Commerce Store**:
  - Filterable catalog by category and subcategory (Mechanical, Prototypes, Miniatures, Cosplay, Architecture, Spare Parts).
  - Configurable bulk tier pricing (1-4 pcs, 5-19 pcs, 20-49 pcs, 50+ pcs).
  - High-res product galleries and technical spec sheets (infill, materials, tolerances).
  - Fast, responsive slide-out cart drawer and instant checkout flow.

- **✏️ Live In-Place Visual Editor & Image Replacement**:
  - Click **"Edit Website"** in the header to activate inline editing.
  - Edit any text directly on the page (headlines, badges, descriptions, contact info).
  - Hover over any image to upload a new file from your device or paste an image URL with instant live preview.
  - Quick product editor modal to adjust inventory, prices, descriptions, and media on the fly.

- **📐 Parametric 3D Configurator Tools**:
  - Interactive browser-based generators for custom spur gears, electronics project enclosures, threaded metric screws/bolts, and pipe adapters.
  - Live dimensional calculations, bounding box previews, and direct order configuration.

- **⚡ Instant 3D Print Quote Engine**:
  - Interactive quoting calculator with material selection (PLA, PETG, ABS, TPU, Carbon Fiber Nylon, Resin).
  - Technology breakdown: FDM, SLA / Resin, SLS, and MJF.
  - Multi-file drag & drop file upload support (STL, OBJ, STEP, 3MF).

- **🔐 Administrator Control Panel**:
  - Comprehensive dashboard for inventory management (Add/Edit/Delete products).
  - Category manager with custom ordering and subcategories.
  - Live production queue & custom fabrication quote enquiries tracker.
  - Customer contact inquiry management.
  - Global site settings (branding, hero banners, contact info, announcement bars).
  - Secure authenticated staff access.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React Icons
- **Backend / API**: Node.js, Express.js, Multer (file uploads)
- **Bundler & Tooling**: Vite 6, TSX, TypeScript
- **Database**: Local high-speed persistent JSON volume (`/data/database.json`) with zero external DB dependencies required for instant boot.

---

## 🚀 Quick Start

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed.

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/maker-tank-3d.git

# Navigate to project directory
cd maker-tank-3d

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── data/                    # Database storage (database.json)
├── server/                  # Backend Express routes & database access
│   └── db.ts                # Data storage engine & mock seeding
├── server.ts                # Express server with Vite middleware
├── src/
│   ├── components/
│   │   ├── admin/           # Admin Control Panel & subviews
│   │   ├── configurator/    # Parametric 3D tools (Gears, Enclosures, Screws)
│   │   ├── inline-editor/   # In-place visual editor, image uploader & toolbar
│   │   ├── layout/          # Header, Footer, Announcement Bar
│   │   ├── store/           # Product cards, modal detail, cart drawer
│   │   └── views/           # HomeView, ShopView, EventsView, QuoteView, etc.
│   ├── context/             # StoreContext, CartContext, AuthContext
│   ├── services/            # Client API client (fetch wrapper)
│   └── types/               # TypeScript definitions
├── uploads/                 # Uploaded image and model assets
├── package.json             # Scripts & dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite + Tailwind configuration
```

---

## 🌐 Deploying to the Cloud

### Render / Railway / Fly.io (Recommended for Full-Stack)
1. Push this repository to your GitHub account.
2. Link your GitHub repository in [Render](https://render.com) or [Railway](https://railway.app).
3. Set the build and start commands:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `PORT=3000` (or host-assigned)

---

## 📄 License
MIT License. Free to use for personal and commercial projects.
