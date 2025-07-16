// import Order from '../models/Order.js';


// export const handleStripeWebhook = async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//   } catch (err) {
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;
//     const { orderId } = session.metadata;

//     try {
//       await Order.findByIdAndUpdate(orderId, {
//         paymentStatus: 'paid',
//         paymentIntentId: session.payment_intent,
//       });
//     } catch (err) {
//       console.error('Failed to update order payment status:', err);
//       // Optionally, handle this error, e.g., by sending an alert
//     }
//   }

//   res.status(200).json({ received: true });
// };

import express from 'express';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Use raw body parser only for the webhook route
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
    }
  }

  res.status(200).json({ received: true });
};

