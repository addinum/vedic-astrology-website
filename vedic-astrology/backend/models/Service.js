const mongoose = require('mongoose');
const slugify = require('slugify');

const ServiceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    shortDescription: { type: String, required: true, maxlength: 220 },
    fullDescription: { type: String, required: true },
    icon: { type: String, default: 'om' }, // icon key used by frontend
    image: { type: String },
    priceLabel: { type: String, default: 'Contact for pricing' },
    duration: { type: String },
    category: {
      type: String,
      enum: [
        'kundali',
        'graha-shanti',
        'anushthan-jaap',
        'griha-pravesh',
        'vastu',
        'puja',
        'other'
      ],
      default: 'other'
    },
    highlights: [{ type: String }],
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ServiceSchema.pre('validate', function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Service', ServiceSchema);
