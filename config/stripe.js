// config/stripe.js
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

/**
 * Helper function to create a Stripe checkout session
 * @param {Object} params - Parameters for the checkout session
 * @returns {Promise<Stripe.Checkout.Session>} - Created checkout session
 */
export async function generateStripeCheckoutSession(params) {
  try {
    const session = await stripe.checkout.sessions.create(params);
    return session;
  } catch (error) {
    console.error('Stripe session generation failed:', error);
    throw error;
  }
}

export default stripe;
