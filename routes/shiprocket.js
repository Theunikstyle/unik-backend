const express = require('express');
const axios = require('axios');
const router = express.Router();

let shiprocketToken = process.env.SHIPROCKET_TOKEN;
const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;

// Helper: Login & get token
const getNewShiprocketToken = async () => {
  try {
    const res = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email,
      password
    });
    shiprocketToken = res.data.token; // Save new token in memory
    console.log('✅ New Shiprocket Token:', shiprocketToken);
    return shiprocketToken;
  } catch (err) {
    console.error('❌ Error getting new token:', err.response?.data || err.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

// Route: Create Shiprocket Order
router.post('/', async (req, res) => {
  let token = shiprocketToken;

  // Retry logic: Try request once, refresh token if 401, then try again
  for (let i = 0; i < 2; i++) {
    try {
      const orderPayload = {
        ...req.body,
        payment_method: req.body.paymentMethod === 'COD' ? 'COD' : 'Prepaid'
      };

      const response = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        orderPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return res.status(response.status).json(response.data);
    } catch (err) {
      // Token expired? Try refreshing once
      if (err.response?.status === 401 && i === 0) {
        console.log('🔁 Token expired. Refreshing...');
        try {
          token = await getNewShiprocketToken();
        } catch (refreshError) {
          return res.status(401).json({ error: 'Shiprocket token refresh failed' });
        }
      } else {
        console.error('❌ Shiprocket error:', err.response?.data || err.message);
        return res.status(err.response?.status || 500).json({
          error: err.response?.data || err.message
        });
      }
    }
  }
});
module.exports = router;
