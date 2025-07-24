// ContactMessage Controller
import ContactMessage from '../models/ContactMessage.js';

// Save a contact message
export const saveContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message, role: bodyRole } = req.body;

    // Prefer role from authenticated user, fallback to body, else 'N/A'
    let role = 'N/A';
    if (req.user && req.user.role) {
      role = req.user.role;
    } else if (bodyRole) {
      role = bodyRole;
    }

    const contact = new ContactMessage({ name, email, phone, message, role });
    await contact.save();

    res.status(201).json({ success: true, message: 'Message received!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to process message.' });
  }
};

// Get all contact messages (admin only)
export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    // Ensure role is always present in response
    const messagesWithRole = messages.map(msg => ({
      ...msg.toObject(),
      role: msg.role || 'N/A'
    }));

    res.json(messagesWithRole);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch contact messages', error: err.message });
  }
};

export default {
  saveContactMessage,
  getAllContactMessages,
};
