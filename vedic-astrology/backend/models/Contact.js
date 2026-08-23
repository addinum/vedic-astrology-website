const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    subject: { type: String },
    message: { type: String, required: true, maxlength: 2000 },
    status: { type: String, enum: ['new', 'read', 'replied'], default: 'new' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Contact', ContactSchema);
