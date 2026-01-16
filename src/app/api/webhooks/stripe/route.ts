import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getProfileByStripeCustomerId, updateProfile } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !endpointSecret) {
    console.error('Stripe environment variables not set');
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover',
  });

  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'No signature found' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed. Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan || 'PREMIUM';

          console.log('=== CHECKOUT SESSION COMPLETED ===');
          console.log('Session ID:', session.id);
          console.log('User ID:', userId);
          console.log('Customer ID:', session.customer);
          console.log('Plan from metadata:', plan);
          console.log('Full metadata:', session.metadata);

          if (userId && session.customer) {
            // Update profile's plan based on what was purchased and save customer ID
            console.log('Updating profile with plan:', plan);
            const result = await updateProfile(userId, {
              plan: plan,
              stripeCustomerId: session.customer as string
            });
            console.log('Profile updated:', result);
          } else {
            console.log('Missing userId or session.customer');
          }
        }
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          console.log('=== SUBSCRIPTION', event.type.toUpperCase(), '===');
          console.log('Subscription ID:', subscription.id);
          console.log('Customer ID:', customerId);
          console.log('Subscription status:', subscription.status);

          // Find profile by stripeCustomerId
          const profile = await getProfileByStripeCustomerId(customerId);

          console.log('Profile found:', profile ? profile.id : 'NOT FOUND');

          if (profile) {
            // Determine if the subscription is active
            const isActive = subscription.status === 'active' || subscription.status === 'trialing';

            console.log('Is active:', isActive);

            if (isActive && subscription.items.data.length > 0) {
              // Get the price ID to determine the plan
              const priceId = subscription.items.data[0].price.id;
              const basicPriceId = process.env.STRIPE_BASIC_PRICE_ID;
              const premiumPriceId = process.env.STRIPE_PREMIUM_PRICE_ID;

              console.log('Price ID from subscription:', priceId);
              console.log('STRIPE_BASIC_PRICE_ID:', basicPriceId);
              console.log('STRIPE_PREMIUM_PRICE_ID:', premiumPriceId);

              let plan = 'PREMIUM'; // Default to PREMIUM
              if (priceId === basicPriceId) {
                plan = 'BASICO';
              }

              console.log('Setting plan to:', plan);
              await updateProfile(profile.id, { plan });
            } else {
              // Subscription not active, downgrade to FREE
              console.log('Subscription not active, setting to FREE');
              await updateProfile(profile.id, { plan: 'FREE' });
            }
          }
        }
        break;

      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
        {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          // Find profile by stripeCustomerId
          const profile = await getProfileByStripeCustomerId(customerId);

          if (profile) {
            // Downgrade profile to FREE plan
            await updateProfile(profile.id, { plan: 'FREE' });
          }
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}
