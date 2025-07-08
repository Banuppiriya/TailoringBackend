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
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: { orderId },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ message: 'Payment session creation failed.' });
  }
};

// Handle Stripe webhooks
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { orderId } = session.metadata;

    try {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        paymentIntentId: session.payment_intent,
      });
    } catch (err) {
      console.error('Failed to update order payment status:', err);
      // Optionally, handle this error, e.g., by sending an alert
    }
  }

  res.status(200).json({ received: true });
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
