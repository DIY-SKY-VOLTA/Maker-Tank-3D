export interface BulkTier {
  minQty: number;
  maxQty: number | null;
  unitPrice?: number;
  discountPercentage?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  basePrice: number;
  selectedColor?: string;
  selectedSize?: string;
  sizePriceModifier?: number;
  quantity: number;
  coverImage?: string;
  bulkTiers?: BulkTier[];
}

/**
 * Calculates the applicable unit price for a given quantity and bulk tier schedule.
 */
export function calculateUnitPrice(
  basePrice: number,
  quantity: number,
  tiers?: BulkTier[],
  sizeModifier: number = 0
): { unitPrice: number; discountPercentage: number; savingsPerUnit: number } {
  const adjustedBase = Math.max(0, basePrice + sizeModifier);
  if (!tiers || tiers.length === 0 || quantity <= 0) {
    return { unitPrice: adjustedBase, discountPercentage: 0, savingsPerUnit: 0 };
  }

  // Find the highest qualifying tier (where quantity >= minQty)
  const matchingTier = [...tiers]
    .filter(tier => quantity >= tier.minQty && (tier.maxQty === null || quantity <= tier.maxQty))
    .sort((a, b) => b.minQty - a.minQty)[0];

  if (!matchingTier) {
    return { unitPrice: adjustedBase, discountPercentage: 0, savingsPerUnit: 0 };
  }

  if (typeof matchingTier.unitPrice === 'number') {
    const finalUnit = Math.max(0, matchingTier.unitPrice + sizeModifier);
    const savings = Math.max(0, adjustedBase - finalUnit);
    const discountPct = adjustedBase > 0 ? Math.round((savings / adjustedBase) * 100) : 0;
    return {
      unitPrice: finalUnit,
      discountPercentage: discountPct,
      savingsPerUnit: savings,
    };
  }

  if (typeof matchingTier.discountPercentage === 'number') {
    const discountPct = Math.min(100, Math.max(0, matchingTier.discountPercentage));
    const savings = Math.round((adjustedBase * discountPct) / 100);
    const finalUnit = Math.max(0, adjustedBase - savings);
    return {
      unitPrice: finalUnit,
      discountPercentage: discountPct,
      savingsPerUnit: savings,
    };
  }

  return { unitPrice: adjustedBase, discountPercentage: 0, savingsPerUnit: 0 };
}

/**
 * Calculates subtotal, total discount savings, and grand total for a cart.
 */
export function calculateCartTotals(items: CartItem[]): {
  subtotal: number;
  totalSavings: number;
  grandTotal: number;
  totalQuantity: number;
} {
  let subtotal = 0;
  let grandTotal = 0;
  let totalQuantity = 0;

  for (const item of items) {
    const sizeMod = item.sizePriceModifier || 0;
    const baseUnit = item.basePrice + sizeMod;
    const itemSubtotal = baseUnit * item.quantity;
    const { unitPrice } = calculateUnitPrice(item.basePrice, item.quantity, item.bulkTiers, sizeMod);
    const itemTotal = unitPrice * item.quantity;

    subtotal += itemSubtotal;
    grandTotal += itemTotal;
    totalQuantity += item.quantity;
  }

  const totalSavings = Math.max(0, subtotal - grandTotal);
  return {
    subtotal,
    totalSavings,
    grandTotal,
    totalQuantity,
  };
}

/**
 * Builds the WhatsApp order click-to-chat URL with a clean, structured order message.
 */
export function generateWhatsAppOrderUrl(params: {
  whatsappNumber: string;
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  notes?: string;
}): string {
  const cleanNumber = params.whatsappNumber.replace(/[^0-9]/g, '');
  const { subtotal, totalSavings, grandTotal, totalQuantity } = calculateCartTotals(params.items);

  let message = `*NEW ORDER ENQUIRY - MAKER TANK 3D*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (params.customerName) {
    message += `👤 *Customer:* ${params.customerName}\n`;
  }
  if (params.customerPhone) {
    message += `📞 *Phone:* ${params.customerPhone}\n`;
  }
  if (params.deliveryAddress) {
    message += `📍 *Delivery Address:* ${params.deliveryAddress}\n`;
  }
  message += `\n📦 *Order Items (${totalQuantity} pcs):*\n`;

  params.items.forEach((item, index) => {
    const sizeMod = item.sizePriceModifier || 0;
    const { unitPrice, discountPercentage } = calculateUnitPrice(
      item.basePrice,
      item.quantity,
      item.bulkTiers,
      sizeMod
    );
    const lineTotal = unitPrice * item.quantity;

    message += `\n${index + 1}. *${item.name}*\n`;
    if (item.selectedColor) message += `   • Color: ${item.selectedColor}\n`;
    if (item.selectedSize) message += `   • Size: ${item.selectedSize}\n`;
    message += `   • Qty: ${item.quantity} × ₹${unitPrice}`;
    if (discountPercentage > 0) {
      message += ` (${discountPercentage}% bulk off)`;
    }
    message += ` = *₹${lineTotal}*\n`;
  });

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  if (totalSavings > 0) {
    message += `🏷️ Subtotal: ₹${subtotal}\n`;
    message += `🎉 Bulk Savings: -₹${totalSavings}\n`;
  }
  message += `💰 *TOTAL AMOUNT: ₹${grandTotal}*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;

  if (params.notes) {
    message += `📝 *Notes:* ${params.notes}\n`;
  }
  message += `\nPlease confirm availability and payment/delivery details. Thank you!`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
