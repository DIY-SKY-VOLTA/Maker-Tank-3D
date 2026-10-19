import React from 'react';
import { MessageCircle, Mail, Phone, MapPin, Instagram, Youtube } from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { EditableText } from '../inline-editor/EditableText.tsx';

interface FooterProps {
  onNavigate: (view: string) => void;
  onSelectCategory: (catId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectCategory }) => {
  const { categories, settings, updateSettingsInDb } = useStore();
  const { isEditMode, openLoginModal, isAuthenticated } = useAuth();

  const services = [
    'FDM Precision Printing',
    'SLA Resin 3D Printing',
    'Custom CAD Design',
    'Rapid Prototyping',
    'Personalisation & Return Gifts',
    'Bulk Manufacturing Runs',
  ];

  const primaryCategories = categories.filter(c => !c.parentId).slice(0, 6);

  return (
    <footer className="bg-white text-slate-600 pt-16 pb-12 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-200">
          {/* Col 1: Studio Brand & Bio */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              {settings?.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings?.logoText || settings?.brandName || 'Logo'}
                  className="h-8 w-auto max-w-[120px] object-contain rounded-md border border-slate-200 p-1"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-lg font-black flex items-center justify-center text-base text-white shadow-xs"
                  style={{ backgroundColor: settings?.logoColor || settings?.primaryColor || '#22c55e' }}
                >
                  {(settings?.logoText || settings?.brandName || 'M').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-lg font-extrabold text-slate-950 tracking-tight">
                {settings?.logoText || settings?.brandName || 'MAKER TANK 3D'}
              </span>
            </div>
            <div className="text-xs text-slate-500 leading-relaxed">
              {isEditMode ? (
                <EditableText
                  value={settings?.tagline || 'Industrial-grade 3D printing, custom functional parts, personalised keepsakes, and engineering prototypes delivered with precision craftsmanship.'}
                  as="p"
                  multiline={true}
                  className="text-xs text-slate-500 leading-relaxed"
                  onSave={async (val) => {
                    await updateSettingsInDb({ tagline: val });
                  }}
                />
              ) : (
                <p>
                  {settings?.tagline ||
                    'Industrial-grade 3D printing, custom functional parts, personalised keepsakes, and engineering prototypes delivered with precision craftsmanship.'}
                </p>
              )}
            </div>
            <div className="pt-2 flex items-center gap-3">
              {settings?.whatsappNumber && (
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-green-600 text-slate-700 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
              {settings?.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-pink-600 text-slate-700 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings?.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-red-600 text-slate-700 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-slate-950 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('shop')}
                  className="hover:text-slate-950 transition-colors"
                >
                  Shop Ready Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('events')}
                  className="hover:text-slate-950 transition-colors"
                >
                  Events &amp; Return Gifts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('models')}
                  className="hover:text-slate-950 transition-colors"
                >
                  3D Models (Digital STL)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('custom')}
                  className="hover:text-slate-950 transition-colors"
                >
                  Request Custom Design
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-slate-950 transition-colors"
                >
                  About Studio &amp; Tech
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-slate-950 transition-colors"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Popular Categories */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mb-4">
              Categories
            </h4>
            <ul className="space-y-2 text-xs">
              {primaryCategories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onNavigate('shop');
                    }}
                    className="hover:text-slate-950 transition-colors text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Studio Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-950 mb-4">
              Studio Contact
            </h4>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <Mail className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              {isEditMode ? (
                <EditableText
                  value={settings?.contactEmail || 'hello@makertank3d.com'}
                  onSave={async (val) => {
                    await updateSettingsInDb({ contactEmail: val });
                  }}
                  className="text-xs text-slate-700"
                />
              ) : (
                <span>{settings?.contactEmail || 'hello@makertank3d.com'}</span>
              )}
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <Phone className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              {isEditMode ? (
                <EditableText
                  value={settings?.phoneNumber || '+91 98765 43210'}
                  onSave={async (val) => {
                    await updateSettingsInDb({ phoneNumber: val });
                  }}
                  className="text-xs text-slate-700"
                />
              ) : (
                <span>{settings?.phoneNumber || '+91 98765 43210'}</span>
              )}
            </div>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              {isEditMode ? (
                <EditableText
                  value={settings?.address || 'Innovation Tech Hub, Bangalore, India'}
                  multiline={true}
                  onSave={async (val) => {
                    await updateSettingsInDb({ address: val });
                  }}
                  className="text-xs text-slate-700"
                />
              ) : (
                <span>{settings?.address || 'Innovation Tech Hub, Bangalore, India'}</span>
              )}
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    onNavigate('admin');
                  } else {
                    openLoginModal();
                  }
                }}
                className="text-[11px] text-slate-400 hover:text-slate-800 transition-colors flex items-center gap-1"
                title="Authorized staff access (Shortcut: Ctrl+Shift+A)"
              >
                <span>{isAuthenticated ? 'Admin Dashboard →' : 'Staff Portal →'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Maker Tank 3D. All rights reserved. Precision digital manufacturing.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('shop')} className="hover:text-slate-950">Shop</button>
            <span>·</span>
            <button onClick={() => onNavigate('custom')} className="hover:text-slate-950">Custom CAD</button>
            <span>·</span>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-950">Support</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
