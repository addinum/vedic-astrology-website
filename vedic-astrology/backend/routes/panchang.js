const express = require('express');
const Panchang = require('../models/Panchang');
const { protect } = require('../middleware/auth');
const { uploadPanchang } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const items = await Panchang.find({ isActive: true }).sort({ year: -1, createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const items = await Panchang.find().sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    next(err);
  }
});

router.post('/', protect, uploadPanchang.single('pdf'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'PDF file is required' });

    const fileUrl = `/uploads/panchang/${req.file.filename}`;
    const panchang = await Panchang.create({
      title: req.body.title,
      month: req.body.month,
      year: req.body.year,
      description: req.body.description,
      fileUrl,
      fileName: req.file.originalname
    });
    res.status(201).json({ success: true, data: panchang });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const item = await Panchang.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const item = await Panchang.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
