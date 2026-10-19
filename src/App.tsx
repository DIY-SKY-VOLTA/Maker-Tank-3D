import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { StoreProvider, useStore } from './context/StoreContext.tsx';
import { CartProvider } from './context/CartContext.tsx';

import { Header } from './components/layout/Header.tsx';
import { Footer } from './components/layout/Footer.tsx';
import { CartDrawer } from './components/cart/CartDrawer.tsx';
import { ProductDetailModal } from './components/store/ProductDetailModal.tsx';
import { SearchModal } from './components/store/SearchModal.tsx';

import { HomeView } from './components/views/HomeView.tsx';
import { ShopView } from './components/views/ShopView.tsx';
import { EventsView } from './components/views/EventsView.tsx';
import { CustomDesignView } from './components/views/CustomDesignView.tsx';
import { DigitalModelsView } from './components/views/DigitalModelsView.tsx';
import { ContactView } from './components/views/ContactView.tsx';
import { AboutView } from './components/views/AboutView.tsx';
import { AdminView } from './components/views/AdminView.tsx';
import { EditModeBar } from './components/inline-editor/EditModeBar.tsx';
import { AdminLoginModal } from './components/inline-editor/AdminLoginModal.tsx';

import type { Product } from './types/index.ts';

function computeHoverColor(hex: string, percent = -15): string {
  try {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const num = parseInt(cleanHex, 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch {
    return hex;
  }
}

function MainApp() {
  const { setSelectedCategory, setSelectedEvent, settings } = useStore();
  const { openLoginModal } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dynamically update CSS variables when theme/brand color settings change
  useEffect(() => {
    const primary = settings?.primaryColor || '#22c55e';
    const hover = settings?.primaryHoverColor || computeHoverColor(primary, -15);
    const text = settings?.buttonTextColor || '#ffffff';
    const logoColor = settings?.logoColor || primary;
    const radiusMap: Record<string, string> = {
      'rounded-md': '0.375rem',
      'rounded-lg': '0.5rem',
      'rounded-xl': '0.75rem',
      'rounded-2xl': '1rem',
      'rounded-full': '9999px',
    };
    const radiusVal = radiusMap[settings?.buttonRadius || 'rounded-xl'] || '0.75rem';

    document.documentElement.style.setProperty('--theme-primary', primary);
    document.documentElement.style.setProperty('--theme-primary-hover', hover);
    document.documentElement.style.setProperty('--theme-primary-text', text);
    document.documentElement.style.setProperty('--theme-logo', logoColor);
    document.documentElement.style.setProperty('--theme-button-radius', radiusVal);
  }, [settings?.primaryColor, settings?.primaryHoverColor, settings?.buttonTextColor, settings?.logoColor, settings?.buttonRadius]);

  // Keyboard shortcut: Ctrl + Shift + A (or Cmd + Shift + A) to open Admin Quick Login
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        openLoginModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openLoginModal]);

  // Parse view from URL on initial mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('view');
    if (viewParam && ['home', 'shop', 'models', 'events', 'custom', 'about', 'contact', 'admin'].includes(viewParam)) {
      setCurrentView(viewParam);
    }
  }, []);

  const navigateTo = (view: string) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.pushState({}, '', url.toString());
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    navigateTo('shop');
  };

  const handleSelectEvent = (eventTag: string) => {
    setSelectedEvent(eventTag);
    navigateTo('events');
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans selection:bg-green-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={navigateTo}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            onNavigate={navigateTo}
            onSelectCategory={handleSelectCategory}
            onSelectEvent={handleSelectEvent}
            onQuickView={setQuickViewProduct}
          />
        )}

        {currentView === 'shop' && (
          <ShopView onQuickView={setQuickViewProduct} />
        )}

        {currentView === 'events' && (
          <EventsView
            onQuickView={setQuickViewProduct}
            onNavigate={navigateTo}
          />
        )}

        {currentView === 'custom' && (
          <CustomDesignView />
        )}

        {currentView === 'models' && (
          <DigitalModelsView onQuickView={setQuickViewProduct} />
        )}

        {currentView === 'about' && (
          <AboutView onNavigate={navigateTo} />
        )}

        {currentView === 'contact' && (
          <ContactView />
        )}

        {currentView === 'admin' && (
          <AdminView />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={navigateTo}
        onSelectCategory={handleSelectCategory}
      />

      {/* Modals & Slide-overs */}
      <CartDrawer />

      {quickViewProduct && (
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={p => {
          setQuickViewProduct(p);
        }}
      />

      {/* Direct In-Place Visual Editing Bar (visible only to authenticated administrator, hidden on About page) */}
      {currentView !== 'about' && (
        <EditModeBar onNavigateToAdmin={() => navigateTo('admin')} />
      )}

      {/* Admin Fast Login Modal */}
      <AdminLoginModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
