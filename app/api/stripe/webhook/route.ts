import { NextResponse } from "next/server";
import Stripe from 'stripe';
import { updateUserSubscription, getUserByStripeSubscriptionId, getUserByStripeCustomerId } from '@/lib/db/queries';
import { stripe } from '@/utils/stripe/config';

const relevantEvents = new Set([
  "checkout.session.completed",
  "customer.subscription.updated", 
  "customer.subscription.deleted",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
]);

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    // Get the raw body text for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: "Missing signature or webhook secret" },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.log(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }

  console.log(`Received event: ${event.type}`);

  // Only process relevant events
  if (!relevantEvents.has(event.type)) {
    return NextResponse.json({ received: true });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('Subscription created:', {
          customerId: session.customer,
          subscriptionId: session.subscription,
          userId: session.metadata?.userId,
          tier: session.metadata?.tier,
        });
        
        if (session.metadata?.userId && session.subscription) {
          // Get the actual subscription to check its status
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await updateUserSubscription({
            userId: session.metadata.userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            subscriptionTier: session.metadata.tier as 'weekly' | 'monthly' | 'yearly',
            subscriptionStatus: subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing',
            subscriptionEndsAt: new Date(subscription.items.data[0].current_period_end * 1000),
          });
          console.log(`Updated subscription for user: ${session.metadata.userId}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription updated: ${subscription.id} - Status: ${subscription.status}`);
        
        // Find user by subscription ID and update status
        const user = await getUserByStripeSubscriptionId(subscription.id);
        if (user) {
          await updateUserSubscription({
            userId: user.id,
            subscriptionStatus: subscription.status as 'active' | 'canceled' | 'past_due' | 'incomplete' | 'trialing',
            subscriptionEndsAt: subscription.items?.data?.[0]?.current_period_end 
              ? new Date(subscription.items.data[0].current_period_end * 1000) 
              : undefined,
          });
          console.log(`Updated subscription status to ${subscription.status} for user: ${user.id}`);
        } else {
          console.log(`No user found with subscription ID: ${subscription.id}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription cancelled: ${subscription.id}`);
        
        // Find user by subscription ID and revert to free tier
        const user = await getUserByStripeSubscriptionId(subscription.id);
        if (user) {
          await updateUserSubscription({
            userId: user.id,
            subscriptionTier: 'free',
            subscriptionStatus: 'canceled',
            subscriptionEndsAt: new Date(), // Set to now since subscription is cancelled
          });
          console.log(`Reverted user ${user.id} to free tier due to subscription cancellation`);
        } else {
          console.log(`No user found with subscription ID: ${subscription.id}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        console.log(`Invoice paid: ${invoice.id}`);
        
        // For recurring payments, ensure subscription remains active
        if (invoice.subscription) {
          const subscriptionId = invoice.subscription;
          
          // Find user by subscription ID and ensure they're active
          const user = await getUserByStripeSubscriptionId(subscriptionId);
          if (user) {
            await updateUserSubscription({
              userId: user.id,
              subscriptionStatus: 'active', // Payment succeeded, so subscription is active
            });
            console.log(`Confirmed active subscription for user ${user.id} after successful payment`);
          } else {
            console.log(`No user found with subscription ID: ${subscriptionId}`);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        console.log(`Invoice payment failed: ${invoice.id}`);
        
        // Update user subscription status to 'past_due' when payment fails
        if (invoice.subscription) {
          const subscriptionId = invoice.subscription;
          
          // Find user by subscription ID and mark as past_due
          const user = await getUserByStripeSubscriptionId(subscriptionId);
          if (user) {
            await updateUserSubscription({
              userId: user.id,
              subscriptionStatus: 'past_due', // Payment failed, subscription is past due
            });
            console.log(`Marked subscription as past_due for user ${user.id} due to failed payment`);
            // TODO: Send notification email to user about failed payment
          } else {
            console.log(`No user found with subscription ID: ${subscriptionId}`);
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error(`Error processing webhook:`, error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}