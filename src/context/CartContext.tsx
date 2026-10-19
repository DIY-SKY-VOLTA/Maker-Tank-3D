import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/index.ts';
import {
  calculateCartTotals,
  generateWhatsAppOrderUrl,
  type CartItem,
} from '../utils/pricing.ts';

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (
    product: Product,
    options?: {
      color?: string;
      size?: string;
      sizeModifier?: number;
      quantity?: number;
    }
  ) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  subtotal: number;
  totalSavings: number;
  grandTotal: number;
  totalQuantity: number;
  generateWhatsAppUrl: (customer: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
    whatsappNumber: string;
  }) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'maker_tank_3d_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  const { subtotal, totalSavings, grandTotal, totalQuantity } = calculateCartTotals(items);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (
    product: Product,
    options?: {
      color?: string;
      size?: string;
      sizeModifier?: number;
      quantity?: number;
    }
  ) => {
    const qty = options?.quantity && options.quantity > 0 ? options.quantity : 1;
    const color = options?.color;
    const size = options?.size;
    const sizeMod = options?.sizeModifier || 0;

    setItems(prevItems => {
      // Find matching item with same product, color, and size
      const existingIndex = prevItems.findIndex(
        item =>
          item.productId === product.id &&
          item.selectedColor === color &&
          item.selectedSize === size
      );

      if (existingIndex > -1) {
        const next = [...prevItems];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + qty,
        };
        return next;
      }

      const newItem: CartItem = {
        id: `${product.id}-${color || 'default'}-${size || 'standard'}-${Date.now()}`,
        productId: product.id,
        name: product.name,
        basePrice: product.basePrice,
        selectedColor: color,
        selectedSize: size,
        sizePriceModifier: sizeMod,
        quantity: qty,
        coverImage: product.coverImage,
        bulkTiers: product.bulkTiers,
      };

      return [...prevItems, newItem];
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const generateWhatsAppUrl = (customer: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
    whatsappNumber: string;
  }) => {
    return generateWhatsAppOrderUrl({
      whatsappNumber: customer.whatsappNumber,
      items,
      customerName: customer.name,
      customerPhone: customer.phone,
      deliveryAddress: customer.address,
      notes: customer.notes,
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        openCart,
        closeCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalSavings,
        grandTotal,
        totalQuantity,
        generateWhatsAppUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
