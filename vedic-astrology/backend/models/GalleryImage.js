const mongoose = require('mongoose');

const GalleryImageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    category: {
      type: String,
      enum: ['puja', 'griha-pravesh', 'kundali-sample', 'events', 'ashram', 'other'],
      default: 'other'
    },
    caption: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryImage', GalleryImageSchema);
