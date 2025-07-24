// controllers/paymentController.js
import Payment from '../models/Payment.js';
import Order from '../models/Order.js';
import stripe from '../config/stripe.js';

// Create 50% initial payment session
async function createInitialPayment(req, res) {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ message: 'orderId is required' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        message: 'Initial payment has already been made',
        currentStatus: order.paymentStatus
      });
    }

    const initialAmount = order.totalAmount * 0.5;
    // Convert to cents (smallest currency unit)
    const amountInCents = Math.round(initialAmount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'lkr',
          product_data: {
            name: `Initial Payment for Order #${order._id}`,
            description: '50% initial payment for tailoring service'
          },
          unit_amount: amountInCents
        },
        quantity: 1
      }],
      metadata: {
        orderId: order._id.toString(),
        paymentType: 'initial',
        totalAmount: order.totalAmount
      },
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&orderId=${order._id}`,
      cancel_url: `${process.env.CLIENT_URL}/orders/${order._id}`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Initial payment error:', error);
    console.error('Error details:', {
      orderId: req.body.orderId,
      errorName: error.name,
      errorMessage: error.message,
      stripeError: error.type === 'StripeError' ? error : null
    });
    
    if (error.type === 'StripeError') {
      return res.status(400).json({ 
        message: 'Payment processing error',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      message: 'Error creating payment session',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Create final 50% payment session
async function createFinalPayment(req, res) {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'initial_paid') {
      return res.status(400).json({ message: 'Initial payment not completed.' });
    }

    if (order.status !== 'completed') {
      return res.status(400).json({ message: 'Order is not yet completed.' });
    }

    const finalAmount = order.remainingAmount;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Final Payment for Order #${order._id}`,
            description: 'Remaining 50% payment for completed tailoring service'
          },
          unit_amount: Math.round(finalAmount * 100)
        },
        quantity: 1
      }],
      metadata: {
        orderId: order._id.toString(),
        paymentType: 'final',
        totalAmount: order.totalAmount
      },
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/orders`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Final payment error:', error);
    res.status(500).json({ message: 'Error creating payment session' });
  }
}

// Verify completed payment session
async function verifyPayment(req, res) {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Payment session not found' });
    }

    // Get the order ID from the session's metadata
    const orderId = session.metadata.orderId;
    const paymentType = session.metadata.paymentType;
    
    // Update the order payment status
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status based on payment type
    if (paymentType === 'initial') {
      order.paymentStatus = 'initial_paid';
    } else if (paymentType === 'final') {
      order.paymentStatus = 'completed';
    }
    
    await order.save();

    // Create payment record
    const payment = await Payment.create({
      orderId: orderId,
      amount: session.amount_total / 100, // Convert from cents to actual currency
      status: 'completed',
      paymentType: paymentType,
      stripeSessionId: sessionId
    });

    return res.json({
      orderId: order._id,
      amount: payment.amount,
      status: order.paymentStatus
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
}

// Get payment history for an order
async function getOrderPayments(req, res) {
  try {
    const { orderId } = req.params;
    const payments = await Payment.find({ order: orderId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payment history' });
  }
}

// Check order and payment status
async function checkOrderStatus(req, res) {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      orderId: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      paidAmount: order.paidAmount,
      remainingAmount: order.remainingAmount
    });
  } catch (error) {
    console.error('Order status check error:', error);
    res.status(500).json({ message: 'Error checking order status' });
  }
}

export {
  createInitialPayment,
  createFinalPayment,
  verifyPayment,
  getOrderPayments,
  checkOrderStatus
};
