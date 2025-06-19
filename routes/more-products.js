const express = require('express');
const MoreProducts = require('../models/MoreProducts');
const Product = require('../models/Product');
const { auth, adminOnly } = require('../middleware/auth');
const router = express.Router();

// GET more products (populated)
router.get('/', async (req, res) => {
  try {
    let more = await MoreProducts.findOne().populate('products');
    if (!more) more = await MoreProducts.create({ products: [] });
    res.json(more.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST add product to more products
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    let more = await MoreProducts.findOne();
    if (!more) more = await MoreProducts.create({ products: [] });
    if (!more.products.includes(productId)) {
      more.products.push(productId);
      more.updatedBy = req.user.id;
      more.updatedAt = new Date();
      await more.save();
    }
    more = await more.populate('products');
    res.json(more.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE remove product from more products
router.delete('/:productId', auth, adminOnly, async (req, res) => {
  try {
    let more = await MoreProducts.findOne();
    if (!more) return res.status(404).json({ error: 'More products list not found' });
    more.products = more.products.filter(
      id => id.toString() !== req.params.productId
    );
    more.updatedBy = req.user.id;
    more.updatedAt = new Date();
    await more.save();
    more = await more.populate('products');
    res.json(more.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH reorder more products
router.patch('/', auth, adminOnly, async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) return res.status(400).json({ error: 'productIds must be an array' });
    let more = await MoreProducts.findOne();
    if (!more) return res.status(404).json({ error: 'More products list not found' });
    more.products = productIds;
    more.updatedBy = req.user.id;
    more.updatedAt = new Date();
    await more.save();
    more = await more.populate('products');
    res.json(more.products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
