import stripe from '../config/stripe.js';
import sendEmail from '../utils/sendEmail.js';
import Order from '../models/Order.js';

// Create a Stripe Checkout session
export const createCheckoutSession = async (req, res) => {
  const { email, amount, serviceName, orderId } = req.body;

  if (!email || !amount || !serviceName || !orderId) {
    return res.status(400).json({ message: 'Missing required payment information.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: serviceName },
          unit_amount: Math.round(amount * 100), // amount in cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.FRONT_END_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONT_END_URL}/payment-cancel`,
      metadata: { orderId },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ message: 'Payment session creation failed.' });
  }
};



// Send a payment link via email
export const sendPaymentLink = async (req, res) => {
  const { orderId } = req.params;
  const { email, amount, serviceName } = req.body;

  try {
    // This would ideally create a payment link via Stripe's Payment Links API
    // For simplicity, we'll reuse the checkout session logic
    const checkoutUrl = await createCheckoutSession(req, res); // This is a simplification

    await sendEmail({
      to: email,
      subject: 'Your Payment Link for Fabrizo',
      text: `Please complete your payment for ${serviceName} by visiting: ${checkoutUrl}`,
    });

    res.status(200).json({ message: 'Payment link sent successfully.' });
  } catch (error) {
    console.error('Send Payment Link Error:', error);
    res.status(500).json({ message: 'Failed to send payment link.' });
  }
};
