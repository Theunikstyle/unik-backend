const express = require('express');
const axios = require('axios');
const router = express.Router();

let cachedToken = null; // memory cache

const email = process.env.SHIPROCKET_EMAIL;
const password = process.env.SHIPROCKET_PASSWORD;

console.log('💡 Shiprocket email:', email);

// FUNCTION: Get new token and cache it
const getNewShiprocketToken = async () => {
  try {
    const res = await axios.post('https://apiv2.shiprocket.in/v1/external/auth/login', {
      email,
      password
    });

    cachedToken = res.data.token;
    console.log('✅ Shiprocket token refreshed:', cachedToken);
    return cachedToken;
  } catch (err) {
    console.error('❌ Failed to refresh Shiprocket token:', err.response?.data || err.message);
    throw new Error('Failed to refresh token');
  }
};

// ROUTE: Place Order
router.post('/', async (req, res) => {
  let token = cachedToken || process.env.SHIPROCKET_TOKEN;
  let triedRefresh = false;

  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const orderData = {
        ...req.body,
        payment_method: req.body.paymentMethod?.toUpperCase() === 'COD' ? 'COD' : 'Prepaid'
      };

      const response = await axios.post(
        'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`✅ Shiprocket order created (Attempt ${attempt})`);
      return res.status(response.status).json(response.data);
    } catch (err) {
      if (err.response?.status === 401 && !triedRefresh) {
        console.warn('⚠️ Token expired. Refreshing...');
        try {
          token = await getNewShiprocketToken();
          triedRefresh = true;
          continue; // retry after refresh
        } catch (refreshErr) {
          return res.status(401).json({ error: 'Token refresh failed' });
        }
      }

      // Any other error
      return res.status(err.response?.status || 500).json({
        error: err.response?.data || err.message
      });
    }
  }
});
module.exports = router;
