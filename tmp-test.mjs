const payload = {
  cartItems: [
    {
      productId: 'abc123abc123abc123abc123',
      quantity: 2,
      unitPrice: 49.99,
    },
    {
      productId: 'def123abc123abc123abc123',
      quantity: 1,
      unitPrice: 39.99,
    },
  ],
};

(async () => {
  const { normalizeCheckoutPayload } = await import('./lib/ordersSync.ts');
  console.log(normalizeCheckoutPayload(payload));
})();
