import axios from 'axios';

const AUTHENTICA_API_KEY = process.env.AUTHENTICA_API_KEY || '$2y$10$mR0h/sfoKYmVhDSzsBmnuOw9oa9WabVYkysZaPd7YuTWvtJWz4jvS';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    if (req.url.endsWith('/send-otp')) {
      // Send OTP
      const { recipient } = req.body;
      try {
        const response = await axios.post(
          'https://api.authentica.sa/api/v2/send-otp',
          {
            method: 'sms',
            phone: recipient,
          },
          {
            headers: {
              'X-Authorization': AUTHENTICA_API_KEY,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        res.status(200).json(response.data);
      } catch (error) {
        console.error('SEND OTP ERROR:', {
          message: error.message,
          responseData: error.response?.data,
          errors: error.response?.data?.errors,
          status: error.response?.status,
          requestBody: req.body,
        });
        res.status(error.response?.status || 500).json({
          error: error.response?.data || error.message,
        });
      }
    } else if (req.url.endsWith('/verify-otp')) {
      // Verify OTP
      const { recipient, otp } = req.body;
      try {
        const response = await axios.post(
          'https://api.authentica.sa/api/v2/verify-otp',
          {
            phone: recipient,
            otp: otp,
          },
          {
            headers: {
              'X-Authorization': AUTHENTICA_API_KEY,
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          }
        );
        res.status(200).json(response.data);
      } catch (error) {
        console.error('VERIFY OTP ERROR:', {
          message: error.message,
          responseData: error.response?.data,
          status: error.response?.status,
          requestBody: req.body,
        });
        res.status(error.response?.status || 500).json({
          error: error.response?.data || error.message,
        });
      }
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
