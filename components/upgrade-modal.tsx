'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SubscriptionPlans } from './subscription-plans';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from './toast';
import { useState } from 'react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSubscribed?: boolean;
  trigger?: 'rate_limit' | 'feature_access' | 'manual';
}

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  isSubscribed = false,
  trigger = 'manual' 
}: UpgradeModalProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  const handleCustomerPortal = async () => {
    setIsLoadingPortal(true);
    try {
      const response = await fetch('/api/billing/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to access customer portal');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Customer portal error:', error);
      toast({
        type: 'error',
        description: error instanceof Error ? error.message : 'Failed to access customer portal. Please try again.',
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };
  
  const getTitleAndDescription = () => {
    if (isSubscribed) {
      return {
        title: 'Subscription Status',
        description: 'Manage your active subscription.'
      };
    }
    
    switch (trigger) {
      case 'rate_limit':
        return {
          title: 'Daily Message Limit Reached',
          description: 'Upgrade to continue your conversations with unlimited daily messages.'
        };
      case 'feature_access':
        return {
          title: 'Unlock Premium Features',
          description: 'Access advanced AI models and exclusive features with a subscription.'
        };
      default:
        return {
          title: 'Upgrade Your Experience',
          description: 'Get unlimited access to Stoic wisdom and advanced features.'
        };
    }
  };

  const { title, description } = getTitleAndDescription();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div>
            <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
            <p className="text-muted-foreground mt-1">{description}</p>
          </div>
        </DialogHeader>
        
        <div className="px-0 pb-6">
          {isSubscribed ? (
            <div className="text-center py-8 px-6">
              <h3 className="text-xl font-semibold mb-2">You&apos;re Subscribed!</h3>
              <p className="text-muted-foreground mb-6">
                You currently have an active subscription with unlimited messaging.
              </p>
              <Button 
                variant="outline" 
                onClick={handleCustomerPortal}
                disabled={isLoadingPortal}
              >
                {isLoadingPortal ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Manage Billing'
                )}
              </Button>
            </div>
          ) : (
            <SubscriptionPlans 
              onSuccess={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}