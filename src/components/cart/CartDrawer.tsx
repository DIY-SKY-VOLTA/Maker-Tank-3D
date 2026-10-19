import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, MessageCircle, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useStore } from '../../context/StoreContext.tsx';
import { calculateUnitPrice } from '../../utils/pricing.ts';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalSavings,
    grandTotal,
    totalQuantity,
    generateWhatsAppUrl,
  } = useCart();

  const { settings } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleSendWhatsAppOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    const targetUrl = generateWhatsAppUrl({
      whatsappNumber: settings?.whatsappNumber || '+919876543210',
      name: customerName,
      phone: customerPhone,
      address: deliveryAddress,
      notes,
    });

    window.open(targetUrl, '_blank');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-slate-200 animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-green-600" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Your Cart ({totalQuantity} items)
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
            aria-label="Close cart drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {items.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Your cart is currently empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Explore our ready-made 3D prints, custom keychains, or downloadable 3D models.
              </p>
              <button
                onClick={closeCart}
                className="mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-3">
                {items.map(item => {
                  const sizeMod = item.sizePriceModifier || 0;
                  const { unitPrice, discountPercentage } = calculateUnitPrice(
                    item.basePrice,
                    item.quantity,
                    item.bulkTiers,
                    sizeMod
                  );
                  const lineTotal = unitPrice * item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex gap-3.5 items-center justify-between"
                    >
                      {/* Thumbnail */}
                      <div className="w-16 h-16 rounded-lg bg-white border border-slate-200 p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        {item.coverImage ? (
                          <img
                            src={item.coverImage}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                          {item.selectedColor && <span>{item.selectedColor}</span>}
                          {item.selectedColor && item.selectedSize && <span>·</span>}
                          {item.selectedSize && <span>{item.selectedSize}</span>}
                        </div>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            ₹{unitPrice}
                          </span>
                          {discountPercentage > 0 && (
                            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold font-mono">
                              -{discountPercentage}%
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Stepper & Line Total */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="text-xs font-extrabold text-slate-950 font-mono">
                          ₹{lineTotal}
                        </div>

                        <div className="flex items-center border border-slate-200 rounded-md bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-100 text-slate-500"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-100 text-slate-500"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors"
                          title="Remove item"
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Delivery Information Form */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Customer &amp; Delivery Details</span>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    placeholder="Your Full Name *"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />

                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="WhatsApp Phone Number *"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />

                  <textarea
                    value={deliveryAddress}
                    onChange={e => setDeliveryAddress(e.target.value)}
                    placeholder="Delivery Address, City &amp; PIN code..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-green-500 resize-none"
                  />

                  <input
                    type="text"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Customisation text / notes (e.g. name on keychain)..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer & WhatsApp CTA */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Summary */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal ({totalQuantity} items):</span>
                <span className="font-mono tabular-nums">₹{subtotal}</span>
              </div>

              {totalSavings > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Bulk Tier Savings:</span>
                  </span>
                  <span className="font-mono tabular-nums">-₹{totalSavings}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-base font-mono tabular-nums">₹{grandTotal}</span>
              </div>
            </div>

            {/* Direct Order via WhatsApp Button */}
            <button
              onClick={handleSendWhatsAppOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 focus:outline-none cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white shrink-0" />
              <span>Send Order to WhatsApp (₹{grandTotal})</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </button>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>No online gateway fee required</span>
              <button
                onClick={clearCart}
                className="hover:text-red-500 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
