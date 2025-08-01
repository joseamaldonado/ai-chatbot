'use client';

import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { SUBSCRIPTION_PLANS, getStripe } from '@/utils/stripe/client';
import { toast } from '@/components/toast';

interface SubscriptionPlansProps {
  onSuccess?: () => void;
}

export function SubscriptionPlans({ onSuccess }: SubscriptionPlansProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Convert plans object to array for easier rendering
  const plans = Object.entries(SUBSCRIPTION_PLANS).map(([id, plan]) => ({
    id,
    ...plan,
    popular: 'popular' in plan ? plan.popular : undefined,
    savings: 'savings' in plan ? plan.savings : undefined,
  }));

  const handlePlanSelect = async (planId: string) => {
    setSelectedPlan(planId);
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Checkout failed');
      }
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw new Error(error.message);
        }
      }
      
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Failed to start checkout. Please try again.',
      });
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Plan</h2>
        <p className="text-muted-foreground">
          Unlock unlimited conversations with Stoic wisdom
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative transition-all hover:shadow-lg cursor-pointer ${
              plan.popular ? 'border-primary shadow-lg scale-105 z-10' : ''
            } ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
            onClick={() => handlePlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                <span className="bg-primary text-primary-foreground px-3 py-1 text-sm rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <h3 className="text-xl font-semibold">{plan.name}</h3>
              <div className="text-3xl font-bold">
                {plan.displayPrice}
                <span className="text-lg text-muted-foreground font-normal">
                  {plan.intervalDisplay}
                </span>
              </div>
              {plan.savings && (
                <span className="text-sm text-green-600 font-medium">{plan.savings}</span>
              )}
              <p className="text-muted-foreground text-sm">{plan.description}</p>
            </CardHeader>
            
            <CardContent className="pt-0">
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="size-4 text-green-500 mr-3 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                disabled={isLoading && selectedPlan === plan.id}
                variant={plan.popular ? 'default' : 'outline'}
              >
                {isLoading && selectedPlan === plan.id ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      <div className="text-center mt-8 text-sm text-muted-foreground">
        <p>All plans include a 7-day free trial. Cancel anytime.</p>
        <p className="mt-1">Questions? Contact our support team.</p>
      </div>
    </div>
  );
}