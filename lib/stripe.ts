import Stripe from 'stripe';

// Shared Stripe client instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export type SubscriptionTier = 'weekly' | 'monthly' | 'yearly';

// Centralized price configuration
export const PRICE_IDS: Record<SubscriptionTier, string> = {
  weekly: process.env.STRIPE_PRICE_WEEKLY!,
  monthly: process.env.STRIPE_PRICE_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_YEARLY!,
};

// Subscription tier metadata for UI
export const SUBSCRIPTION_PLANS = {
  weekly: {
    name: 'Weekly',
    price: '$3.99',
    interval: '/week',
    description: 'Perfect for trying out premium features',
    priceId: PRICE_IDS.weekly,
  },
  monthly: {
    name: 'Monthly', 
    price: '$9.99',
    interval: '/month',
    description: 'Most popular choice',
    priceId: PRICE_IDS.monthly,
    savings: 'Save 20%',
  },
  yearly: {
    name: 'Yearly',
    price: '$29.99', 
    interval: '/year',
    description: 'Best value for committed users',
    priceId: PRICE_IDS.yearly,
    savings: 'Save 40%',
  },
} as const;