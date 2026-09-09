const express = require('express');
const router = express.Router();
const axios = require('axios');
const db = require('../config/db.mysql').pool;

const PAYPAL_CLIENT = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const BASE_URL = 'https://api-m.sandbox.paypal.com'; // use live.paypal.com in prod

const getAccessToken = async () => {
  const res = await axios.post(`${BASE_URL}/v1/oauth2/token`, 'grant_type=client_credentials', {
    auth: { username: PAYPAL_CLIENT, password: PAYPAL_SECRET },
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  return res.data.access_token;
};

router.post('/capture-order/:orderId', async (req, res) => {
  const accessToken = await getAccessToken();
  const { orderId } = req.params;

  const response = await axios.post(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {}, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  // 👇 Confirm the errand
  const errand_id = req.body.errand_id;
  const payer = response.data.payer;

  await db.execute(
    'UPDATE errands SET is_paid = 1, status = "confirmed" WHERE id = ?',
    [errand_id]
  );

  // 👇 Save payment history
  await db.execute(
    `INSERT INTO payments (errand_id, order_id, payer_email, amount, currency, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      errand_id,
      orderId,
      payer.email_address,
      response.data.purchase_units[0].payments.captures[0].amount.value,
      response.data.purchase_units[0].payments.captures[0].amount.currency_code,
      'success'
    ]
  );

  res.json({ message: 'Payment captured & errand confirmed' });
});



// Handle withdrawals
router.post('/withdraw', async (req, res) => {
  const { amount, withdrawMethod = 'bank_transfer' } = req.body;
  const userId = req.user.id;

  try {
    // Check if user has sufficient balance
    const [userResult] = await db.execute(
      'SELECT balance FROM users WHERE id = ?',
      [userId]
    );

    if (userResult.length === 0) {
      return res.status(404).send({ success: false, message: 'User not found' });
    }

    const currentBalance = userResult[0].balance;
    if (currentBalance < amount) {
      return res.status(400).send({ success: false, message: 'Insufficient balance' });
    }

    // For now, we'll simulate the withdrawal process
    // In production, replace this with actual payout API call
    const withdrawalSuccessful = true; // Simulate successful withdrawal

    if (withdrawalSuccessful) {
      // Deduct amount from user balance
      await db.execute(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [amount, userId]
      );

      // Log the transaction
      await db.execute(
        `INSERT INTO transactions (user_id, transaction_type, amount, description, payment_method, status)
         VALUES (?, 'withdrawal', ?, ?, ?, 'completed')`,
        [userId, amount, `Withdrawal to ${withdrawMethod}`, withdrawMethod]
      );

      res.send({ success: true, message: 'Withdrawal successful' });
    } else {
      res.status(500).send({ success: false, message: 'Withdrawal failed' });
    }
  } catch (error) {
    res.status(500).send({ success: false, message: 'Withdrawal failed', error: error.message });
  }
});

module.exports = router;
