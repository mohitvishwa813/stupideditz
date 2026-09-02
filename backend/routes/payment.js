import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import { db } from '../db.js';

const router = express.Router();

// Initialize Razorpay conditionally so the server doesn't crash if keys are missing initially
const getRazorpayInstance = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys not configured in .env');
  }
  
  return new Razorpay({
    key_id,
    key_secret
  });
};

// ----------------------------------------------------------------------
// 1. CREATE PAYMENT ORDER
// ----------------------------------------------------------------------
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR', itemType, itemId, userId } = req.body;

    if (!amount || !userId) {
      return res.status(400).json({ success: false, message: 'Amount and User ID are required.' });
    }

    const instance = getRazorpayInstance();

    const options = {
      amount: amount * 100, // Razorpay amount is in paise
      currency,
      receipt: `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    const order = await instance.orders.create(options);

    // Save order intent in DB
    const orderRecordId = `ord-${Date.now()}`;
    await db.execute({
      sql: `INSERT INTO payment_orders (id, user_id, razorpay_order_id, amount, currency, item_type, item_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [orderRecordId, userId, order.id, amount, currency, itemType || 'course', itemId || '']
    });

    return res.json({
      success: true,
      orderId: order.id,
      amount: options.amount,
      currency: options.currency
    });
  } catch (err) {
    console.error('Create Order Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create payment order.' });
  }
});

// ----------------------------------------------------------------------
// 2. VERIFY PAYMENT SIGNATURE
// ----------------------------------------------------------------------
router.post('/verify-signature', async (req, res) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId 
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return res.status(400).json({ success: false, message: 'Missing payment parameters.' });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_secret) {
      return res.status(500).json({ success: false, message: 'Server configuration error.' });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // 1. Update Payment Order Status
      await db.execute({
        sql: `UPDATE payment_orders SET status = 'paid' WHERE razorpay_order_id = ?`,
        args: [razorpay_order_id]
      });

      // 2. Insert Payment Log
      const logId = `log-${Date.now()}`;
      await db.execute({
        sql: `INSERT INTO payment_logs (id, order_id, razorpay_payment_id, razorpay_signature, status, event_type)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [logId, razorpay_order_id, razorpay_payment_id, razorpay_signature, 'success', 'verification_success']
      });

      // 3. Optional: Add a column for enrolled courses in users table, 
      // or for now just log it securely. The frontend will also update local state.
      // E.g., `UPDATE users SET is_enrolled = 1 WHERE id = ?` if we had that column.

      console.log(`✅ [Backend Payment] Payment verified successfully for user ${userId}. Order: ${razorpay_order_id}`);
      return res.json({ success: true, message: 'Payment verified successfully.' });
    } else {
      console.warn(`⚠️ [Backend Payment] Invalid signature detected for order ${razorpay_order_id}`);
      return res.status(400).json({ success: false, message: 'Invalid signature.' });
    }
  } catch (err) {
    console.error('Verify Signature Error:', err);
    return res.status(500).json({ success: false, message: 'Failed to verify payment.' });
  }
});

// ----------------------------------------------------------------------
// 3. WEBHOOK ENDPOINT
// ----------------------------------------------------------------------
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(500).send('Webhook secret not configured');
    }

    const signature = req.headers['x-razorpay-signature'];
    if (!signature) {
      return res.status(400).send('Missing signature');
    }

    // req.body must be raw string for webhook verification, but express.json() might have parsed it if mounted globally
    // We should ensure it's a string. Since express.json() is likely used in server.js, we might need a workaround.
    const payload = JSON.stringify(req.body); 

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    if (expectedSignature === signature) {
      console.log('✅ [Razorpay Webhook] Event received:', req.body.event);
      
      const logId = `wh-${Date.now()}`;
      const paymentEntity = req.body.payload?.payment?.entity || {};
      
      await db.execute({
        sql: `INSERT INTO payment_logs (id, razorpay_payment_id, status, amount, method, event_type)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          logId, 
          paymentEntity.id || '', 
          paymentEntity.status || req.body.event, 
          paymentEntity.amount || 0,
          paymentEntity.method || '',
          req.body.event
        ]
      });

      return res.status(200).send('OK');
    } else {
      console.warn('⚠️ [Razorpay Webhook] Invalid signature');
      return res.status(400).send('Invalid signature');
    }
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(500).send('Server error');
  }
});

export default router;
