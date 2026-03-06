import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import prisma from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  let priceId: string | undefined;
  let domain: string;

  try {
    const body = await request.json();
    priceId = body.priceId;

    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 });
    }

    // resolve current Clerk user (server-side)
    const user = await currentUser();
    const clerkId = user?.id;

    domain = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // try to reuse existing Stripe customer linked to the Clerk user
    let stripeCustomerId: string | undefined;
    if (clerkId) {
      const dbUser = await prisma.user.findUnique({ where: { clerkId } });
      stripeCustomerId = dbUser?.stripeCustomerId ?? undefined;
    }

    // create a Stripe customer if we don't have one yet and we have a clerkId
    if (!stripeCustomerId && clerkId) {
      const customer = await stripe.customers.create({ metadata: { clerkId } });
      stripeCustomerId = customer.id;
      await prisma.user.upsert({
        where: { clerkId },
        update: { stripeCustomerId },
        create: { clerkId, stripeCustomerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${domain}/?checkout=success`,
      cancel_url: `${domain}/?checkout=cancelled`,
      customer: stripeCustomerId,
      metadata: { clerkId: clerkId ?? '' },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('Stripe checkout error:', errorMessage);
    console.error('Full error:', err);

    // Debug logging for environment variables (safe)
    const hasSecretKey = !!process.env.STRIPE_SECRET_KEY;
    const secretKeyLength = process.env.STRIPE_SECRET_KEY?.length || 0;
    const priceIdLog = priceId || 'undefined';

    console.log(`[Debug] Stripe Secret Key present: ${hasSecretKey} (Length: ${secretKeyLength})`);
    console.log(`[Debug] Price ID received: ${priceIdLog}`);
    console.log(`[Debug] App URL (Domain): ${domain}`);

    return NextResponse.json({
      error: errorMessage || 'Failed to create checkout session',
      debug: { hasSecretKey, priceIdProvided: !!priceId }
    }, { status: 500 });
  }
}
