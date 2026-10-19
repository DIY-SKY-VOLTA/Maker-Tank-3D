import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Package,
  FolderTree,
  Inbox,
  Settings,
  Plus,
  Trash2,
  Edit2,
  UploadCloud,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Lock,
  LogOut,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  Save,
  Palette,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../services/api.ts';
import type { Product, Category, CustomEnquiry, ContactMessage, BulkTier } from '../../types/index.ts';
import { BrandingThemeModal } from '../inline-editor/BrandingThemeModal.tsx';

export const AdminView: React.FC = () => {
  const { isAuthenticated, token, login, logout, error: authError } = useAuth();
  const { products, categories, settings, refreshCatalog, updateSettingsState } = useStore();

  const [usernameInput, setUsernameInput] = useState('admin');
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'enquiries' | 'messages' | 'content'>('products');

  // Enquiries & Messages data
  const [enquiries, setEnquiries] = useState<CustomEnquiry[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Product Form State (Modal)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatParentId, setNewCatParentId] = useState<string>('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Site Content State
  const [contentForm, setContentForm] = useState({
    heroHeadline: settings?.heroHeadline || '',
    heroSubheadline: settings?.heroSubheadline || '',
    announcementText: settings?.announcementText || '',
    whatsappNumber: settings?.whatsappNumber || '',
    contactEmail: settings?.contactEmail || '',
    phoneNumber: settings?.phoneNumber || '',
    address: settings?.address || '',
  });

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync settings when loaded
  useEffect(() => {
    if (settings) {
      setContentForm({
        heroHeadline: settings.heroHeadline,
        heroSubheadline: settings.heroSubheadline,
        announcementText: settings.announcementText,
        whatsappNumber: settings.whatsappNumber,
        contactEmail: settings.contactEmail,
        phoneNumber: settings.phoneNumber,
        address: settings.address,
      });
    }
  }, [settings]);

  // Load enquiries & messages if authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      loadAdminData();
    }
  }, [isAuthenticated, token]);

  const loadAdminData = async () => {
    if (!token) return;
    try {
      setLoadingData(true);
      const [enqs, msgs] = await Promise.all([
        api.getAdminEnquiries(token).catch(() => []),
        api.getAdminMessages(token).catch(() => []),
      ]);
      setEnquiries(enqs);
      setMessages(msgs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(passwordInput, usernameInput);
    setPasswordInput('');
  };

  // --- Product CRUD ---
  const handleOpenNewProduct = () => {
    setEditingProduct({
      id: '',
      name: '',
      slug: '',
      categoryId: categories[0]?.id || 'cat-plant-pots',
      description: '',
      basePrice: 199,
      currency: 'INR',
      coverImage: '',
      galleryImages: [],
      colors: [{ name: 'Default', hex: '#1e293b' }],
      sizes: [{ label: 'Standard', priceModifier: 0 }],
      printType: 'FDM',
      inStock: true,
      rating: 5.0,
      reviewCount: 1,
      isFeatured: false,
      occasionTags: [],
      isDigital: false,
      bulkTiers: [
        { minQty: 10, maxQty: 24, unitPrice: 169, discountPercentage: 15 },
        { minQty: 25, maxQty: null, unitPrice: 149, discountPercentage: 25 },
      ],
      createdAt: '',
      updatedAt: '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !token) return;

    try {
      if (editingProduct.id) {
        await api.updateProduct(editingProduct.id, editingProduct, token);
        setStatusMessage(`Updated product: ${editingProduct.name}`);
      } else {
        const { id, createdAt, updatedAt, ...rest } = editingProduct;
        await api.createProduct(rest, token);
        setStatusMessage(`Created product: ${editingProduct.name}`);
      }
      await refreshCatalog();
      setIsProductModalOpen(false);
    } catch (err: any) {
      alert(`Error saving product: ${err.message}`);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!token) return;
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await api.deleteProduct(id, token);
        await refreshCatalog();
        setStatusMessage(`Deleted product: ${name}`);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // --- Category CRUD & Reorder ---
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName || !newCatSlug || !token) return;

    try {
      await api.createCategory(
        {
          name: newCatName,
          slug: newCatSlug,
          parentId: newCatParentId || null,
          displayOrder: categories.length + 1,
          description: 'New category for Maker Tank 3D',
        },
        token
      );
      setNewCatName('');
      setNewCatSlug('');
      setNewCatParentId('');
      await refreshCatalog();
      setStatusMessage('Category created successfully');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveCategoryName = async (id: string) => {
    if (!token || !editingCategoryName.trim()) return;
    try {
      await api.updateCategory(id, { name: editingCategoryName }, token);
      setEditingCategoryId(null);
      await refreshCatalog();
      setStatusMessage('Category updated');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!token) return;
    if (confirm(`Delete category "${name}"? Subcategories will also be removed.`)) {
      try {
        await api.deleteCategory(id, token);
        await refreshCatalog();
        setStatusMessage(`Category "${name}" deleted`);
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleMoveCategory = async (index: number, direction: 'up' | 'down') => {
    if (!token) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newOrder = [...categories];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    try {
      await api.reorderCategories(newOrder.map(c => c.id), token);
      await refreshCatalog();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- Enquiry Status Update ---
  const handleUpdateEnquiryStatus = async (id: string, status: string) => {
    if (!token) return;
    try {
      await api.updateEnquiryStatus(id, status, token);
      setEnquiries(prev => prev.map(e => (e.id === id ? { ...e, status: status as any } : e)));
      setStatusMessage('Enquiry status updated');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // --- Save Site Content ---
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    try {
      const updated = await api.updateSettings(contentForm, token);
      updateSettingsState(updated);
      setStatusMessage('Homepage content & settings saved successfully!');
    } catch (e: any) {
      alert(e.message);
    }
  };

  // 1. LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
          <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6 text-orange-500" />
          </div>

          <div>
            <h1 className="text-xl font-extrabold text-slate-950">
              Admin Authentication
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to manage catalog, categories, pricing tiers &amp; orders.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs mt-2"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-950">
              Maker Tank 3D Admin
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full administrative control over products, nested categories, custom quotes, and site content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            title="Customize Logo, Brand Text, Button & Interface Colors"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Customize Logo &amp; Colors</span>
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs rounded-xl flex items-center justify-between">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-emerald-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'products'
              ? 'bg-slate-950 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'categories'
              ? 'bg-slate-950 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Categories &amp; Hierarchy ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'enquiries'
              ? 'bg-slate-950 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Custom Enquiries ({enquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'messages'
              ? 'bg-slate-950 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Contact Messages ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'content'
              ? 'bg-slate-950 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Homepage Content &amp; WhatsApp</span>
        </button>
      </div>

      {/* ================= TAB 1: PRODUCTS ================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-800">
              Manage Catalog Products &amp; Bulk Pricing
            </h2>
            <button
              onClick={handleOpenNewProduct}
              className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Product</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Base Price</th>
                    <th className="p-3">Bulk Tiers</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Featured</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => {
                    const cat = categories.find(c => c.id === p.categoryId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-slate-100 p-0.5 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center">
                              {p.coverImage && (
                                <img src={p.coverImage} alt={p.name} className="w-full h-full object-contain" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{p.name}</div>
                              <div className="text-[10px] text-slate-600 font-mono">ID: {p.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-slate-600 font-medium">
                          {cat?.name || 'Unassigned'}
                        </td>
                        <td className="p-3 font-bold font-mono text-slate-900">
                          ₹{p.basePrice}
                        </td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">
                          {p.bulkTiers && p.bulkTiers.length > 0 ? (
                            <span className="text-emerald-700 font-semibold">
                              {p.bulkTiers.length} tier(s) configured
                            </span>
                          ) : (
                            <span className="text-slate-600">None</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold">
                            {p.isDigital ? 'STL FILE' : p.printType}
                          </span>
                        </td>
                        <td className="p-3">
                          {p.isFeatured ? (
                            <span className="text-orange-600 font-bold">★ Yes</span>
                          ) : (
                            <span className="text-slate-600">No</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setEditingProduct({ ...p });
                                setIsProductModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
                              title="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id, p.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded"
                              title="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CATEGORIES & HIERARCHY ================= */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add Category Form */}
          <div className="lg:col-span-4 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Add New Category or Subcategory</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={e => {
                    setNewCatName(e.target.value);
                    if (!newCatSlug) {
                      setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                    }
                  }}
                  placeholder="e.g. Lithophanes"
                  required
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Slug (URL friendly) *</label>
                <input
                  type="text"
                  value={newCatSlug}
                  onChange={e => setNewCatSlug(e.target.value)}
                  placeholder="lithophanes"
                  required
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Parent Category (For Subcategories)</label>
                <select
                  value={newCatParentId}
                  onChange={e => setNewCatParentId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  <option value="">None (Top-Level Primary Category)</option>
                  {categories
                    .filter(c => !c.parentId)
                    .map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* Category List with Reordering & Hierarchy */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Category Ordering &amp; Hierarchy</h3>
            <div className="space-y-2">
              {categories.map((cat, idx) => {
                const isSub = !!cat.parentId;
                const parent = categories.find(c => c.id === cat.parentId);

                return (
                  <div
                    key={cat.id}
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                      isSub ? 'ml-6 bg-slate-50 border-dashed border-slate-300' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-mono text-slate-600 font-bold">
                        #{cat.displayOrder || idx + 1}
                      </span>
                      {editingCategoryId === cat.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={e => setEditingCategoryName(e.target.value)}
                            className="px-2 py-0.5 text-xs border border-orange-500 rounded bg-white"
                          />
                          <button
                            onClick={() => handleSaveCategoryName(cat.id)}
                            className="text-emerald-600 font-bold text-xs"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategoryId(null)}
                            className="text-slate-400 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-bold text-slate-900">{cat.name}</span>
                          {parent && (
                            <span className="text-[10px] text-slate-500 ml-2">
                              (Under: {parent.name})
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveCategory(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveCategory(idx, 'down')}
                        disabled={idx === categories.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-900 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingCategoryId(cat.id);
                          setEditingCategoryName(cat.name);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-900"
                        title="Rename"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CUSTOM ENQUIRIES ================= */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Custom CAD &amp; 3D Print Quote Requests</h3>
            <button onClick={loadAdminData} className="text-xs text-orange-600 font-semibold hover:underline">
              Refresh Enquiries
            </button>
          </div>

          {enquiries.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No custom quote enquiries submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {enquiries.map(enq => (
                <div key={enq.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{enq.customerName}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <a
                        href={`https://wa.me/${enq.customerPhone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-emerald-600 font-bold hover:underline"
                      >
                        📞 {enq.customerPhone}
                      </a>
                      {enq.customerEmail && (
                        <span className="text-xs text-slate-500">({enq.customerEmail})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </span>
                      <select
                        value={enq.status}
                        onChange={e => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                        className="px-2 py-1 text-[11px] font-bold border border-slate-300 rounded bg-white"
                      >
                        <option value="new">Status: New</option>
                        <option value="reviewed">Status: Reviewed</option>
                        <option value="quoted">Status: Quoted</option>
                        <option value="completed">Status: Completed</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
                    {enq.projectDetails}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span>Tech: <strong className="text-slate-800">{enq.technology}</strong></span>
                    <span>·</span>
                    <span>Material: <strong className="text-slate-800">{enq.materialPreference}</strong></span>
                    {enq.fileUrls && enq.fileUrls.length > 0 && (
                      <>
                        <span>·</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600">Attached Files:</span>
                          {enq.fileUrls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                              <span>File {i + 1}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: CONTACT MESSAGES ================= */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Contact Form Inbox</h3>
          {messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No contact messages received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{msg.name}</span>
                      <span className="text-slate-400 ml-2">&lt;{msg.email}&gt;</span>
                      {msg.phone && <span className="text-slate-500 ml-2">Phone: {msg.phone}</span>}
                    </div>
                    <span className="text-slate-400 text-[10px]">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {msg.subject && (
                    <div className="text-xs font-semibold text-slate-800">
                      Subject: {msg.subject}
                    </div>
                  )}
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: HOMEPAGE CONTENT & SETTINGS ================= */}
      {activeTab === 'content' && (
        <form onSubmit={handleSaveContent} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5 max-w-2xl">
          <h3 className="text-sm font-bold text-slate-900">Edit Homepage Content &amp; WhatsApp Settings</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Hero Main Headline</label>
              <input
                type="text"
                value={contentForm.heroHeadline}
                onChange={e => setContentForm({ ...contentForm, heroHeadline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Hero Subheadline</label>
              <textarea
                value={contentForm.heroSubheadline}
                onChange={e => setContentForm({ ...contentForm, heroSubheadline: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Top Announcement Strip Text</label>
              <input
                type="text"
                value={contentForm.announcementText}
                onChange={e => setContentForm({ ...contentForm, announcementText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-800 mb-1">WhatsApp Business Number (with country code)</label>
                <input
                  type="text"
                  value={contentForm.whatsappNumber}
                  onChange={e => setContentForm({ ...contentForm, whatsappNumber: e.target.value })}
                  placeholder="+919876543210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Contact Email</label>
                <input
                  type="email"
                  value={contentForm.contactEmail}
                  onChange={e => setContentForm({ ...contentForm, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Physical Workshop Address</label>
              <input
                type="text"
                value={contentForm.address}
                onChange={e => setContentForm({ ...contentForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </form>
      )}

      {/* ================= PRODUCT EDIT MODAL ================= */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <h3 className="text-sm font-extrabold text-slate-950">
                {editingProduct.id ? `Edit Product: ${editingProduct.name}` : 'Add New Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Product Name *</label>
                  <input
                    type="text"
                    value={editingProduct.name}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category *</label>
                  <select
                    value={editingProduct.categoryId}
                    onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Base Price (INR ₹) *</label>
                  <input
                    type="number"
                    value={editingProduct.basePrice}
                    onChange={e => setEditingProduct({ ...editingProduct, basePrice: parseInt(e.target.value, 10) || 0 })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Print Technology</label>
                  <select
                    value={editingProduct.printType}
                    onChange={e => setEditingProduct({ ...editingProduct, printType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="FDM">FDM</option>
                    <option value="SLA">SLA</option>
                    <option value="BOTH">BOTH</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.inStock}
                      onChange={e => setEditingProduct({ ...editingProduct, inStock: e.target.checked })}
                      className="rounded text-orange-600"
                    />
                    <span className="font-bold text-slate-800">In Stock</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingProduct.isFeatured}
                      onChange={e => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                      className="rounded text-orange-600"
                    />
                    <span className="font-bold text-slate-800">Featured</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg resize-none"
                />
              </div>

              {/* Cover Image Upload / URL */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Cover Image URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingProduct.coverImage}
                    onChange={e => setEditingProduct({ ...editingProduct, coverImage: e.target.value })}
                    placeholder="/uploads/... or SVG data URI"
                    className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                  />
                  <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-bold cursor-pointer flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={async e => {
                        if (e.target.files && e.target.files[0]) {
                          try {
                            const res = await api.uploadFile(e.target.files[0]);
                            setEditingProduct({
                              ...editingProduct,
                              coverImage: res.url,
                              galleryImages: [res.url, ...(editingProduct.galleryImages || [])],
                            });
                          } catch (err: any) {
                            alert(err.message);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Bulk Pricing Tiers Config */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 uppercase text-[11px]">
                    Configurable Quantity Bulk Pricing Tiers
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const current = editingProduct.bulkTiers || [];
                      setEditingProduct({
                        ...editingProduct,
                        bulkTiers: [
                          ...current,
                          { minQty: 10, maxQty: 24, unitPrice: editingProduct.basePrice * 0.85, discountPercentage: 15 },
                        ],
                      });
                    }}
                    className="text-orange-600 hover:underline font-bold text-[11px]"
                  >
                    + Add Tier
                  </button>
                </div>

                {editingProduct.bulkTiers?.map((tier, tIdx) => (
                  <div key={tIdx} className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min Qty"
                      value={tier.minQty}
                      onChange={e => {
                        const copy = [...(editingProduct.bulkTiers || [])];
                        copy[tIdx].minQty = parseInt(e.target.value, 10) || 1;
                        setEditingProduct({ ...editingProduct, bulkTiers: copy });
                      }}
                      className="w-20 px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                    <span>to</span>
                    <input
                      type="number"
                      placeholder="Max (blank=any)"
                      value={tier.maxQty || ''}
                      onChange={e => {
                        const copy = [...(editingProduct.bulkTiers || [])];
                        copy[tIdx].maxQty = e.target.value ? parseInt(e.target.value, 10) : null;
                        setEditingProduct({ ...editingProduct, bulkTiers: copy });
                      }}
                      className="w-24 px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                    <span>Unit Price (₹):</span>
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={tier.unitPrice || ''}
                      onChange={e => {
                        const copy = [...(editingProduct.bulkTiers || [])];
                        copy[tIdx].unitPrice = parseInt(e.target.value, 10) || 0;
                        setEditingProduct({ ...editingProduct, bulkTiers: copy });
                      }}
                      className="w-24 px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const copy = editingProduct.bulkTiers?.filter((_, i) => i !== tIdx);
                        setEditingProduct({ ...editingProduct, bulkTiers: copy });
                      }}
                      className="text-slate-400 hover:text-red-600 font-bold ml-auto"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-950 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branding, Logo & Color Customizer Modal */}
      <BrandingThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </div>
  );
};
