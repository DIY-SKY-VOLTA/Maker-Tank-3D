import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, Category, ParametricTool, SiteSettings } from '../types/index.ts';
import { api } from '../services/api.ts';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  parametricTools: ParametricTool[];
  settings: SiteSettings | null;
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedEvent: string | null;
  setSelectedEvent: (evt: string | null) => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (prod: Product | null) => void;
  refreshCatalog: () => Promise<void>;
  updateSettingsState: (updates: Partial<SiteSettings>) => void;
  updateSettingsInDb: (updates: Partial<SiteSettings>) => Promise<SiteSettings>;
  updateProductInDb: (id: string, updates: Partial<Product>) => Promise<Product>;
  updateCategoryInDb: (id: string, updates: Partial<Category>) => Promise<Category>;
  updateProductInState: (updated: Product) => void;
  updateCategoryInState: (updated: Category) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parametricTools, setParametricTools] = useState<ParametricTool[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const getAdminToken = () => {
    return localStorage.getItem('maker_tank_admin_token') || '';
  };

  const refreshCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodsData, catsData, toolsData, settingsData] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getParametricTools().catch(() => []),
        api.getSettings().catch(() => null),
      ]);
      setProducts(prodsData);
      setCategories(catsData);
      setParametricTools(toolsData);
      if (settingsData) setSettings(settingsData);
    } catch (err: any) {
      console.error('Error loading store data:', err);
      setError(err.message || 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  const updateSettingsState = (updates: Partial<SiteSettings>) => {
    setSettings(prev => (prev ? { ...prev, ...updates } : null));
  };

  const updateProductInState = (updated: Product) => {
    setProducts(prev => prev.map(p => (p.id === updated.id ? updated : p)));
    setQuickViewProduct(prev => (prev && prev.id === updated.id ? updated : prev));
  };

  const updateCategoryInState = (updated: Category) => {
    setCategories(prev => prev.map(c => (c.id === updated.id ? updated : c)));
  };

  const updateSettingsInDb = async (updates: Partial<SiteSettings>): Promise<SiteSettings> => {
    const token = getAdminToken();
    const updated = await api.updateSettings(updates, token);
    setSettings(updated);
    return updated;
  };

  const updateProductInDb = async (id: string, updates: Partial<Product>): Promise<Product> => {
    const token = getAdminToken();
    const updated = await api.updateProduct(id, updates, token);
    updateProductInState(updated);
    return updated;
  };

  const updateCategoryInDb = async (id: string, updates: Partial<Category>): Promise<Category> => {
    const token = getAdminToken();
    const updated = await api.updateCategory(id, updates, token);
    updateCategoryInState(updated);
    return updated;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        parametricTools,
        settings,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        selectedEvent,
        setSelectedEvent,
        quickViewProduct,
        setQuickViewProduct,
        refreshCatalog,
        updateSettingsState,
        updateSettingsInDb,
        updateProductInDb,
        updateCategoryInDb,
        updateProductInState,
        updateCategoryInState,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
