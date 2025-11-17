import Stripe from 'stripe'

export function useStripe() {
  return new Stripe(process.env.STRIPE_API_KEY || '', {
    apiVersion: '2025-10-29.clover',
    typescript: true
  })
}
