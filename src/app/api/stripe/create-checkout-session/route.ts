import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';
import { getProfileById, updateProfile, createProfile } from '@/lib/db/queries';

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
    });

    // Get authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the plan from request body
    const body = await req.json();
    const plan = body.plan || 'PREMIUM';

    // Validate plan and get the corresponding price ID
    let priceId: string | undefined;
    if (plan === 'BASICO') {
      priceId = process.env.STRIPE_BASIC_PRICE_ID;
    } else if (plan === 'PREMIUM') {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    } else {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    if (!priceId) {
      return NextResponse.json({ error: `Price ID for ${plan} plan not configured` }, { status: 500 });
    }

    // Get or create profile
    let profile = await getProfileById(user.id);
    if (!profile) {
      profile = await createProfile(user.id);
    }

    // If user doesn't have a stripeCustomerId, create a customer in Stripe
    let stripeCustomerId = profile.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || '',
        metadata: {
          userId: user.id,
        },
      });

      stripeCustomerId = customer.id;

      // Update profile with the new stripeCustomerId
      profile = await updateProfile(user.id, { stripeCustomerId });
    }

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      metadata: {
        userId: user.id,
        plan: plan,
      },
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}
