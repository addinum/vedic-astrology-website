const express = require('express');
const { body, validationResult } = require('express-validator');
const Article = require('../models/Article');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public - published articles, with pagination + category filter
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9;
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) filter.title = { $regex: req.query.search, $options: 'i' };

    const total = await Article.countDocuments(filter);
    const articles = await Article.find(filter)
      .select('-content')
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      success: true,
      count: articles.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: articles
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:slug', async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, isPublished: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  protect,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('excerpt').notEmpty().withMessage('Excerpt is required'),
    body('content').notEmpty().withMessage('Content is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }
      const article = await Article.create(req.body);
      res.status(201).json({ success: true, data: article });
    } catch (err) {
      next(err);
    }
  }
);

router.put('/:id', protect, async (req, res, next) => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
