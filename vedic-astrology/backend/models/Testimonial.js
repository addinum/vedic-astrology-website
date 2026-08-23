const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String },
    photo: { type: String },
    message: { type: String, required: true, maxlength: 1000 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    service: { type: String },
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    source: { type: String, enum: ['website', 'google', 'whatsapp', 'admin'], default: 'website' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Testimonial', TestimonialSchema);
