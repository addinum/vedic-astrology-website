require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Service = require('../models/Service');

const services = [
  {
    title: 'Handwritten 15-Page Vedic Kundali',
    shortDescription: 'A complete, hand-crafted Janam Kundali covering all 15 pages of authentic Vedic analysis.',
    fullDescription:
      'Our signature offering — a meticulously handwritten 15-page Janam Kundali prepared using authentic Vedic principles, covering Rashi, Nakshatra, Dashas, Yogas, Doshas, and detailed life predictions across career, marriage, health and finance.',
    category: 'kundali',
    priceLabel: 'Contact for pricing',
    highlights: ['Handwritten by Pandit Ji', '15 detailed pages', 'Life predictions', 'Remedies included'],
    featured: true,
    order: 1
  },
  {
    title: 'Janam Kundali Analysis',
    shortDescription: 'In-depth reading and explanation of your existing birth chart with personalised guidance.',
    fullDescription:
      'A detailed one-on-one Kundali analysis session where Pandit Ji explains planetary positions, current Dasha, upcoming transits, and practical remedies tailored to your life questions.',
    category: 'kundali',
    priceLabel: 'Contact for pricing',
    highlights: ['One-on-one consultation', 'Dasha & transit analysis', 'Practical remedies'],
    featured: true,
    order: 2
  },
  {
    title: 'Graha Shanti Puja',
    shortDescription: 'Traditional rituals to pacify malefic planetary influences and restore balance.',
    fullDescription:
      'Graha Shanti Pujas performed with complete Vedic vidhi to reduce the adverse effects of malefic planets in your Kundali, restoring peace, health and prosperity.',
    category: 'graha-shanti',
    priceLabel: 'Contact for pricing',
    highlights: ['Authentic Vedic vidhi', 'Planet-specific rituals', 'Samagri guidance provided'],
    featured: true,
    order: 3
  },
  {
    title: 'Anushthan & Jaap',
    shortDescription: 'Sacred mantra Anushthans and Jaaps performed for specific life goals and spiritual growth.',
    fullDescription:
      'Customised Anushthans and Jaap rituals for health, prosperity, obstacles removal and spiritual elevation, conducted with strict adherence to Vedic discipline and timing (Muhurat).',
    category: 'anushthan-jaap',
    priceLabel: 'Contact for pricing',
    highlights: ['Muhurat-based timing', 'Goal-specific mantras', 'Complete ritual guidance'],
    order: 4
  },
  {
    title: 'Griha Pravesh Puja',
    shortDescription: 'Auspicious house-warming ceremony performed as per authentic Vedic rituals.',
    fullDescription:
      'A complete Griha Pravesh ceremony conducted at the most auspicious Muhurat, ensuring your new home is blessed with positivity, prosperity and protection.',
    category: 'griha-pravesh',
    priceLabel: 'Contact for pricing',
    highlights: ['Muhurat selection', 'Full ritual materials guidance', 'On-site puja'],
    order: 5
  },
  {
    title: 'Vastu Consultation',
    shortDescription: 'Expert Vastu Shastra guidance for homes, offices and commercial spaces.',
    fullDescription:
      'Detailed Vastu analysis of your property with practical, non-destructive remedies to correct energy imbalances and improve harmony, health and prosperity.',
    category: 'vastu',
    priceLabel: 'Contact for pricing',
    highlights: ['On-site or remote analysis', 'Practical remedies', 'Residential & commercial'],
    order: 6
  },
  {
    title: 'All Types of Vedic Pujas',
    shortDescription: 'Satyanarayan Katha, Navgraha Puja, Rudrabhishek and all traditional Sanatani ceremonies.',
    fullDescription:
      'From Satyanarayan Katha to Rudrabhishek, Navgraha Puja, and all major Sanatan Dharma ceremonies — performed with complete authenticity and devotion.',
    category: 'puja',
    priceLabel: 'Contact for pricing',
    highlights: ['All major Pujas', 'Authentic Vedic vidhi', 'Home or venue service'],
    order: 7
  }
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      await Admin.create({
        name: 'Pandit Ji Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD
      });
      console.log(`Admin created: ${process.env.ADMIN_EMAIL}`);
    } else {
      console.log('Admin already exists, skipping.');
    }

    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(services);
      console.log(`${services.length} services seeded.`);
    } else {
      console.log('Services already exist, skipping.');
    }

    console.log('Seeding complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

run();
