const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: true }).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('message').notEmpty().isLength({ max: 1000 }).withMessage('Message is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }
      const review = await Review.create(req.body);
      res.status(201).json({
        success: true,
        message: 'Thank you for your review! It will appear after approval.',
        data: review
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
