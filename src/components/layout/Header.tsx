import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, Menu, X, Sparkles, Pencil, CheckCircle, Palette, Camera } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { EditableText } from '../inline-editor/EditableText.tsx';
import { EditableImage } from '../inline-editor/EditableImage.tsx';
import { BrandingThemeModal } from '../inline-editor/BrandingThemeModal.tsx';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenSearch }) => {
  const { totalQuantity, openCart } = useCart();
  const { settings, updateSettingsInDb } = useStore();
  const { isAuthenticated, isEditMode, toggleEditMode, openLoginModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'shop', label: 'Shop' },
    { id: 'models', label: '3D Models' },
    { id: 'events', label: 'Events' },
    { id: 'custom', label: 'Custom Design' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Optional Top Announcement Strip */}
      {settings?.announcementText && (
        <div className="bg-slate-900 text-slate-100 text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="truncate">{settings.announcementText}</span>
        </div>
      )}

      {/* In-Place Edit Mode Notice Strip (Visible ONLY when edit mode is active) */}
      {isEditMode && (
        <div className="bg-green-600 text-white text-xs py-1.5 px-4 flex items-center justify-between shadow-xs font-medium">
          <div className="flex items-center gap-2 mx-auto">
            <Pencil className="w-3.5 h-3.5 animate-bounce" />
            <span>
              <strong>Direct In-Place Visual Editing Active:</strong> Click any heading, description, price, button, or image on the page to edit directly.
            </span>
          </div>
          <button
            onClick={toggleEditMode}
            className="text-[11px] underline font-bold hover:text-green-200 ml-4 shrink-0"
          >
            Exit Edit Mode
          </button>
        </div>
      )}

      {/* Top Bar Contract (3 Zones) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Live Editable in Edit Mode) */}
        {isEditMode ? (
          <div className="flex items-center gap-2.5 text-left shrink-0">
            {settings?.logoUrl ? (
              <EditableImage
                src={settings.logoUrl}
                alt={settings?.logoText || 'Logo'}
                containerClassName="relative h-10 w-auto max-w-[130px] flex items-center"
                className="h-10 w-auto object-contain rounded-md"
                onSave={async (url) => {
                  await updateSettingsInDb({ logoUrl: url });
                }}
                title="Replace Store Logo Image"
                buttonLabel="Change Logo"
              />
            ) : (
              <div
                onClick={() => setIsThemeModalOpen(true)}
                className="w-10 h-10 rounded-xl font-extrabold flex items-center justify-center text-lg tracking-tighter shadow-sm text-white cursor-pointer relative group transition-transform hover:scale-105 shrink-0"
                style={{ backgroundColor: settings?.primaryColor || '#22c55e' }}
                title="Click to upload logo or pick color"
              >
                {(settings?.logoText || settings?.brandName || 'M').charAt(0).toUpperCase()}
                <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <EditableText
                value={settings?.logoText || settings?.brandName || 'MAKER TANK 3D'}
                as="div"
                className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950 whitespace-nowrap leading-tight"
                onSave={async (val) => {
                  await updateSettingsInDb({ logoText: val, brandName: val });
                }}
              />
              <EditableText
                value={settings?.logoSubtitle || settings?.tagline || 'PRINT • DESIGN • CREATE'}
                as="div"
                className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-slate-500 uppercase whitespace-nowrap"
                onSave={async (val) => {
                  await updateSettingsInDb({ logoSubtitle: val, tagline: val });
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => setIsThemeModalOpen(true)}
              className="p-1.5 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors ml-1"
              title="Open Logo, Button & Color Customizer"
            >
              <Palette className="w-4 h-4 text-green-600" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group shrink-0"
          >
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings?.logoText || settings?.brandName || 'Logo'}
                className="h-10 w-auto max-w-[140px] object-contain rounded-md"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl font-extrabold flex items-center justify-center text-lg tracking-tighter shadow-sm text-white group-hover:opacity-90 transition-opacity"
                style={{ backgroundColor: settings?.primaryColor || '#22c55e' }}
              >
                {(settings?.logoText || settings?.brandName || 'M').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-tight text-slate-950 whitespace-nowrap leading-tight">
                {settings?.logoText || settings?.brandName || 'MAKER TANK 3D'}
              </div>
              <div className="text-[9px] sm:text-[10px] font-semibold tracking-widest text-slate-500 uppercase whitespace-nowrap">
                {settings?.logoSubtitle || settings?.tagline || 'PRINT • DESIGN • CREATE'}
              </div>
            </div>
          </button>
        )}

        {/* Zone 2: Navigation Links (single line, whitespace-nowrap) */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-slate-600">
          {navLinks.map(link => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onNavigate(link.id)}
                className={`transition-colors whitespace-nowrap relative py-1 focus:outline-none ${
                  isActive
                    ? 'text-slate-950 font-bold'
                    : 'hover:text-slate-950'
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: settings?.primaryColor || '#22c55e' }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Search, Theme Customizer, Edit Website, Admin, Cart) */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenSearch}
            aria-label="Search catalog"
            className="p-2 text-slate-600 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick Theme & Colors Button in Header (visible in Edit Mode) */}
          {isAuthenticated && isEditMode && (
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors"
              title="Customize Logo, Button & Interface Colors"
            >
              <Palette className="w-3.5 h-3.5 text-green-400" />
              <span>Theme &amp; Colors</span>
            </button>
          )}

          {/* Edit Website Button: ONLY visible when logged in as Admin and NOT on About page */}
          {isAuthenticated && currentView !== 'about' && (
            <button
              onClick={toggleEditMode}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isEditMode
                  ? 'bg-green-600 text-white shadow-xs ring-2 ring-green-400/50'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80'
              }`}
              title={isEditMode ? 'Exit in-place editing' : 'Enable in-place visual editing'}
            >
              <Pencil className={`w-3.5 h-3.5 ${isEditMode ? 'text-white' : 'text-green-600'}`} />
              <span>{isEditMode ? 'Editing ON' : 'Edit Website'}</span>
            </button>
          )}

          {/* Admin Dashboard: ONLY visible when logged in as Admin */}
          {isAuthenticated && (
            <button
              onClick={() => onNavigate('admin')}
              aria-label="Admin Portal"
              title="Admin Dashboard"
              className={`p-2 rounded-lg transition-colors focus:outline-none ${
                currentView === 'admin'
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-5 h-5 text-green-600" />
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={openCart}
            aria-label={`Shopping Cart (${totalQuantity} items)`}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-950 text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm focus:outline-none text-xs font-semibold whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalQuantity > 0 && (
              <span
                className="px-1.5 py-0.2 text-white text-[11px] font-bold rounded-full min-w-5 text-center"
                style={{ backgroundColor: settings?.primaryColor || '#22c55e' }}
              >
                {totalQuantity}
              </span>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1 shadow-lg">
          {navLinks.map(link => {
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-green-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            );
          })}
          {isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 space-y-1">
              {currentView !== 'about' && (
                <button
                  onClick={() => {
                    toggleEditMode();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-green-600 hover:bg-green-50 rounded-md flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{isEditMode ? 'Exit Edit Mode' : '✏️ Edit Website'}</span>
                </button>
              )}
              <button
                onClick={() => {
                  onNavigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                🔐 Admin Control Panel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Live Logo, Colors & Branding Customizer Modal */}
      <BrandingThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </header>
  );
};
