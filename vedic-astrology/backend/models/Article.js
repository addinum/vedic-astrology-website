const mongoose = require('mongoose');
const slugify = require('slugify');

const ArticleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    content: { type: String, required: true }, // HTML/markdown content
    coverImage: { type: String },
    category: {
      type: String,
      enum: ['kundali', 'vastu', 'pujas', 'festivals', 'astrology-tips', 'sanatan-dharma'],
      default: 'sanatan-dharma'
    },
    tags: [{ type: String }],
    author: { type: String, default: 'Pandit Ji' },
    metaTitle: { type: String },
    metaDescription: { type: String, maxlength: 160 },
    readTimeMinutes: { type: Number, default: 5 },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

ArticleSchema.pre('validate', function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('Article', ArticleSchema);
