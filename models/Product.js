const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  longDescription: String,
  price: { type: Number, required: true },
  salePrice: Number,
  image: String,
  slug: { type: String, required: true, unique: true },
  reviewCount: { type: Number, default: 0 },
  soldOut: { type: Boolean, default: false },
  images: [String],
  features: [String],
  category: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
