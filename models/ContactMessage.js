import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    // Optional: basic email validation
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  message: { type: String, required: true },
}, { timestamps: true });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);

export default ContactMessage;
