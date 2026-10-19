import React, { useState } from 'react';
import { Star, ShoppingBag, Eye, Settings2 } from 'lucide-react';
import type { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { EditableText } from '../inline-editor/EditableText.tsx';
import { EditableImage } from '../inline-editor/EditableImage.tsx';
import { ProductQuickEditorModal } from '../inline-editor/ProductQuickEditorModal.tsx';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useCart();
  const { categories, updateProductInDb } = useStore();
  const { isEditMode } = useAuth();
  const [isQuickEditorOpen, setIsQuickEditorOpen] = useState(false);

  const category = categories.find(c => c.id === product.categoryId);

  // Lowest bulk price if tiers exist
  const lowestBulkTier = product.bulkTiers && product.bulkTiers.length > 0
    ? [...product.bulkTiers].sort((a, b) => (a.unitPrice || 0) - (b.unitPrice || 0))[0]
    : null;

  return (
    <>
      <div className={`group relative bg-white rounded-xl border overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col h-full ${
        isEditMode ? 'border-green-300 ring-1 ring-green-200 shadow-xs' : 'border-slate-200'
      }`}>
        {/* Administrator In-Place Card Toolbar (Visible ONLY in Edit Mode) */}
        {isEditMode && (
          <div className="bg-green-50 border-b border-green-200 px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-green-900 z-10">
            <span className="flex items-center gap-1 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              <span>Admin: Direct Product Edit</span>
            </span>
            <button
              onClick={e => {
                e.stopPropagation();
                setIsQuickEditorOpen(true);
              }}
              className="px-2 py-0.5 bg-green-600 hover:bg-green-700 text-white rounded text-[10px] font-bold transition-colors flex items-center gap-1 shadow-xs shrink-0"
              title="Edit full product details, availability & bulk tiers"
            >
              <Settings2 className="w-3 h-3" />
              <span>Edit Details</span>
            </button>
          </div>
        )}

        {/* Product Image Area with In-Place EditableImage */}
        <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-4">
          <EditableImage
            src={product.coverImage}
            alt={product.name}
            title={`Replace Image: ${product.name}`}
            buttonLabel="Change Image"
            onSave={async (newUrl) => {
              await updateProductInDb(product.id, { coverImage: newUrl });
            }}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            containerClassName="w-full h-full flex items-center justify-center"
          />

          {/* Hover Quick Actions (Customer Mode) */}
          {!isEditMode && (
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
              <button
                onClick={() => onQuickView(product)}
                className="p-2.5 bg-white text-slate-900 rounded-lg shadow hover:bg-slate-100 transition-colors text-xs font-semibold flex items-center gap-1.5"
                aria-label={`Quick view ${product.name}`}
              >
                <Eye className="w-4 h-4" />
                <span>Quick View</span>
              </button>
            </div>
          )}

          {/* Digital Badge top-left */}
          {product.isDigital && (
            <span className="absolute top-3 left-3 text-[11px] font-mono font-bold tracking-wider text-slate-700 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs z-10">
              {product.digitalFormat || 'STL'} MODEL
            </span>
          )}

          {!product.inStock && (
            <span className="absolute top-3 right-3 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded shadow-xs z-10">
              Made to Order
            </span>
          )}
        </div>

        {/* Card Content Area */}
        <div className="p-4 flex flex-col flex-1 justify-between gap-3">
          <div>
            {/* Metadata: Category · Print Type */}
            <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium mb-1.5">
              <span>{category?.name || '3D Print'}</span>
              <span aria-hidden="true">·</span>
              <span>{product.printType}</span>
              {product.rating > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-0.5 text-amber-600 font-semibold">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{product.rating}</span>
                    <span className="text-slate-600 font-normal">({product.reviewCount})</span>
                  </span>
                </>
              )}
            </div>

            {/* Product Title: Inline Editable in Edit Mode */}
            <div className="text-sm font-bold text-slate-900 line-clamp-2">
              {isEditMode ? (
                <EditableText
                  value={product.name}
                  as="h3"
                  className="text-sm font-bold text-slate-900"
                  onSave={async (newName) => {
                    await updateProductInDb(product.id, { name: newName });
                  }}
                />
              ) : (
                <h3
                  onClick={() => onQuickView(product)}
                  className="group-hover:text-green-600 transition-colors cursor-pointer"
                >
                  {product.name}
                </h3>
              )}
            </div>

            {/* Color Preview Swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {product.colors.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full border border-slate-300 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] text-slate-600 font-medium">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing & Add to Cart Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <div className="text-base font-extrabold text-slate-950 font-mono tabular-nums flex items-center">
                {isEditMode ? (
                  <EditableText
                    value={String(product.basePrice)}
                    type="number"
                    prefix="₹"
                    className="text-base font-extrabold text-slate-950 font-mono"
                    onSave={async (newPrice) => {
                      const num = Number(newPrice);
                      if (!isNaN(num) && num >= 0) {
                        await updateProductInDb(product.id, { basePrice: num });
                      }
                    }}
                  />
                ) : (
                  <span>₹{product.basePrice}</span>
                )}
              </div>
              {lowestBulkTier && lowestBulkTier.unitPrice && (
                <div className="text-[10px] text-emerald-800 font-semibold font-mono">
                  Bulk from ₹{lowestBulkTier.unitPrice}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {isEditMode ? (
                <button
                  onClick={() => setIsQuickEditorOpen(true)}
                  className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  Edit Tiers
                </button>
              ) : (
                <button
                  onClick={() => {
                    const defaultColor = product.colors?.[0]?.name;
                    const defaultSize = product.sizes?.[0]?.label;
                    const sizeMod = product.sizes?.[0]?.priceModifier || 0;
                    addToCart(product, {
                      color: defaultColor,
                      size: defaultSize,
                      sizeModifier: sizeMod,
                      quantity: 1,
                    });
                  }}
                  className="px-3 py-1.5 bg-theme hover:bg-theme-hover text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  aria-label={`Add ${product.name} to cart`}
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Product Quick Full Editor Modal */}
      {isQuickEditorOpen && (
        <ProductQuickEditorModal
          product={product}
          isOpen={isQuickEditorOpen}
          onClose={() => setIsQuickEditorOpen(false)}
        />
      )}
    </>
  );
};
