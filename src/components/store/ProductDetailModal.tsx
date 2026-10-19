import React, { useState } from 'react';
import { X, Star, Plus, Minus, MessageCircle, ShoppingBag, ShieldCheck, Sparkles, Layers, Check, Settings2, ImagePlus } from 'lucide-react';
import type { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { calculateUnitPrice } from '../../utils/pricing.ts';
import { EditableText } from '../inline-editor/EditableText.tsx';
import { EditableImage } from '../inline-editor/EditableImage.tsx';
import { ProductQuickEditorModal } from '../inline-editor/ProductQuickEditorModal.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  if (!product) return null;
  return <ProductDetailModalContent key={product.id} product={product} onClose={onClose} />;
};

const ProductDetailModalContent: React.FC<{ product: Product; onClose: () => void }> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { settings, categories, updateProductInDb } = useStore();
  const { isEditMode } = useAuth();

  const [isQuickEditorOpen, setIsQuickEditorOpen] = useState(false);
  const category = categories.find(c => c.id === product.categoryId);

  const [activeImage, setActiveImage] = useState<string>(product.coverImage);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colors?.[0]?.name || ''
  );
  const [selectedSizeIndex, setSelectedSizeIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const currentSize = product.sizes?.[selectedSizeIndex];
  const sizeModifier = currentSize?.priceModifier || 0;

  const { unitPrice, discountPercentage, savingsPerUnit } = calculateUnitPrice(
    product.basePrice,
    quantity,
    product.bulkTiers,
    sizeModifier
  );

  const totalPrice = unitPrice * quantity;

  // Direct WhatsApp Enquiry for this single configured product
  const handleDirectWhatsApp = () => {
    const cleanNumber = (settings?.whatsappNumber || '919876543210').replace(/[^0-9]/g, '');
    let msg = `*PRODUCT ENQUIRY - MAKER TANK 3D*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Item: *${product.name}*\n`;
    if (selectedColor) msg += `Color: ${selectedColor}\n`;
    if (currentSize) msg += `Size: ${currentSize.label}\n`;
    msg += `Quantity: ${quantity} pcs\n`;
    msg += `Unit Price: ₹${unitPrice}`;
    if (discountPercentage > 0) msg += ` (${discountPercentage}% bulk discount)`;
    msg += `\n*Total Estimate: ₹${totalPrice}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `Hello! I would like to order this item. Please share timeline and payment details.`;

    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddToCart = () => {
    addToCart(product, {
      color: selectedColor || undefined,
      size: currentSize?.label,
      sizeModifier,
      quantity,
    });
    onClose();
  };

  const allImages = [product.coverImage, ...(product.galleryImages || [])].filter(
    (v, i, a) => a.indexOf(v) === i
  );

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          {/* Admin In-Place Header Bar in Edit Mode */}
          {isEditMode && (
            <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span>Admin: In-Place Product Editor</span>
              </span>
              <button
                onClick={() => setIsQuickEditorOpen(true)}
                className="px-2.5 py-1 bg-white text-slate-900 hover:bg-green-50 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Settings2 className="w-3.5 h-3.5 text-green-600" />
                <span>Edit Full Product &amp; Tiers</span>
              </button>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-900 bg-white/80 hover:bg-white rounded-full transition-colors shadow-xs"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
            {/* Left: Gallery & Zoom */}
            <div className="flex flex-col-reverse sm:flex-row gap-4">
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-96 shrink-0">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all p-1 bg-slate-50 shrink-0 ${
                        activeImage === img
                          ? 'border-orange-600 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Featured Image with In-Place EditableImage */}
              <div className="flex-1 aspect-square bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center p-6 overflow-hidden relative">
                <EditableImage
                  src={activeImage}
                  alt={product.name}
                  title={`Replace Image: ${product.name}`}
                  buttonLabel="Change Image"
                  onSave={async (newUrl) => {
                    // Update coverImage or add to gallery
                    const isCover = activeImage === product.coverImage;
                    if (isCover) {
                      await updateProductInDb(product.id, { coverImage: newUrl });
                    } else {
                      const updatedGallery = (product.galleryImages || []).map(img => img === activeImage ? newUrl : img);
                      await updateProductInDb(product.id, { galleryImages: updatedGallery });
                    }
                    setActiveImage(newUrl);
                  }}
                  className="w-full h-full object-contain"
                  containerClassName="w-full h-full flex items-center justify-center"
                />
              </div>
            </div>

            {/* Right: Contiguous Purchase Module */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Category & Ratings */}
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-1">
                  <span>Home</span>
                  <span>/</span>
                  <span>{category?.name || 'Catalog'}</span>
                  <span>/</span>
                  <span className="text-slate-900 font-semibold">{product.name}</span>
                </div>

                {/* Product Title: Inline Editable */}
                <div className="text-2xl font-extrabold text-slate-950 tracking-tight mb-2">
                  {isEditMode ? (
                    <EditableText
                      value={product.name}
                      as="h2"
                      className="text-2xl font-extrabold text-slate-950 tracking-tight"
                      onSave={async (newName) => {
                        await updateProductInDb(product.id, { name: newName });
                      }}
                    />
                  ) : (
                    <h2>{product.name}</h2>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-800 ml-1">
                      {product.rating}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    ({product.reviewCount} customer reviews)
                  </span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                    product.inStock
                      ? 'text-emerald-600 bg-emerald-50'
                      : 'text-amber-700 bg-amber-50'
                  }`}>
                    {product.inStock ? 'In Stock (Ready to Print)' : 'Made to Order'}
                  </span>
                </div>

                {/* Price & Bulk Callout with Inline Edit for Base Price */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-5 flex items-baseline justify-between">
                  <div>
                    <div className="text-3xl font-black text-slate-950 font-mono tabular-nums flex items-center">
                      {isEditMode ? (
                        <EditableText
                          value={String(product.basePrice)}
                          type="number"
                          prefix="₹"
                          className="text-3xl font-black text-slate-950 font-mono"
                          onSave={async (newPrice) => {
                            const num = Number(newPrice);
                            if (!isNaN(num) && num >= 0) {
                              await updateProductInDb(product.id, { basePrice: num });
                            }
                          }}
                        />
                      ) : (
                        <span>₹{unitPrice}</span>
                      )}
                    </div>
                    {sizeModifier !== 0 && (
                      <div className="text-[11px] text-slate-500">
                        Base ₹{product.basePrice} + size ₹{sizeModifier}
                      </div>
                    )}
                  </div>

                  {discountPercentage > 0 && (
                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg font-mono">
                        {discountPercentage}% Bulk Discount
                      </span>
                      <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                        Saving ₹{savingsPerUnit} per unit
                      </div>
                    </div>
                  )}
                </div>

                {/* Description: Inline Editable */}
                <div className="text-xs text-slate-600 leading-relaxed mb-5">
                  {isEditMode ? (
                    <EditableText
                      value={product.description}
                      as="p"
                      multiline={true}
                      className="text-xs text-slate-600 leading-relaxed"
                      placeholder="Enter product description..."
                      onSave={async (newDesc) => {
                        await updateProductInDb(product.id, { description: newDesc });
                      }}
                    />
                  ) : (
                    <p>{product.description}</p>
                  )}
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                      <span>Select Color:</span>
                      <span className="text-orange-600 font-semibold">{selectedColor}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {product.colors.map(c => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          className={`w-7 h-7 rounded-full border-2 transition-transform p-0.5 flex items-center justify-center ${
                            selectedColor === c.name
                              ? 'border-orange-600 scale-110 shadow-xs'
                              : 'border-slate-300 hover:scale-105'
                          }`}
                          title={c.name}
                        >
                          <span
                            className="w-full h-full rounded-full flex items-center justify-center"
                            style={{ backgroundColor: c.hex }}
                          >
                            {selectedColor === c.name && (
                              <Check className={`w-3 h-3 ${c.hex === '#ffffff' ? 'text-slate-900' : 'text-white'}`} />
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-900 mb-1.5">
                      Select Dimensions / Scale:
                    </label>
                    <select
                      value={selectedSizeIndex}
                      onChange={e => setSelectedSizeIndex(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    >
                      {product.sizes.map((s, idx) => (
                        <option key={idx} value={idx}>
                          {s.label} {s.priceModifier > 0 ? `(+₹${s.priceModifier})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Bulk Pricing Tier Breakdown Table */}
                {product.bulkTiers && product.bulkTiers.length > 0 && (
                  <div className="mb-5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-orange-600" />
                        <span>Configurable Bulk Pricing Tiers</span>
                      </div>
                      {isEditMode && (
                        <button
                          onClick={() => setIsQuickEditorOpen(true)}
                          className="text-[10px] text-orange-600 hover:underline font-bold"
                        >
                          Edit Tiers →
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-1.5 bg-white rounded border border-slate-200">
                        <div className="text-[10px] text-slate-500 font-semibold">1 – 9 pcs</div>
                        <div className="font-bold text-slate-900 font-mono">₹{product.basePrice + sizeModifier}</div>
                      </div>
                      {product.bulkTiers.map((tier, idx) => (
                        <div
                          key={idx}
                          className={`p-1.5 rounded border transition-colors ${
                            quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty)
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-900'
                              : 'bg-white border-slate-200 text-slate-700'
                          }`}
                        >
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} pcs
                          </div>
                          <div className="font-bold font-mono">
                            ₹{tier.unitPrice ? tier.unitPrice + sizeModifier : Math.round((product.basePrice + sizeModifier) * (1 - (tier.discountPercentage || 0) / 100))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Stepper */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-bold text-slate-900">Quantity:</span>
                  <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-slate-100 transition-colors text-slate-600"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-12 text-center text-xs font-bold text-slate-900 font-mono">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-slate-100 transition-colors text-slate-600"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-xs text-slate-500">
                    Total: <span className="font-bold text-slate-900 font-mono">₹{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-4 border-t border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 px-4 bg-theme hover:bg-theme-hover text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart (₹{totalPrice})</span>
                  </button>

                  <button
                    onClick={handleDirectWhatsApp}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[10px] text-slate-500 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span>High Detail Print</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span>Durable Material</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span>Perfect for Gifts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span>Quality Inspected</span>
                  </div>
                </div>
              </div>
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
