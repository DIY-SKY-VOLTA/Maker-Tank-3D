import React, { useState } from 'react';
import { X, Save, AlertCircle, Loader2, Eye, EyeOff, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../services/api.ts';
import type { SiteSettings } from '../../types/index.ts';

interface SectionFieldConfig {
  key: keyof SiteSettings;
  label: string;
  type?: 'text' | 'textarea' | 'image' | 'select';
  options?: { label: string; value: string }[];
}

interface SectionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionName: string;
  visibilityKey?: keyof SiteSettings;
  fields: SectionFieldConfig[];
}

export const SectionEditorModal: React.FC<SectionEditorModalProps> = ({
  isOpen,
  onClose,
  sectionName,
  visibilityKey,
  fields,
}) => {
  const { token } = useAuth();
  const { settings, refreshCatalog, updateSettingsState } = useStore();

  if (!isOpen || !settings) return null;

  // Initialize form with current settings
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach(f => {
      initial[f.key] = settings[f.key] ?? '';
    });
    if (visibilityKey) {
      initial[visibilityKey] = settings[visibilityKey] ?? true;
    }
    return initial;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (key: string, file: File) => {
    try {
      setIsUploading(key);
      setError(null);
      const res = await api.uploadFile(file);
      setFormData(prev => ({ ...prev, [key]: res.url }));
    } catch (err: any) {
      setError(err.message || 'File upload failed');
    } finally {
      setIsUploading(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setIsSaving(true);
      setError(null);

      const updated = await api.updateSettings(formData, token);
      updateSettingsState(updated);
      await refreshCatalog();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save section settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Section Settings
            </span>
            <h3 className="text-base font-extrabold text-slate-950">
              Manage: {sectionName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Visibility toggle if provided */}
          {visibilityKey && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Publish Section Status</span>
                <p className="text-[11px] text-slate-500">
                  {formData[visibilityKey]
                    ? 'Section is currently visible to visitors.'
                    : 'Section is hidden from customer storefront.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    [visibilityKey]: !prev[visibilityKey],
                  }))
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  formData[visibilityKey]
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {formData[visibilityKey] ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Published</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hidden</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Configurable fields */}
          {fields.map(field => {
            const val = formData[field.key] || '';

            if (field.type === 'textarea') {
              return (
                <div key={field.key}>
                  <label className="block font-bold text-slate-800 mb-1">{field.label}</label>
                  <textarea
                    value={val}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, [field.key]: e.target.value }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans"
                  />
                </div>
              );
            }

            if (field.type === 'select') {
              return (
                <div key={field.key}>
                  <label className="block font-bold text-slate-800 mb-1">{field.label}</label>
                  <select
                    value={val}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, [field.key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            if (field.type === 'image') {
              return (
                <div key={field.key}>
                  <label className="block font-bold text-slate-800 mb-1">{field.label}</label>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                      {val ? (
                        <img src={val} alt="Preview" className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400">None</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={val}
                      onChange={e =>
                        setFormData(prev => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder="/uploads/... or SVG data URI"
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg font-mono text-[11px]"
                    />
                    <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-bold cursor-pointer flex items-center gap-1 shrink-0">
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>{isUploading === field.key ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(field.key, e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              );
            }

            return (
              <div key={field.key}>
                <label className="block font-bold text-slate-800 mb-1">{field.label}</label>
                <input
                  type="text"
                  value={val}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, [field.key]: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans"
                />
              </div>
            );
          })}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              <span>Save Section</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
