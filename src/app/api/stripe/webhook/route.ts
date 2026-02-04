import { NextRequest, NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  const sig = request.headers.get('stripe-signature') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  const buf = Buffer.from(await request.arrayBuffer());

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err);
    return NextResponse.json({ received: false }, { status: 400 });
  }

  // Handle relevant events (expand as needed)
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const clerkId = session.metadata?.clerkId as string | undefined;
        const customerId = session.customer as string | undefined;
        const subscriptionId = session.subscription as string | undefined;

        let currentPeriodEnd: Date | null = null;
        if (subscriptionId) {
          try {
            const subscription = await stripe.subscriptions.retrieve(subscriptionId);
            const periodEnd = (subscription as any)?.current_period_end;
            if (periodEnd) {
              currentPeriodEnd = new Date(periodEnd * 1000);
            }
          } catch (e) {
            console.warn('Failed to fetch subscription', e);
          }
        }

        if (clerkId) {
          await prisma.user.upsert({
            where: { clerkId },
            update: {
              plan: 'pro',
              credits: 200,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd: currentPeriodEnd ?? undefined,
            },
            create: {
              clerkId,
              plan: 'pro',
              credits: 200,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd: currentPeriodEnd ?? undefined,
            },
          });
        } else if (customerId) {
          // If we don't have clerkId, try to find existing user by stripeCustomerId
          await prisma.user.upsert({
            where: { stripeCustomerId: customerId },
            update: {
              plan: 'pro',
              credits: 200,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd: currentPeriodEnd ?? undefined,
            },
            create: {
              clerkId: '',
              plan: 'pro',
              credits: 200,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              currentPeriodEnd: currentPeriodEnd ?? undefined,
            },
          });
        }

        console.log('Checkout session completed for', customerId);
        break;
      }
      case 'invoice.payment_succeeded': {
        // optionally extend credits on recurring invoice payment
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const subscriptionId = subscription.id as string | undefined;
        if (subscriptionId) {
          await prisma.user.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { plan: 'free', credits: 5, stripeSubscriptionId: null },
          });
        }
        break;
      }
      default:
        // Unhandled event type
        break;
    }
  } catch (e) {
    console.error('Error handling webhook event', e);
    return NextResponse.json({ received: false }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
