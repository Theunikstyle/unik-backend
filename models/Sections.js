const mongoose = require('mongoose');

const SectionProductRef = {
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  // You can add more fields if needed for section-specific product metadata
};

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  bannerImage: String,
  products: [SectionProductRef],
}, { timestamps: true });

module.exports = {
  TrendingSection: mongoose.model('TrendingSection', sectionSchema),
  ComboSection: mongoose.model('ComboSection', sectionSchema),
  ConcernSection: mongoose.model('ConcernSection', sectionSchema),
};
