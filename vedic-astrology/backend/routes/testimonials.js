const express = require('express');
const { body, validationResult } = require('express-validator');
const Testimonial = require('../models/Testimonial');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public - approved testimonials only
router.get('/', async (req, res, next) => {
  try {
    const filter = { isApproved: true };
    if (req.query.featured === 'true') filter.isFeatured = true;
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (err) {
    next(err);
  }
});

// Public - submit a new testimonial (goes to pending approval)
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('message').notEmpty().isLength({ max: 1000 }).withMessage('Message is required (max 1000 chars)'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }
      const { name, location, message, rating, service } = req.body;
      const testimonial = await Testimonial.create({
        name,
        location,
        message,
        rating,
        service,
        isApproved: false,
        source: 'website'
      });
      res.status(201).json({
        success: true,
        message: 'Thank you! Your testimonial has been submitted for review.',
        data: testimonial
      });
    } catch (err) {
      next(err);
    }
  }
);

// Admin - all testimonials
router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, count: testimonials.length, data: testimonials });
  } catch (err) {
    next(err);
  }
});

router.post('/admin', protect, async (req, res, next) => {
  try {
    const testimonial = await Testimonial.create({ ...req.body, isApproved: true, source: 'admin' });
    res.status(201).json({ success: true, data: testimonial });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!testimonial) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: testimonial });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    if (!testimonial) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
