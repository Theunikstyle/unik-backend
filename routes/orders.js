const express = require('express');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
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

// Helper: send order confirmation email
async function sendOrderConfirmationEmail(userEmail, order) {
  // Configure your SMTP or use environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const productList = order.products.map(p => `- ${p.product} x${p.quantity} (₹${p.price})`).join('<br>');
  const mailOptions = {
    from: process.env.SMTP_FROM || 'no-reply@uniknaturals.com',
    to: userEmail,
    subject: `Order Confirmation - ${order._id}`,
    html: `<h2>Thank you for your order!</h2>
      <p><b>Order ID:</b> ${order._id}</p>
      <p><b>Total:</b> ₹${order.total}</p>
      <p><b>Shipping Address:</b><br>
        ${order.address.name},<br>
        ${order.address.address},<br>
        ${order.address.address2},<br>
        ${order.address.city}, ${order.address.state} - ${order.address.pincode}
      </p>
      <p><b>Products:</b><br>${productList}</p>
      <p>We will notify you when your order is shipped.</p>`
  };
  await transporter.sendMail(mailOptions);
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
    // Send order confirmation email
    try {
      const user = await User.findById(req.user.id);
      await sendOrderConfirmationEmail(user.email, order);
    } catch (emailErr) {
      console.error('Order confirmation email failed:', emailErr);
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
