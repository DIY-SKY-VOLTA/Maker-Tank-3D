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

function MainApp() {
  const { setSelectedCategory, setSelectedEvent, settings } = useStore();
  const { openLoginModal } = useAuth();
  const [currentView, setCurrentView] = useState<string>('home');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dynamically update CSS variables when theme/brand color settings change
  useEffect(() => {
    const primary = settings?.primaryColor || '#22c55e';
    const hover = settings?.primaryHoverColor || '#16a34a';
    const text = settings?.buttonTextColor || '#ffffff';
    document.documentElement.style.setProperty('--theme-primary', primary);
    document.documentElement.style.setProperty('--theme-primary-hover', hover);
    document.documentElement.style.setProperty('--theme-primary-text', text);
  }, [settings?.primaryColor, settings?.primaryHoverColor, settings?.buttonTextColor]);

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
