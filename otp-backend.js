const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Replace with your Authentica API key
const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY || '$2y$10$mR0h/sfoKYmVhDSzsBmnuOw9oa9WabVYkysZaPd7YuTWvtJWz4jvS';
const AUTHENTICA_BASE_URL = 'https://api.authentica.com'; // Replace with actual base URL if different

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  const { recipient, channel } = req.body;
  try {
    const response = await axios.post(
      `${AUTHENTICA_BASE_URL}/send-otp`,
      {
        recipient,
        channel: channel || 'sms',
      },
      {
        headers: {
          'Authorization': `Bearer ${AUTHENTICA_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Verify OTP endpoint (Authentica v2)
app.post('/api/verify-otp', async (req, res) => {
  const { recipient, otp } = req.body;
  try {
    const response = await axios.post(
      `https://api.authentica.sa/api/v2/verify-otp`,
      {
        method: 'sms',
        phone: recipient,
        code: otp,
      },
      {
        headers: {
          'X-Authorization': AUTHENTICA_API_KEY,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`OTP backend server running on port ${PORT}`);
});
