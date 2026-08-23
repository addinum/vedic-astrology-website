const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const KundaliRequest = require('../models/KundaliRequest');
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
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
    body('timeOfBirth').notEmpty().withMessage('Time of birth is required'),
    body('placeOfBirth').notEmpty().withMessage('Place of birth is required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const request = await KundaliRequest.create(req.body);

      sendMail({
        subject: `New Kundali Request - ${req.body.fullName}`,
        text: `Name: ${req.body.fullName}\nPhone: ${req.body.phone}\nDOB: ${req.body.dateOfBirth}\nTime: ${req.body.timeOfBirth}\nPlace: ${req.body.placeOfBirth}\nService: ${req.body.serviceRequested || '-'}`
      }).catch((e) => console.error('Mail send failed:', e.message));

      res.status(201).json({
        success: true,
        message: 'Your Kundali request has been received. We will contact you on WhatsApp/phone shortly.',
        data: request
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/admin/all', protect, async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const requests = await KundaliRequest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: requests.length, data: requests });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', protect, async (req, res, next) => {
  try {
    const request = await KundaliRequest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: request });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const request = await KundaliRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
