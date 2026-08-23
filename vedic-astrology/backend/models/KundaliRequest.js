const mongoose = require('mongoose');

const KundaliRequestSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: { type: String, required: true },
    timeOfBirth: { type: String, required: true },
    placeOfBirth: { type: String, required: true },
    serviceRequested: { type: String, default: 'Janam Kundali (15-page handwritten)' },
    message: { type: String },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in-progress', 'completed', 'cancelled'],
      default: 'new'
    },
    source: { type: String, enum: ['website-form', 'whatsapp'], default: 'website-form' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('KundaliRequest', KundaliRequestSchema);
