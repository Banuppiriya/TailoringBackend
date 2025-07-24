import Stripe from 'stripe';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import * as dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Stripe Webhook Handler
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  // Verify signature
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  // Process event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      const { orderId, paymentType, totalAmount } = session.metadata;
      const paymentAmount = session.amount_total / 100;

      // Save payment to DB
      await Payment.create({
        user: session.client_reference_id,
        order: orderId,
        totalAmount: parseFloat(totalAmount),
        paidAmount: paymentAmount,
        remainingAmount: parseFloat(totalAmount) - paymentAmount,
        status: paymentType === 'initial' ? 'initial_paid' : 'completed',
        paymentType,
        paymentIntentId: session.payment_intent
      });

      // Update order status
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      if (paymentType === 'initial') {
        order.paymentStatus = 'initial_paid';
        order.paidAmount = paymentAmount;
        order.remainingAmount = order.totalAmount - paymentAmount;
      } else if (paymentType === 'final') {
        order.paymentStatus = 'completed';
        order.paidAmount = order.totalAmount;
        order.remainingAmount = 0;
      }

      await order.save();
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Error processing webhook:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};
