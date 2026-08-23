const mongoose = require('mongoose');

const PanchangSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // e.g. "August 2026 Panchang"
    month: { type: String, required: true }, // e.g. "August"
    year: { type: Number, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Panchang', PanchangSchema);
