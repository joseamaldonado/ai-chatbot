import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  console.log(`Received webhook: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('✅ Subscription created:', {
          customerId: session.customer,
          subscriptionId: session.subscription,
          userId: session.metadata?.userId,
          tier: session.metadata?.tier,
        })

        // TODO: Update user in database with subscription info
        // await updateUserSubscription({
        //   userId: session.metadata?.userId,
        //   customerId: session.customer as string,
        //   subscriptionId: session.subscription as string,
        //   tier: session.metadata?.tier,
        //   status: 'active'
        // })
        
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('✅ Invoice paid:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
        })
        
        // TODO: Ensure user subscription is active
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('❌ Invoice payment failed:', {
          invoiceId: invoice.id,
          customerId: invoice.customer,
        })
        
        // TODO: Update user subscription status to 'past_due'
        // TODO: Send notification email to user
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('🗑️ Subscription cancelled:', {
          subscriptionId: subscription.id,
          customerId: subscription.customer,
        })
        
        // TODO: Update user subscription status to 'cancelled'
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}