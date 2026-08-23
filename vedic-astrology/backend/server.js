require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ---- Database ----
connectDB();

// ---- Security & core middleware ----
app.use(
  helmet({
    contentSecurityPolicy: false, // allow inline scripts/fonts used by static frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ---- CORS ----
const allowedOrigins = [process.env.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:5500'].filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// ---- Global rate limiter ----
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

// ---- Static uploads ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- API routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/services', require('./routes/services'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/articles', require('./routes/articles'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/panchang', require('./routes/panchang'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/kundali', require('./routes/kundali'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

// ---- Serve frontend (single deployment option: backend serves static frontend) ----
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(frontendPath, req.path === '/' ? 'index.html' : req.path), (err) => {
    if (err) res.sendFile(path.join(frontendPath, 'index.html'));
  });
});

// ---- Error handler (must be last) ----
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
