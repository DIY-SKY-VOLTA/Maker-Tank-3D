export interface BulkTier {
  minQty: number;
  maxQty: number | null;
  unitPrice?: number;
  discountPercentage?: number;
}

export interface ProductVariantColor {
  name: string;
  hex: string;
}

export interface ProductVariantSize {
  label: string;
  priceModifier: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  subcategoryId?: string;
  description: string;
  basePrice: number;
  currency: string;
  coverImage: string;
  galleryImages: string[];
  colors: ProductVariantColor[];
  sizes: ProductVariantSize[];
  printType: 'FDM' | 'SLA' | 'BOTH';
  inStock: boolean;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  occasionTags: string[]; // e.g. 'birthday', 'wedding', 'corporate', 'return_gifts', 'festivals', 'school', 'baby'
  isDigital: boolean;
  digitalFormat?: 'STL' | '3MF' | 'OBJ';
  fileSizeMb?: number;
  downloadUrl?: string;
  bulkTiers?: BulkTier[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  displayOrder: number;
  description?: string;
  imageUrl?: string;
  iconName?: string;
}

export interface CustomEnquiry {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  projectDetails: string;
  technology: 'FDM' | 'SLA' | 'CAD Design' | 'Unsure';
  materialPreference: string;
  fileUrls: string[];
  status: 'new' | 'reviewed' | 'quoted' | 'completed';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ParametricTool {
  id: string;
  title: string;
  description: string;
  makerWorldUrl: string;
  category: string;
  badge?: string;
  thumbnail: string;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  logoUrl?: string;
  logoText?: string;
  logoSubtitle?: string;
  logoColor?: string;
  primaryColor?: string;
  primaryHoverColor?: string;
  buttonTextColor?: string;
  buttonRadius?: 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-full';
  interfaceTheme?: 'light' | 'dark-nav' | 'slate';
  heroHeadline: string;
  heroSubheadline: string;
  announcementText: string;
  whatsappNumber: string;
  contactEmail: string;
  phoneNumber: string;
  address: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  githubUrl?: string;

  // In-place editable section configurations
  heroBadge?: string;
  heroPrimaryBtnText?: string;
  heroPrimaryBtnLink?: string;
  heroSecondaryBtnText?: string;
  heroSecondaryBtnLink?: string;
  heroImage?: string;
  heroImageTag?: string;
  heroImageSubtag?: string;

  categoriesTitle?: string;
  categoriesSubtitle?: string;
  showCategoriesSection?: boolean;

  eventsTitle?: string;
  eventsSubtitle?: string;
  showEventsSection?: boolean;

  conceptTag?: string;
  conceptTitle?: string;
  conceptDescription?: string;
  conceptBtnText?: string;
  conceptBtnLink?: string;
  conceptImage?: string;
  showConceptSection?: boolean;

  featuredTitle?: string;
  featuredSubtitle?: string;
  showFeaturedSection?: boolean;

  modelsTitle?: string;
  modelsSubtitle?: string;
  showModelsSection?: boolean;

  whyChooseTitle?: string;
  whyChooseSubtitle?: string;
  showWhyChooseSection?: boolean;

  eventsBannerTag?: string;
  eventsBannerTitle?: string;
  eventsBannerSubtitle?: string;
  eventsBannerImage?: string;
  eventsBannerBtnText?: string;
  eventsBannerBtnLink?: string;

  birthdaySectionTitle?: string;
  weddingSectionTitle?: string;
  corporateSectionTitle?: string;
}

