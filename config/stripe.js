// config/stripe.js

import Stripe from 'stripe';

// Ensure Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

// Initialize Stripe with latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

/**
 * Creates a Stripe Checkout session.
 * @param {Stripe.Checkout.SessionCreateParams} params - Parameters for the checkout session
 * @returns {Promise<Stripe.Checkout.Session>} - The created checkout session
 */
export async function generateStripeCheckoutSession(params) {
  try {
    const session = await stripe.checkout.sessions.create(params);
    return session;
  } catch (error) {
    console.error('❌ Stripe Checkout Session creation failed:', error);
    throw new Error('Failed to create Stripe Checkout session');
  }
}

export default stripe;
