export async function createCheckout(priceId: string) {
  console.log('[Stripe] Creating checkout with price ID:', priceId);
  
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ priceId }),
  });

  const responseData = await res.json();
  
  if (!res.ok) {
    console.error('[Stripe] Checkout failed:', responseData);
    throw new Error(responseData.error || `Checkout failed: ${res.status}`);
  }

  console.log('[Stripe] Checkout session created successfully');
  return responseData.url as string;
}
