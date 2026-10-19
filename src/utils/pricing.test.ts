import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateUnitPrice,
  calculateCartTotals,
  generateWhatsAppOrderUrl,
  type BulkTier,
  type CartItem,
} from './pricing.ts';

test('single item with no bulk tiers calculates regular unit price', () => {
  const result = calculateUnitPrice(199, 1);
  assert.equal(result.unitPrice, 199);
  assert.equal(result.discountPercentage, 0);
  assert.equal(result.savingsPerUnit, 0);
});

test('bulk tiers reduce unit price based on quantity brackets', () => {
  const tiers: BulkTier[] = [
    { minQty: 10, maxQty: 24, unitPrice: 49.9 },
    { minQty: 25, maxQty: 49, unitPrice: 45.0 },
    { minQty: 50, maxQty: null, unitPrice: 38.0 },
  ];

  // Under tier threshold
  assert.equal(calculateUnitPrice(59, 5, tiers).unitPrice, 59);

  // In 10-24 tier
  assert.equal(calculateUnitPrice(59, 10, tiers).unitPrice, 49.9);
  assert.equal(calculateUnitPrice(59, 20, tiers).unitPrice, 49.9);

  // In 25-49 tier
  assert.equal(calculateUnitPrice(59, 25, tiers).unitPrice, 45.0);

  // In 50+ tier
  assert.equal(calculateUnitPrice(59, 100, tiers).unitPrice, 38.0);
});

test('cart totals calculate combined subtotal, savings, and grand total', () => {
  const items: CartItem[] = [
    {
      id: 'item-1',
      productId: 'p-1',
      name: 'Modern Spiral Plant Pot',
      basePrice: 199,
      quantity: 2,
    },
    {
      id: 'item-2',
      productId: 'p-2',
      name: 'Custom Name Keychain',
      basePrice: 59,
      quantity: 10,
      bulkTiers: [{ minQty: 10, maxQty: 24, unitPrice: 49 }],
    },
  ];

  const totals = calculateCartTotals(items);
  // Item 1: 199 * 2 = 398
  // Item 2: base 59 * 10 = 590, discounted 49 * 10 = 490
  // Subtotal = 398 + 590 = 988
  // Grand total = 398 + 490 = 888
  // Total savings = 100
  assert.equal(totals.subtotal, 988);
  assert.equal(totals.grandTotal, 888);
  assert.equal(totals.totalSavings, 100);
  assert.equal(totals.totalQuantity, 12);
});

test('generateWhatsAppOrderUrl builds valid wa.me URL with encoded payload', () => {
  const items: CartItem[] = [
    {
      id: 'item-1',
      productId: 'p-1',
      name: 'Moon Lamp',
      basePrice: 499,
      quantity: 1,
      selectedColor: 'Warm White',
    },
  ];

  const url = generateWhatsAppOrderUrl({
    whatsappNumber: '+91 98765 43210',
    items,
    customerName: 'Rahul',
  });

  assert.ok(url.startsWith('https://wa.me/919876543210?text='));
  const decoded = decodeURIComponent(url.replace('https://wa.me/919876543210?text=', ''));
  assert.ok(decoded.includes('Rahul'));
  assert.ok(decoded.includes('Moon Lamp'));
  assert.ok(decoded.includes('Warm White'));
  assert.ok(decoded.includes('₹499'));
});
