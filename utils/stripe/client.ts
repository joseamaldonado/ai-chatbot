import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE ??
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
        ''
    );
  }
  return stripePromise;
};

// Consolidated subscription tier metadata (client-safe)
export const SUBSCRIPTION_PLANS = {
  weekly: {
    name: 'Weekly',
    price: 3.99,
    displayPrice: '$3.99',
    interval: 'week',
    intervalDisplay: '/week',
    description: 'Perfect for trying out premium features',
    features: [
      'Unlimited messages',
      'Advanced AI models', 
      'Priority support',
      'Chat history'
    ],
  },
  monthly: {
    name: 'Monthly', 
    price: 9.99,
    displayPrice: '$9.99',
    interval: 'month',
    intervalDisplay: '/month',
    description: 'Most popular choice',
    popular: true,
    features: [
      'Unlimited messages',
      'Advanced AI models',
      'Priority support', 
      'Chat history',
      'Export conversations'
    ],
  },
  yearly: {
    name: 'Yearly',
    price: 71.99,
    displayPrice: '$71.99',
    interval: 'year', 
    intervalDisplay: '/year',
    description: 'Best value for committed users',
    savings: 'Save 17%',
    features: [
      'Unlimited messages',
      'Advanced AI models',
      'Priority support',
      'Chat history', 
      'Export conversations',
      'Early access to new features'
    ],
  },
} as const;

// Type helper to get plan properties with optional fields
export type SubscriptionPlan = {
  name: string;
  price: number;
  displayPrice: string;
  interval: string;
  intervalDisplay: string;
  description: string;
  features: readonly string[];
  popular?: boolean;
  savings?: string;
};

export type SubscriptionTier = keyof typeof SUBSCRIPTION_PLANS;