import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Palette,
  Check,
  Undo,
  UploadCloud,
  Image,
  RefreshCw,
  Eye,
  Sliders,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../services/api.ts';

interface BrandingThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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

const COLOR_PRESETS = [
  { name: 'Lite Green (Brand)', hex: '#22c55e', hover: '#16a34a' },
  { name: 'Bright Neon Green', hex: '#3dff24', hover: '#2ec91a' },
  { name: 'Mint Emerald', hex: '#10b981', hover: '#059669' },
  { name: 'Lime Fresh', hex: '#84cc16', hover: '#65a30d' },
  { name: 'Forest Green', hex: '#16a34a', hover: '#15803d' },
  { name: 'Electric Blue', hex: '#2563eb', hover: '#1d4ed8' },
  { name: 'Maker Orange', hex: '#ea580c', hover: '#c2410c' },
  { name: 'Cyber Cyan', hex: '#0891b2', hover: '#0e7490' },
  { name: 'Teal Modern', hex: '#0d9488', hover: '#0f766e' },
  { name: 'Violet Purple', hex: '#7c3aed', hover: '#6d28d9' },
  { name: 'Crimson Red', hex: '#dc2626', hover: '#b91c1c' },
  { name: 'Amber Gold', hex: '#d97706', hover: '#b45309' },
  { name: 'Midnight Slate', hex: '#0f172a', hover: '#020617' },
];

const RADIUS_PRESETS: Array<{ label: string; value: 'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-full' }> = [
  { label: 'Sharp (6px)', value: 'rounded-md' },
  { label: 'Standard (8px)', value: 'rounded-lg' },
  { label: 'Soft (12px)', value: 'rounded-xl' },
  { label: 'Curvy (16px)', value: 'rounded-2xl' },
  { label: 'Pill (Full)', value: 'rounded-full' },
];

