import React, { useState } from 'react';
import { X, Save, AlertCircle, Loader2, UploadCloud, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { api } from '../../services/api.ts';
import type { Product, BulkTier } from '../../types/index.ts';

interface ProductQuickEditorModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (updated: Product) => void;
}

export const ProductQuickEditorModal: React.FC<ProductQuickEditorModalProps> = ({
  product,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { token } = useAuth();
  const { categories, refreshCatalog } = useStore();

  if (!isOpen || !product) return null;

  const [name, setName] = useState(product.name);
  const [basePrice, setBasePrice] = useState(product.basePrice);
  const [description, setDescription] = useState(product.description);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [subcategoryId, setSubcategoryId] = useState(product.subcategoryId || '');
  const [inStock, setInStock] = useState(product.inStock);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);
  const [printType, setPrintType] = useState(product.printType);
  const [coverImage, setCoverImage] = useState(product.coverImage);
  const [bulkTiers, setBulkTiers] = useState<BulkTier[]>(product.bulkTiers || []);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subcategories belonging to chosen category
  const availableSubcategories = categories.filter(c => c.parentId === categoryId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    try {
      setIsUploading(true);
      setError(null);
      const res = await api.uploadFile(e.target.files[0]);
      setCoverImage(res.url);
    } catch (err: any) {
      setError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddTier = () => {
    setBulkTiers([
      ...bulkTiers,
      { minQty: 10, maxQty: 25, unitPrice: Math.round(basePrice * 0.85), discountPercentage: 15 },
    ]);
  };

  const handleRemoveTier = (idx: number) => {
    setBulkTiers(bulkTiers.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    if (basePrice < 0) {
      setError('Price cannot be negative');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const updated = await api.updateProduct(
        product.id,
        {
          name: name.trim(),
          basePrice: Number(basePrice),
          description: description.trim(),
          categoryId,
          subcategoryId: subcategoryId || undefined,
          inStock,
          isFeatured,
          printType,
          coverImage,
          bulkTiers,
        },
        token
      );

      await refreshCatalog();
      if (onSaved) onSaved(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              In-Place Product Editor
            </span>
            <h3 className="text-base font-extrabold text-slate-950">
              Edit Product: {product.name}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Name & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 mb-1">Product Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Base Price (INR ₹) *</label>
              <input
                type="number"
                value={basePrice}
                onChange={e => setBasePrice(parseFloat(e.target.value) || 0)}
                required
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-800 mb-1">Category Assignment *</label>
              <select
                value={categoryId}
                onChange={e => {
                  setCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {categories
                  .filter(c => !c.parentId)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">Subcategory (Optional)</label>
              <select
                value={subcategoryId}
                onChange={e => setSubcategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="">None</option>
                {availableSubcategories.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 resize-none"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">Cover Image</label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                <img src={coverImage} alt="Cover preview" className="w-full h-full object-contain" />
              </div>
              <input
                type="text"
                value={coverImage}
                onChange={e => setCoverImage(e.target.value)}
                placeholder="/uploads/... or SVG"
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg font-mono text-[11px]"
              />
              <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg text-slate-700 font-bold cursor-pointer flex items-center gap-1 shrink-0">
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {isUploading && (
              <div className="text-[10px] text-orange-600 mt-1">Uploading image...</div>
            )}
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={e => setInStock(e.target.checked)}
                className="rounded text-orange-600"
              />
              <span className="font-bold text-slate-800">In Stock</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                className="rounded text-orange-600"
              />
              <span className="font-bold text-slate-800">Featured On Home</span>
            </label>

            <div>
              <select
                value={printType}
                onChange={e => setPrintType(e.target.value as any)}
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white font-medium"
              >
                <option value="FDM">Print: FDM</option>
                <option value="SLA">Print: SLA</option>
                <option value="BOTH">Print: BOTH</option>
              </select>
            </div>
          </div>

          {/* Configurable Bulk Pricing Tiers */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase text-[11px]">
                Configurable Quantity Bulk Pricing Tiers
              </span>
              <button
                type="button"
                onClick={handleAddTier}
                className="text-orange-600 hover:underline font-bold text-[11px] flex items-center gap-0.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add Tier</span>
              </button>
            </div>

            {bulkTiers.length === 0 ? (
              <div className="text-[11px] text-slate-500 italic">No bulk tiers configured for this item.</div>
            ) : (
              bulkTiers.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500">Min:</span>
                  <input
                    type="number"
                    min="2"
                    value={tier.minQty}
                    onChange={e => {
                      const updated = [...bulkTiers];
                      updated[idx].minQty = parseInt(e.target.value, 10) || 1;
                      setBulkTiers(updated);
                    }}
                    className="w-16 px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                  />
                  <span className="text-[11px] text-slate-500">Max:</span>
                  <input
                    type="number"
                    placeholder="None"
                    value={tier.maxQty || ''}
                    onChange={e => {
                      const updated = [...bulkTiers];
                      updated[idx].maxQty = e.target.value ? parseInt(e.target.value, 10) : null;
                      setBulkTiers(updated);
                    }}
                    className="w-20 px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                  />
                  <span className="text-[11px] text-slate-500">Unit (₹):</span>
                  <input
                    type="number"
                    value={tier.unitPrice || ''}
                    onChange={e => {
                      const updated = [...bulkTiers];
                      updated[idx].unitPrice = parseFloat(e.target.value) || 0;
                      setBulkTiers(updated);
                    }}
                    className="w-20 px-2 py-1 border border-slate-300 rounded bg-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 ml-auto"
                    title="Remove Tier"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Form Actions */}
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
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
