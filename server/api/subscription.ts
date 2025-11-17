export default defineEventHandler(async (event) => {
  const { title, isYearly } = await readBody(event)
  const pro_monthly = process.env.STRIPE_PRO_MONTHLY_PLAN_ID
  const pro_yearly = process.env.STRIPE_PRO_YEARLY_PLAN_ID
  const business_monthly = process.env.STRIPE_BUSINESS_MONTHLY_PLAN_ID
  const business_yearly = process.env.STRIPE_BUSINESS_YEARLY_PLAN_ID
  let price_id
  console.log(pro_monthly, pro_yearly, business_monthly, business_yearly)
  if (title === 'Standard') {
    price_id = isYearly == '1' ? pro_yearly : pro_monthly
  } else if (title === 'Premium') {
    price_id = isYearly == '1' ? business_yearly : business_monthly
  } else {
    throw createError({ statusCode: 400, message: 'Invalid plan title' })
  }
  const stripe = useStripe()
  // TODO: Add user session check
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, message: 'User not authenticated' })
  }
  const baseUrl = getRequestProtocol(event) + '://' + getRequestHost(event)
  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price: price_id,
        quantity: 1
      }
    ],
    mode: 'subscription',
    billing_address_collection: 'auto',
    customer_email: session.user.email,
    metadata: {
      userId: session.user.id
    },
    success_url: `${baseUrl}/dashboard`,
    cancel_url: `${baseUrl}/pricing`
  })
  const redirectUrl = stripeSession.url as string
  return redirectUrl
})
