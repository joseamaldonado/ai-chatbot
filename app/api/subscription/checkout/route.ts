import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { stripe, PRICE_IDS } from '@/utils/stripe/config';
import { getUserById } from '@/lib/db/queries';

// Helper to get the current URL
function getURL(path: string = '') {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL ?? 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'http://localhost:3000';
  return `${baseURL}${path}`;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already has an active subscription
    const user = await getUserById(session.user.id);
    if (user?.subscriptionStatus === 'active' || user?.subscriptionStatus === 'trialing') {
      return NextResponse.json(
        { error: 'You already have an active subscription. Please manage your subscription from your account settings.' },
        { status: 400 }
      );
    }

    const { planId } = await req.json();
    
    // Validate plan ID
    if (!planId || !PRICE_IDS[planId as keyof typeof PRICE_IDS]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
    }

    // Get the correct price ID for the selected plan
    const priceId = PRICE_IDS[planId as keyof typeof PRICE_IDS];

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      success_url: getURL('/subscription/success?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: getURL('/?cancelled=true'),
      customer_email: session.user.email!,
      metadata: {
        userId: session.user.id,
        tier: planId,
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
      // Add trial period (3 days) and metadata
      subscription_data: {
        trial_period_days: 3,
        metadata: {
          userId: session.user.id,
          tier: planId,
        },
      },
      // Collect tax if applicable
      automatic_tax: {
        enabled: true,
      },
    });

    console.log(`Created checkout session for user ${session.user.id}, plan: ${planId}`);

    return NextResponse.json({ 
      sessionId: checkoutSession.id,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' }, 
      { status: 500 }
    );
  }
}