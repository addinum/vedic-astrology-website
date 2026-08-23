const express = require('express');
const { body, validationResult } = require('express-validator');
const Service = require('../models/Service');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route  GET /api/services
// @desc   Public - get all active services (optionally filter by category)
router.get('/', async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const services = await Service.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
});

// @route  GET /api/services/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const service = await Service.findOne({ slug: req.params.slug, isActive: true });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
});

// @route  GET /api/services/admin/all
// @desc   Admin - get all services including inactive
router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: services.length, data: services });
  } catch (err) {
    next(err);
  }
});

// @route  POST /api/services
// @desc   Admin - create service
router.post(
  '/',
  protect,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('shortDescription').notEmpty().withMessage('Short description is required'),
    body('fullDescription').notEmpty().withMessage('Full description is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }
      const service = await Service.create(req.body);
      res.status(201).json({ success: true, data: service });
    } catch (err) {
      next(err);
    }
  }
);

// @route  PUT /api/services/:id
router.put('/:id', protect, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, data: service });
  } catch (err) {
    next(err);
  }
});

// @route  DELETE /api/services/:id
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Service not found' });
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
