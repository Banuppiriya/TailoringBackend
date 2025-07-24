import Newsletter from '../models/Newsletter.js';

// Subscribe to newsletter
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({
        message: 'This email is already subscribed to our newsletter.',
      });
    }

    // Create and save new subscriber
    const subscriber = new Newsletter({ email });
    await subscriber.save();

    res.status(201).json({
      message: 'Thank you for subscribing to our newsletter!',
      subscriber,
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      message: 'Failed to subscribe to newsletter. Please try again.',
    });
  }
};

// Get paginated list of all subscribers (admin only)
export const getAllSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Newsletter.countDocuments();
    const subscribers = await Newsletter.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      subscribers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    res.status(500).json({
      message: 'Failed to fetch newsletter subscribers.',
    });
  }
};

// Unsubscribe a user by email (soft delete by status)
export const unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;
    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        message: 'Subscriber not found.',
      });
    }

    subscriber.status = 'unsubscribed';
    await subscriber.save();

    res.status(200).json({
      message: 'Successfully unsubscribed from newsletter.',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      message: 'Failed to unsubscribe from newsletter.',
    });
  }
};
