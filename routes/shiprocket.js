const express = require('express');
const axios = require('axios');
const router = express.Router();

// Replace with your Shiprocket API token or fetch dynamically if needed
const SHIPROCKET_TOKEN = process.env.SHIPROCKET_TOKEN;

router.post('/', async (req, res) => {
  try {
    const orderData = req.body;
    // Ensure payment_method is set correctly for Shiprocket
    if (orderData.paymentMethod && orderData.paymentMethod.toUpperCase() === 'COD') {
      orderData.payment_method = 'COD';
    } else {
      orderData.payment_method = 'Prepaid';
    }
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
      orderData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SHIPROCKET_TOKEN}`
        }
      }
    );
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.response) {
      res.status(err.response.status).json(err.response.data);
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
