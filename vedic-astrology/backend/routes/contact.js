const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Contact = require('../models/Contact');
const { protect } = require('../middleware/auth');
const { sendMail } = require('../utils/mailer');

const router = express.Router();

const formLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 8,
  message: { success: false, message: 'Too many submissions. Please try again later.' }
});

router.post(
  '/',
  formLimiter,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('message').notEmpty().isLength({ max: 2000 }).withMessage('Message is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const contact = await Contact.create(req.body);

      sendMail({
        subject: `New Contact Form Submission - ${req.body.name}`,
        text: `Name: ${req.body.name}\nPhone: ${req.body.phone}\nEmail: ${req.body.email || '-'}\nSubject: ${req.body.subject || '-'}\nMessage: ${req.body.message}`
      }).catch((e) => console.error('Mail send failed:', e.message));

      res.status(201).json({
        success: true,
        message: 'Thank you for reaching out! We will contact you shortly.',
        data: contact
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, data: contacts });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!contact) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
