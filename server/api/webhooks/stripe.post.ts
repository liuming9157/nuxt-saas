import type Stripe from 'stripe'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event, 'utf-8')
  const signature = getHeader(event, 'Stripe-Signature') as string

  const stripe = useStripe()

  let stripe_event: Stripe.Event

  try {
    stripe_event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 400,
      statusMessage: `Webhook Error:construct fail`
    })
  }
  const db = useDrizzle()
  if (stripe_event.type === 'checkout.session.completed') {
    const session = stripe_event.data.object as Stripe.Checkout.Session

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    )
    const subscription_db = await db.query.subscription.findFirst({
      where: eq(tables.subscription.userId, session?.metadata?.userId)
    })
    if (subscription_db) {
      await db.update(tables.subscription)
        .set({
          stripeCustomerId: subscription.customer as string,
          stripeSubscriptionId: subscription.id,
          stripePriceId: subscription.items.data[0].price.id,
          stripeCurrentPeriodEnd: new Date(
            subscription.items.data[0].current_period_end * 1000
          ),
          status: 'paid'
        })
        .where(eq(tables.subscription.userId, session?.metadata?.userId))
    } else {
      await db.insert(tables.subscription).values({
        userId: session?.metadata?.userId,
        stripeCustomerId: subscription.customer as string,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(
          subscription.items.data[0].current_period_end * 1000
        ),
        status: 'paid'
      })
    }
  }
  if (stripe_event.type === 'invoice.payment_succeeded') {
    const session = stripe_event.data.object as Stripe.Invoice

    // If the billing reason is not subscription_create, it means the customer has updated their subscription.
    // If it is subscription_create, we don't need to update the subscription id and it will handle by the checkout.session.completed event.
    // https://docs.stripe.com/api/invoices/object
    if (session.billing_reason == 'subscription_cycle') {
      const invoiceLineItems = await stripe.invoices.listLineItems(
        session.id
      )

      await db.update(tables.subscription)
        .set({
          stripeCurrentPeriodEnd: new Date(
            invoiceLineItems.data[0].period.end * 1000
          )
        })
        .where(eq(tables.subscription.stripeCustomerId, session.customer as string))
    }
    // TODO: handle other billing reason eg. subscription_update
  }
  return null
})
