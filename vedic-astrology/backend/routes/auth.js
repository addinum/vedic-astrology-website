const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const { protect } = require('../middleware/auth');

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' }
});

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required')
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, message: errors.array()[0].msg });
      }

      const { email, password } = req.body;
      const admin = await Admin.findOne({ email }).select('+password');

      if (!admin || !(await admin.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const token = signToken(admin._id);

      res.status(200).json({
        success: true,
        token,
        admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, admin: req.admin });
});

module.exports = router;
