const express = require('express');
const { protect } = require('../middleware/auth');
const Service = require('../models/Service');
const Article = require('../models/Article');
const Testimonial = require('../models/Testimonial');
const Review = require('../models/Review');
const GalleryImage = require('../models/GalleryImage');
const Panchang = require('../models/Panchang');
const Contact = require('../models/Contact');
const KundaliRequest = require('../models/KundaliRequest');

const router = express.Router();

router.get('/stats', protect, async (req, res, next) => {
  try {
    const [
      services,
      articles,
      testimonialsPending,
      reviewsPending,
      galleryImages,
      panchangFiles,
      newContacts,
      newKundaliRequests
    ] = await Promise.all([
      Service.countDocuments(),
      Article.countDocuments(),
      Testimonial.countDocuments({ isApproved: false }),
      Review.countDocuments({ isApproved: false }),
      GalleryImage.countDocuments(),
      Panchang.countDocuments(),
      Contact.countDocuments({ status: 'new' }),
      KundaliRequest.countDocuments({ status: 'new' })
    ]);

    res.json({
      success: true,
      data: {
        services,
        articles,
        testimonialsPending,
        reviewsPending,
        galleryImages,
        panchangFiles,
        newContacts,
        newKundaliRequests
      }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
