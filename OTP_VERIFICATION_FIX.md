# OTP Verification Fix Documentation

## Problem

- **Error:** OTP verification was always failing with a 404 error and a large HTML response from Authentica.
- **Cause:** The backend was sending the wrong payload to the Authentica API and using the wrong field names. The API expects `{ phone, otp }` in the JSON body, but the code was sending `{ recipient, otp }` and sometimes extra fields.
- **Also:** The API endpoint and headers were correct, but the payload shape was not.

## Solution

### 1. Backend Fix
- **File:** `otp-backend.cjs`
- **Lines Changed:** The `/api/verify-otp` endpoint handler.
- **Old code:**
  ```js
  // ...existing code...
  app.post('/api/verify-otp', async (req, res) => {
    const { recipient, otp } = req.body;
    // ...
    const response = await axios.post(
      'https://api.authentica.sa/api/v2/verify-otp',
      {
        method: 'sms',
        phone: recipient,
        code: otp,
      },
      // ...headers...
    );
    // ...existing code...
  });
  // ...existing code...
  ```
- **New code:**
  ```js
  // ...existing code...
  app.post('/api/verify-otp', async (req, res) => {
    const { recipient, otp } = req.body;
    try {
      // Use correct Authentica API payload: { phone, otp }
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
      res.json(response.data);
    } catch (error) {
      // ...error handling...
    }
  });
  // ...existing code...
  ```
- **Summary:**
  - The payload now matches the Authentica API docs exactly: `{ phone: recipient, otp }`.
  - This fixed the 404 error and allows OTP verification to work.

### 2. Frontend Fix (for reference)
- **File:** `src/components/ui/OTPVerificationPage.tsx`
- **Change:** The frontend now sends the phone number as `recipient` and the OTP as `otp` to the backend, which then maps it to the correct Authentica fields.

## How to Deploy

1. Make sure your `.env` file has the correct `AUTHENTICA_API_KEY`.
2. Restart the backend server after making changes.
3. Test the OTP flow in the UI.

## Git Commands

```
git add .
git commit -m "Fix Authentica OTP verify: use correct payload { phone, otp } and document changes"
git push
```

---

If you need to see the exact code diff, check the `/api/verify-otp` handler in `otp-backend.cjs`.
