const express = require('express');
const axios = require('axios');
const router = express.Router();

const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;

let currentToken = process.env.SHIPROCKET_TOKEN || null; // Use initial token if available

// Helper: Get new token from Shiprocket API
async function getNewShiprocketToken() {
  try {
    console.log('🔄 Fetching new Shiprocket token...');
    const response = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email: SHIPROCKET_EMAIL,
      password: SHIPROCKET_PASSWORD
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    const token = response.data.token;
    console.log('✅ New Shiprocket token received.');
    currentToken = token; // Save token for future use
    return token;
  } catch (err) {
    console.error('❌ Error fetching Shiprocket token:', err.response?.data || err.message);
    throw new Error('Failed to get Shiprocket token');
  }
}

// Shiprocket Order Creation Route
router.post('/', async (req, res) => {
  let token = currentToken;
  let triedRefresh = false;
  let lastError;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const orderData = { ...req.body };

      // Ensure payment method format is correct
      orderData.payment_method = (orderData.paymentMethod && orderData.paymentMethod.toUpperCase() === 'COD')
        ? 'COD'
        : 'Prepaid';

      // Send request to Shiprocket
      const response = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        orderData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(`✅ Order created (Attempt ${attempt + 1})`);
      return res.status(response.status).json(response.data);

    } catch (err) {
      lastError = err;

      if (err.response?.status === 401 && !triedRefresh) {
        console.warn('⚠️ Token expired. Refreshing...');
        try {
          token = await getNewShiprocketToken();
          triedRefresh = true;
          continue; // Retry with new token
        } catch (refreshErr) {
          return res.status(401).json({ error: 'Token refresh failed' });
        }
      }

      // Other errors
      console.error('❌ Shiprocket order creation failed:', err.response?.data || err.message);
      return res.status(err.response?.status || 500).json({
        error: err.response?.data || err.message || 'Unknown error'
      });
    }
  }

  // All attempts failed
  return res.status(500).json({ error: lastError?.message || 'Shiprocket order failed' });
});

module.exports = router;
