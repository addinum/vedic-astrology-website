const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    rating: { type: Number, min: 1, max: 5, required: true },
    message: { type: String, required: true, maxlength: 1000 },
    isApproved: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', ReviewSchema);
