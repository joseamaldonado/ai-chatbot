'use server';

import { stripe } from '@/utils/stripe/config';
import { PRICE_IDS, type SubscriptionTier } from '@/utils/stripe/config';
import { redirect } from 'next/navigation';

// Helper to get the current URL
function getURL(path: string = '') {
  const baseURL = process.env.NEXT_PUBLIC_SITE_URL ?? 
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
    'http://localhost:3000';
  return `${baseURL}${path}`;
}

// Create checkout session (server action)
export async function createCheckoutSession(
  planId: SubscriptionTier,
  customerEmail?: string
) {
  try {
    const priceId = PRICE_IDS[planId];
    
    if (!priceId) {
      throw new Error(`Invalid plan: ${planId}`);
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: getURL('/subscription/success?session_id={CHECKOUT_SESSION_ID}'),
      cancel_url: getURL('/'),
      customer_email: customerEmail,
      metadata: {
        planId,
      },
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
}

// Create customer portal session
export async function createCustomerPortalSession(customerId: string) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: getURL('/'),
    });

    return { url: session.url };
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    throw new Error('Failed to create customer portal session');
  }
}

// Get or create Stripe customer
export async function getOrCreateCustomer(email: string, userId?: string) {
  try {
    // First, try to find existing customer by email
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer
    const customer = await stripe.customers.create({
      email,
      metadata: userId ? { userId } : {},
    });

    return customer;
  } catch (error) {
    console.error('Error getting or creating customer:', error);
    throw new Error('Failed to get or create customer');
  }
}

// Redirect to checkout (for form actions)
export async function redirectToCheckout(planId: SubscriptionTier) {
  const { sessionId } = await createCheckoutSession(planId);
  redirect(`/api/stripe/checkout?session_id=${sessionId}`);
}

// Redirect to customer portal
export async function redirectToCustomerPortal(customerId: string) {
  const { url } = await createCustomerPortalSession(customerId);
  redirect(url);
}