export const BrandingThemeModal: React.FC<BrandingThemeModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettingsInDb } = useStore();

  const [activeTab, setActiveTab] = useState<'colors' | 'logo'>('colors');

  // Form State
  const [logoUrl, setLogoUrl] = useState(settings?.logoUrl || '');
  const [logoText, setLogoText] = useState(settings?.logoText || settings?.brandName || 'MAKER TANK 3D');
  const [logoSubtitle, setLogoSubtitle] = useState(settings?.logoSubtitle || settings?.tagline || 'PRINT • DESIGN • CREATE');
  const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor || '#22c55e');
  const [logoColor, setLogoColor] = useState(settings?.logoColor || settings?.primaryColor || '#22c55e');
  const [syncLogoWithTheme, setSyncLogoWithTheme] = useState(!settings?.logoColor || settings?.logoColor === settings?.primaryColor);
  const [buttonTextColor, setButtonTextColor] = useState(settings?.buttonTextColor || '#ffffff');
  const [buttonRadius, setButtonRadius] = useState<'rounded-md' | 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-full'>(
    settings?.buttonRadius || 'rounded-xl'
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalBodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    modalBodyRef.current?.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeTab]);

  // Sync state whenever modal opens or settings change
  useEffect(() => {
    if (isOpen && settings) {
      setLogoUrl(settings.logoUrl || '');
      setLogoText(settings.logoText || settings.brandName || 'MAKER TANK 3D');
      setLogoSubtitle(settings.logoSubtitle || settings.tagline || 'PRINT • DESIGN • CREATE');
      const pColor = settings.primaryColor || '#22c55e';
      const lColor = settings.logoColor || pColor;
      setPrimaryColor(pColor);
      setLogoColor(lColor);
      setSyncLogoWithTheme(!settings.logoColor || settings.logoColor === pColor);
      setButtonTextColor(settings.buttonTextColor || '#ffffff');
      setButtonRadius(settings.buttonRadius || 'rounded-xl');
    }
  }, [isOpen, settings]);

  // LIVE INTERACTIVE PREVIEW: Dynamically inject CSS variables into document while user edits
  useEffect(() => {
    if (!isOpen) return;

    const hover = computeHoverColor(primaryColor, -15);
    const activeLogoColor = syncLogoWithTheme ? primaryColor : logoColor;

    document.documentElement.style.setProperty('--theme-primary', primaryColor);
    document.documentElement.style.setProperty('--theme-primary-hover', hover);
    document.documentElement.style.setProperty('--theme-primary-text', buttonTextColor);
    document.documentElement.style.setProperty('--theme-logo', activeLogoColor);

    const radiusMap: Record<string, string> = {
      'rounded-md': '0.375rem',
      'rounded-lg': '0.5rem',
      'rounded-xl': '0.75rem',
      'rounded-2xl': '1rem',
      'rounded-full': '9999px',
    };
    document.documentElement.style.setProperty('--theme-button-radius', radiusMap[buttonRadius] || '0.75rem');
  }, [isOpen, primaryColor, logoColor, syncLogoWithTheme, buttonTextColor, buttonRadius]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Revert document CSS properties to current saved settings
    const savedPrimary = settings?.primaryColor || '#22c55e';
    const savedHover = settings?.primaryHoverColor || computeHoverColor(savedPrimary, -15);
    const savedText = settings?.buttonTextColor || '#ffffff';
    const savedLogo = settings?.logoColor || savedPrimary;
    const radiusMap: Record<string, string> = {
      'rounded-md': '0.375rem',
      'rounded-lg': '0.5rem',
      'rounded-xl': '0.75rem',
      'rounded-2xl': '1rem',
      'rounded-full': '9999px',
    };
    document.documentElement.style.setProperty('--theme-primary', savedPrimary);
    document.documentElement.style.setProperty('--theme-primary-hover', savedHover);
    document.documentElement.style.setProperty('--theme-primary-text', savedText);
    document.documentElement.style.setProperty('--theme-logo', savedLogo);
    document.documentElement.style.setProperty('--theme-button-radius', radiusMap[settings?.buttonRadius || 'rounded-xl'] || '0.75rem');

    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setIsUploading(true);
      setError(null);
      const res = await api.uploadFile(file);
      setLogoUrl(res.url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo image.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const hoverColor = computeHoverColor(primaryColor, -15);
      const finalLogoColor = syncLogoWithTheme ? primaryColor : logoColor;

      await updateSettingsInDb({
        logoUrl: logoUrl.trim(),
        logoText: logoText.trim() || 'MAKER TANK 3D',
        brandName: logoText.trim() || 'MAKER TANK 3D',
        logoSubtitle: logoSubtitle.trim() || 'PRINT • DESIGN • CREATE',
        tagline: logoSubtitle.trim() || 'PRINT • DESIGN • CREATE',
        primaryColor,
        primaryHoverColor: hoverColor,
        logoColor: finalLogoColor,
        buttonTextColor,
        buttonRadius,
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to save branding & theme settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefault = () => {
    setPrimaryColor('#22c55e');
    setLogoColor('#22c55e');
    setSyncLogoWithTheme(true);
    setButtonTextColor('#ffffff');
    setButtonRadius('rounded-xl');
    setLogoUrl('');
    setLogoText('MAKER TANK 3D');
    setLogoSubtitle('PRINT • DESIGN • CREATE');
  };

  const effectiveLogoColor = syncLogoWithTheme ? primaryColor : logoColor;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-950">
                Logo &amp; Interface Theme Editor
              </h3>
              <p className="text-[11px] text-slate-500">
                Instantly customize button colors, overall UI accents, and brand logo.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 text-xs font-bold px-6 bg-white shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('colors')}
            className={`py-3 mr-6 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'colors'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Button &amp; Interface Colors</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('logo')}
            className={`py-3 mr-6 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'logo'
                ? 'border-slate-950 text-slate-950'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Logo, Emblem &amp; Brand Text</span>
          </button>
        </div>

        {/* Modal Body */}
        <div ref={modalBodyRef} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          {/* TAB 1: COLORS & BUTTONS */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Preset Palette */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                    Preset Color Palettes
                  </label>
                  <span className="text-[10px] text-slate-400">Click to apply live</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {COLOR_PRESETS.map(preset => {
                    const isSelected = primaryColor.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => {
                          setPrimaryColor(preset.hex);
                          if (syncLogoWithTheme) {
                            setLogoColor(preset.hex);
                          }
                        }}
                        className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                          isSelected
                            ? 'border-slate-950 ring-2 ring-slate-900/10 bg-slate-50 font-bold shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className="w-5 h-5 rounded-lg shrink-0 shadow-xs flex items-center justify-center text-white"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] text-slate-800 truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Color Picker & Hex Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Custom Button &amp; UI Accent Color
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Controls all website buttons, cards, active pills, links, and highlights.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={e => {
                        setPrimaryColor(e.target.value);
                        if (syncLogoWithTheme) setLogoColor(e.target.value);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white shadow-2xs"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={e => {
                        setPrimaryColor(e.target.value);
                        if (syncLogoWithTheme) setLogoColor(e.target.value);
                      }}
                      placeholder="#22c55e"
                      maxLength={7}
                      className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                    />
                  </div>
                  <label className="flex items-center gap-2 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncLogoWithTheme}
                      onChange={e => {
                        setSyncLogoWithTheme(e.target.checked);
                        if (e.target.checked) setLogoColor(primaryColor);
                      }}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-[11px] text-slate-600 font-medium">
                      Also apply to Logo Emblem &amp; Monogram
                    </span>
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    Button Text Color
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Ensure contrast against your button background.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setButtonTextColor('#ffffff')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        buttonTextColor === '#ffffff'
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                      <span>White Text</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setButtonTextColor('#0f172a')}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                        buttonTextColor === '#0f172a'
                          ? 'border-slate-950 bg-slate-950 text-white'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-slate-950" />
                      <span>Dark Text</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Button Corner Radius */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Button Corner Shape
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {RADIUS_PRESETS.map(radius => {
                    const isSelected = buttonRadius === radius.value;
                    return (
                      <button
                        key={radius.value}
                        type="button"
                        onClick={() => setButtonRadius(radius.value)}
                        className={`p-2.5 border text-center transition-all ${radius.value} ${
                          isSelected
                            ? 'border-slate-950 bg-slate-950 text-white font-bold shadow-xs'
                            : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <span className="text-xs">{radius.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOGO & BRAND TEXT */}
          {activeTab === 'logo' && (
            <div className="space-y-6">
              {/* Dedicated Logo Color Customizer */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-slate-700" />
                    <span>Logo Emblem &amp; Monogram Color</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={syncLogoWithTheme}
                      onChange={e => {
                        setSyncLogoWithTheme(e.target.checked);
                        if (e.target.checked) setLogoColor(primaryColor);
                      }}
                      className="rounded text-slate-900 focus:ring-slate-900"
                    />
                    <span>Match Button Theme ({primaryColor})</span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-500">
                  Easily customize the logo box in the top header and footer. Choose any color independently.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={syncLogoWithTheme}
                      value={effectiveLogoColor}
                      onChange={e => {
                        setLogoColor(e.target.value);
                        setSyncLogoWithTheme(false);
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 p-0.5 bg-white disabled:opacity-50"
                    />
                    <input
                      type="text"
                      disabled={syncLogoWithTheme}
                      value={effectiveLogoColor}
                      onChange={e => {
                        setLogoColor(e.target.value);
                        setSyncLogoWithTheme(false);
                      }}
                      placeholder="#22c55e"
                      maxLength={7}
                      className="w-28 px-3 py-2 text-xs border border-slate-300 rounded-xl font-mono uppercase bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold disabled:opacity-50"
                    />
                  </div>

                  {/* Quick color chips for logo */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['#22c55e', '#3dff24', '#2563eb', '#ea580c', '#7c3aed', '#dc2626', '#0f172a'].map(hex => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => {
                          setLogoColor(hex);
                          setSyncLogoWithTheme(false);
                        }}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-transform hover:scale-110 ${
                          effectiveLogoColor.toLowerCase() === hex.toLowerCase()
                            ? 'ring-2 ring-slate-900 shadow-xs'
                            : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={`Set logo color to ${hex}`}
                      >
                        {effectiveLogoColor.toLowerCase() === hex.toLowerCase() && (
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logo Image Upload / URL */}
              <div className="space-y-2">
                <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                  Store Logo Image (Optional)
                </label>
                <p className="text-[11px] text-slate-500">
                  Upload an image logo (PNG, SVG, WebP with transparent background) or leave empty to use the custom monogram emblem above.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {/* Upload box */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-slate-900 rounded-2xl p-5 text-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors flex flex-col items-center justify-center space-y-1.5"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <UploadCloud className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold text-slate-800">
                      {isUploading ? 'Uploading logo...' : 'Upload Logo File'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      PNG, SVG, JPG, WebP supported
                    </span>
                  </div>

                  {/* Direct URL input */}
                  <div className="space-y-2 flex flex-col justify-center">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Or Paste Logo Web URL
                      </label>
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={e => setLogoUrl(e.target.value)}
                        placeholder="https://.../logo.png"
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-mono"
                      />
                    </div>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={() => setLogoUrl('')}
                        className="text-[11px] text-red-600 hover:text-red-700 font-semibold text-left underline"
                      >
                        Remove Logo Image (Revert to Monogram)
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Brand Name / Logo Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Store Brand Name (Logo Text)
                  </label>
                  <input
                    type="text"
                    value={logoText}
                    onChange={e => setLogoText(e.target.value)}
                    placeholder="e.g. MAKER TANK 3D"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-bold"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Appears in header, footer, page titles, and receipts.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Logo Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    value={logoSubtitle}
                    onChange={e => setLogoSubtitle(e.target.value)}
                    placeholder="e.g. PRINT • DESIGN • CREATE"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Displays directly under the brand logo in the header.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REAL-TIME PREVIEW CARD */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>Live Real-Time Preview (Applied Across Site)</span>
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Changes apply instantly
              </span>
            </div>

            {/* Mock Header Branding */}
            <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-2.5">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="h-9 w-auto max-w-[120px] object-contain rounded-lg"
                    onError={() => setError('Could not load logo from the provided URL')}
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-lg font-extrabold flex items-center justify-center text-lg tracking-tighter shadow-sm text-white transition-colors"
                    style={{ backgroundColor: effectiveLogoColor }}
                  >
                    {logoText ? logoText.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
                <div>
                  <div className="text-sm font-extrabold tracking-tight text-slate-950 whitespace-nowrap leading-tight">
                    {logoText || 'MAKER TANK 3D'}
                  </div>
                  <div className="text-[9px] font-semibold tracking-widest text-slate-500 uppercase whitespace-nowrap">
                    {logoSubtitle || 'PRINT • DESIGN • CREATE'}
                  </div>
                </div>
              </div>

              {/* Sample Buttons & Badge */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  style={{ backgroundColor: primaryColor, color: buttonTextColor }}
                  className={`px-3.5 py-1.5 text-xs font-bold shadow-sm transition-transform hover:scale-105 ${buttonRadius}`}
                >
                  Primary Button
                </button>
                <div
                  className="px-2.5 py-1 text-[10px] font-bold rounded-full border"
                  style={{
                    backgroundColor: `${primaryColor}15`,
                    color: primaryColor,
                    borderColor: `${primaryColor}40`,
                  }}
                >
                  Active Tag
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <Undo className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{ backgroundColor: primaryColor, color: buttonTextColor }}
              className={`px-5 py-2 font-bold text-xs shadow-sm flex items-center gap-2 transition-transform hover:opacity-95 ${buttonRadius}`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Branding &amp; Colors</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
