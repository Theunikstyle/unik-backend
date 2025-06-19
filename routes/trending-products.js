const express = require('express');
const TrendingProducts = require('../models/TrendingProducts');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET trending products (populated)
router.get('/', async (req, res) => {
  try {
    let trending = await TrendingProducts.findOne().populate('products');
    if (!trending) trending = await TrendingProducts.create({ products: [] });
    res.json(trending.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add product to trending
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    let trending = await TrendingProducts.findOne();
    if (!trending) trending = await TrendingProducts.create({ products: [] });
    if (!trending.products.includes(productId)) {
      trending.products.push(productId);
      trending.updatedBy = req.user.id;
      trending.updatedAt = new Date();
      await trending.save();
    }
    trending = await trending.populate('products');
    res.json(trending.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove product from trending
router.delete('/:productId', auth, adminOnly, async (req, res) => {
  try {
    let trending = await TrendingProducts.findOne();
    if (!trending) return res.status(404).json({ error: 'Trending list not found' });
    trending.products = trending.products.filter(
      id => id.toString() !== req.params.productId
    );
    trending.updatedBy = req.user.id;
    trending.updatedAt = new Date();
    await trending.save();
    trending = await trending.populate('products');
    res.json(trending.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH reorder trending products
router.patch('/', auth, adminOnly, async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) return res.status(400).json({ error: 'productIds must be an array' });
    let trending = await TrendingProducts.findOne();
    if (!trending) return res.status(404).json({ error: 'Trending list not found' });
    trending.products = productIds;
    trending.updatedBy = req.user.id;
    trending.updatedAt = new Date();
    await trending.save();
    trending = await trending.populate('products');
    res.json(trending.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
