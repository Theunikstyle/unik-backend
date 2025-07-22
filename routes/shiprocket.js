const express = require('express');
const axios = require('axios');
const router = express.Router();

// Replace with your Shiprocket API token or fetch dynamically if needed
const SHIPROCKET_TOKEN = process.env.SHIPROCKET_TOKEN;
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

// Helper to get a new Shiprocket token
async function getNewShiprocketToken() {
  try {
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return response.data.token;
  } catch (err) {
    throw new Error('Failed to refresh Shiprocket token');
  }
}

router.post('/', async (req, res) => {
  let token = process.env.SHIPROCKET_TOKEN;
  let triedRefresh = false;
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
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
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return res.status(response.status).json(response.data);
    } catch (err) {
      lastError = err;
      if (err.response && err.response.status === 401 && !triedRefresh) {
        // Try to refresh token and retry once
        try {
          token = await getNewShiprocketToken();
          triedRefresh = true;
          continue;
        } catch (refreshErr) {
          return res.status(401).json({ error: 'Failed to refresh Shiprocket token' });
        }
      } else {
        if (err.response) {
          return res.status(err.response.status).json(err.response.data);
        } else {
          return res.status(500).json({ error: err.message });
        }
      }
    }
  }
  // If we get here, both attempts failed
  return res.status(500).json({ error: lastError?.message || 'Unknown error' });
});

module.exports = router;
