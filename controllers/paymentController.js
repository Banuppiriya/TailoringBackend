const stripe = require('../config/stripe');
const sendEmail = require('../utils/sendEmail');

exports.createCheckoutSession = async (req, res) => {
  const { email, amount, serviceName } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: serviceName,
            },
            unit_amount: amount * 100, // amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe Error:', err);
    res.status(500).json({ error: 'Payment session creation failed' });
  }
};
