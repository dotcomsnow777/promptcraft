import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY || '';

// Do not force an API version here; use Stripe's default or manage via env if needed.
const stripe = new Stripe(secretKey, {});

export default stripe;
