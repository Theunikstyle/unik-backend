const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to check auth
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Create order
router.post('/', auth, async (req, res) => {
  try {
    const { products, total, address, paymentId, phone, paymentMethod, shiprocketShipmentId, shiprocketShipmentID } = req.body;
    // Debug: log the incoming request body to verify field names and values
    console.log('Order payload:', req.body);
    const shipmentIdValue = shiprocketShipmentId || shiprocketShipmentID;
    const order = new Order({
      user: req.user.id,
      products,
      total,
      address,
      paymentId,
      paymentMethod, // Save payment method (Prepaid or COD)
      shiprocketShipmentId: shipmentIdValue ? String(shipmentIdValue) : undefined,
    });
    // Validate address structure
    if (!address || !address.pincode || !address.city || !address.state || !address.name || !address.address || !address.address2 || !address.addressType) {
      return res.status(400).json({ error: 'All address fields are required: pincode, city, state, name, address, address2, addressType.' });
    }
    if (!['home', 'work'].includes(address.addressType)) {
      return res.status(400).json({ error: 'addressType must be either "home" or "work".' });
    }
    await order.save();
    // If Shiprocket order creation was successful and you have a shipment_id, update the order
    if (req.body.shiprocketShipmentId) {
      order.shiprocketShipmentId = req.body.shiprocketShipmentId;
      await order.save();
    }
    // Update user's phone and address if provided
    const updateFields = {};
    if (phone) updateFields.phone = phone;
    if (address) updateFields.address = address;
    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(req.user.id, { $set: updateFields });
    }
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get user orders
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: get all orders
router.get('/', auth, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json({ error: 'Forbidden' });
  try {
    const orders = await Order.find().populate('user').populate('products.product');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
