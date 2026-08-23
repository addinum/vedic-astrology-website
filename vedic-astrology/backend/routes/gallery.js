const express = require('express');
const GalleryImage = require('../models/GalleryImage');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    const images = await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: images.length, data: images });
  } catch (err) {
    next(err);
  }
});

router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const images = await GalleryImage.find().sort({ createdAt: -1 });
    res.json({ success: true, count: images.length, data: images });
  } catch (err) {
    next(err);
  }
});

// Upload new gallery image (multipart/form-data, field name "image")
router.post('/', protect, uploadImage.single('image'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Image file is required' });

    const imageUrl = `/uploads/gallery/${req.file.filename}`;
    const image = await GalleryImage.create({
      title: req.body.title || 'Untitled',
      imageUrl,
      category: req.body.category || 'other',
      caption: req.body.caption,
      order: req.body.order || 0
    });
    res.status(201).json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const image = await GalleryImage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, data: image });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const image = await GalleryImage.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ success: false, message: 'Image not found' });
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
