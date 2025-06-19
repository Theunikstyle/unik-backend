const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get logged-in user's profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price image slug');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      email: user.email,
      phone: user.phone,
      address: user.address,
      wishlist: user.wishlist,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add product to wishlist
router.post('/wishlist', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'Product ID required' });
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', 'name price image slug');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove product from wishlist
router.delete('/wishlist/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { wishlist: productId } },
      { new: true }
    ).populate('wishlist', 'name price image slug');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's wishlist
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price image slug');
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
