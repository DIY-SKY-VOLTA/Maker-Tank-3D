import type {
  Product,
  Category,
  CustomEnquiry,
  ContactMessage,
  ParametricTool,
  SiteSettings,
} from '../types/index.ts';

const API_BASE = '/api';

function handleApiResponseError(res: Response, defaultMessage: string): never {
  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('admin-session-expired'));
    }
  }
  throw new Error(defaultMessage);
}

export const api = {
  // Settings
  async getSettings(): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) handleApiResponseError(res, 'Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<SiteSettings>, token: string): Promise<SiteSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(settings),
    });
    if (!res.ok) handleApiResponseError(res, 'Failed to update settings');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async createCategory(cat: Omit<Category, 'id'>, token: string): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cat),
    });
    if (!res.ok) throw new Error('Failed to create category');
    return res.json();
  },

  async updateCategory(id: string, updates: Partial<Category>, token: string): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) handleApiResponseError(res, 'Failed to update category');
    return res.json();
  },

  async deleteCategory(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) handleApiResponseError(res, 'Failed to delete category');
  },

  async reorderCategories(orderedIds: string[], token: string): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories/reorder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) handleApiResponseError(res, 'Failed to reorder categories');
    return res.json();
  },

  // Products
  async getProducts(params?: {
    category?: string;
    event?: string;
    search?: string;
    featured?: boolean;
    digital?: boolean;
  }): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.event) query.set('event', params.event);
    if (params?.search) query.set('search', params.search);
    if (params?.featured) query.set('featured', 'true');
    if (params?.digital) query.set('digital', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, token: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    if (!res.ok) handleApiResponseError(res, 'Failed to create product');
    return res.json();
  },

  async updateProduct(id: string, updates: Partial<Product>, token: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) handleApiResponseError(res, 'Failed to update product');
    return res.json();
  },

  async deleteProduct(id: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to delete product');
  },

  // Cart Server Validation
  async validateCart(items: any[]): Promise<{ valid: boolean; items: any[]; totals: any }> {
    const res = await fetch(`${API_BASE}/cart/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error('Failed to validate cart');
    return res.json();
  },

  // File Upload
  async uploadFile(file: File): Promise<{ url: string; filename: string; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload file');
    }
    return res.json();
  },

  // Enquiries & Contact
  async submitCustomEnquiry(data: {
    customerName: string;
    customerEmail?: string;
    customerPhone: string;
    projectDetails: string;
    technology?: string;
    materialPreference?: string;
    fileUrls?: string[];
  }): Promise<{ success: boolean; enquiry: CustomEnquiry }> {
    const res = await fetch(`${API_BASE}/custom-enquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit enquiry');
    }
    return res.json();
  },

  async submitContact(data: {
    name: string;
    email: string;
    phone?: string;
    subject?: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  // Parametric Tools
  async getParametricTools(): Promise<ParametricTool[]> {
    const res = await fetch(`${API_BASE}/parametric-tools`);
    if (!res.ok) throw new Error('Failed to fetch parametric tools');
    return res.json();
  },

  // Admin
  async adminLogin(password: string, username?: string): Promise<{ success: boolean; token: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, username: username || undefined }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Authentication failed');
    }
    return res.json();
  },

  async getAdminEnquiries(token: string): Promise<CustomEnquiry[]> {
    const res = await fetch(`${API_BASE}/admin/enquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch enquiries');
    return res.json();
  },

  async updateEnquiryStatus(id: string, status: string, token: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/enquiries/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update enquiry status');
  },

  async getAdminMessages(token: string): Promise<ContactMessage[]> {
    const res = await fetch(`${API_BASE}/admin/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },
};
