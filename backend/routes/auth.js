import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { db } from '../db.js';

const router = express.Router();

// In-Memory OTP Store: { [email: string]: { otp: string, expiresAt: number, name?: string } }
const otpStore = {};

// Helper to send email via EmailJS REST API (with console fallback for dev)
async function sendOtpEmail(email, name, otpCode, subjectType = 'registration') {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (serviceId && templateId && publicKey) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          accessToken: privateKey || undefined,
          template_params: {
            to_name: name || 'Creator',
            from_name: 'Stupid Editz Studio',
            user_name: name || 'Creator',
            name: name || 'Creator',
            to_email: email,
            user_email: email,
            email: email,
            reply_to: email,
            otp_code: otpCode,
            code: otpCode,
            otp: otpCode,
            message: `Your 6-digit verification OTP is: ${otpCode}`,
            app_name: 'Stupid Editz Studio',
            subject: subjectType === 'reset' ? 'Password Reset OTP' : 'Email Verification OTP'
          }
        })
      });

      if (response.ok) {
        console.log(`✉️ [EmailJS API] OTP verification email dispatched to ${email}!`);
        return true;
      } else {
        const errorText = await response.text();
        console.warn(`⚠️ [EmailJS API Error] Status ${response.status}: ${errorText}`);
        return false;
      }
    } catch (err) {
      console.error('⚠️ [EmailJS Dispatch Failed]:', err);
      return false;
    }
  }

  // Fallback dev console output if no EmailJS credentials configured
  console.log(`\n======================================================`);
  console.log(`🔑 [DEVELOPMENT OTP CODE] Email: ${email} | OTP: ${otpCode}`);
  console.log(`======================================================\n`);
  return true;
}

// ----------------------------------------------------------------------
// 1. SEND REGISTRATION OTP
// ----------------------------------------------------------------------
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already registered in Turso DB
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE LOWER(email) = ?`,
      args: [cleanEmail]
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please sign in instead.' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes TTL

    otpStore[cleanEmail] = { otp: otpCode, expiresAt, name: name.trim() };

    const emailSent = await sendOtpEmail(cleanEmail, name.trim(), otpCode, 'registration');

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to deliver OTP email. Please verify your EmailJS configuration.' 
      });
    }

    return res.json({ 
      success: true, 
      message: `OTP verification code sent to ${cleanEmail}`
    });
  } catch (err) {
    console.error('Send OTP error:', err);
    return res.status(500).json({ success: false, message: 'Server error generating OTP.' });
  }
});

// ----------------------------------------------------------------------
// 2. VERIFY OTP & COMPLETE REGISTRATION
// ----------------------------------------------------------------------
router.post('/verify-otp-register', async (req, res) => {
  try {
    const { fullName, phone, email, password, otp } = req.body;
    if (!fullName || !email || !password || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cached = otpStore[cleanEmail];

    if (!cached) {
      return res.status(400).json({ success: false, message: 'OTP expired or not requested. Please click Send OTP again.' });
    }

    if (Date.now() > cached.expiresAt) {
      delete otpStore[cleanEmail];
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new code.' });
    }

    if (cached.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect OTP verification code.' });
    }

    // OTP Verified! Clear cached OTP
    delete otpStore[cleanEmail];

    // Hash password with bcryptjs
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password.trim(), salt);
    const userId = 'usr-' + Date.now();
    const avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

    // Strict Check: Check if email already registered in Turso DB before inserting
    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE LOWER(email) = ?`,
      args: [cleanEmail]
    });

    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'This email is already registered. Please sign in instead.' });
    }

    // Insert user into Turso Cloud Database
    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, full_name, phone, avatar_url, role, status)
            VALUES (?, ?, ?, ?, ?, ?, 'student', 'active')`,
      args: [userId, cleanEmail, passwordHash, fullName.trim(), phone ? phone.trim() : '', avatarUrl]
    });

    const jwtSecret = process.env.JWT_SECRET || 'stupideditz_secret_key_2026';
    const token = jwt.sign({ id: userId, email: cleanEmail, role: 'student' }, jwtSecret, { expiresIn: '7d' });

    const userProfile = {
      id: userId,
      name: fullName.trim(),
      email: cleanEmail,
      role: 'student',
      avatar: String(avatarUrl),
      isEnrolled: false,
      enrolledBatch: '',
      enrolledCourses: [],
      purchasedAssets: [],
      orderHistory: []
    };

    console.log(`✅ [Backend Auth] Student registered successfully: ${fullName} (${cleanEmail})`);

    return res.json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: userProfile
    });
  } catch (err) {
    console.error('Verify & Register error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create user account.' });
  }
});

// ----------------------------------------------------------------------
// 3. USER SIGN IN / LOGIN
// ----------------------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    // Query Turso Cloud DB for user account
    const result = await db.execute({
      sql: `SELECT id, email, password_hash, full_name, phone, role, avatar_url FROM users WHERE LOWER(email) = ?`,
      args: [cleanEmail]
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password. Please check your credentials.' });
    }

    const row = result.rows[0];
    const passwordMatch = await bcrypt.compare(cleanPass, String(row.password_hash));

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'stupideditz_secret_key_2026';
    const token = jwt.sign({ id: String(row.id), email: String(row.email), role: String(row.role) }, jwtSecret, { expiresIn: '7d' });

    // Fetch order history for the user
    const ordersRes = await db.execute({
      sql: `SELECT id, amount, currency, item_type, item_id, status, created_at FROM payment_orders WHERE user_id = ? ORDER BY created_at DESC`,
      args: [String(row.id)]
    });

    const orderHistory = ordersRes.rows.map(o => ({
      id: String(o.id),
      amount: Number(o.amount),
      currency: String(o.currency),
      itemType: String(o.item_type),
      itemId: String(o.item_id),
      status: String(o.status),
      createdAt: String(o.created_at)
    }));

    const purchasedAssets = orderHistory
      .filter(o => o.status === 'paid' && (o.itemType === 'asset' || o.itemType === 'bundle'))
      .map(o => o.itemId);

    const userProfile = {
      id: String(row.id),
      name: String(row.full_name),
      email: String(row.email),
      role: String(row.role) === 'admin' ? 'admin' : 'student',
      avatar: String(row.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'),
      isEnrolled: false,
      enrolledBatch: '',
      enrolledCourses: [],
      purchasedAssets,
      orderHistory
    };

    return res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: userProfile
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Authentication server error.' });
  }
});

// ----------------------------------------------------------------------
// 4. SEND FORGOT PASSWORD RESET OTP
// ----------------------------------------------------------------------
router.post('/send-forgot-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Registered email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify email exists in Turso DB
    const result = await db.execute({
      sql: `SELECT id, full_name FROM users WHERE LOWER(email) = ?`,
      args: [cleanEmail]
    });

    if (result.rows.length === 0 && cleanEmail !== 'admin@gmail.com' && cleanEmail !== 'student@gmail.com') {
      return res.status(404).json({ success: false, message: 'No account found registered with this email address.' });
    }

    const userName = result.rows.length > 0 ? String(result.rows[0].full_name) : 'User';
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore[`reset_${cleanEmail}`] = { otp: otpCode, expiresAt };

    const emailSent = await sendOtpEmail(cleanEmail, userName, otpCode, 'reset');

    if (!emailSent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to deliver reset OTP email. Please check your EmailJS configuration.' 
      });
    }

    return res.json({
      success: true,
      message: `Password reset OTP sent to ${cleanEmail}`
    });
  } catch (err) {
    console.error('Send Reset OTP error:', err);
    return res.status(500).json({ success: false, message: 'Failed to send reset OTP.' });
  }
});

// ----------------------------------------------------------------------
// 5. VERIFY OTP & RESET PASSWORD
// ----------------------------------------------------------------------
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cached = otpStore[`reset_${cleanEmail}`];

    if (!cached) {
      return res.status(400).json({ success: false, message: 'Reset OTP expired or not requested.' });
    }

    if (Date.now() > cached.expiresAt) {
      delete otpStore[`reset_${cleanEmail}`];
      return res.status(400).json({ success: false, message: 'Reset OTP has expired. Please request a new code.' });
    }

    if (cached.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Incorrect Reset OTP verification code.' });
    }

    delete otpStore[`reset_${cleanEmail}`];

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword.trim(), salt);

    // Update password in Turso DB
    await db.execute({
      sql: `UPDATE users SET password_hash = ? WHERE LOWER(email) = ?`,
      args: [passwordHash, cleanEmail]
    });

    console.log(`🔐 [Backend Auth] Password reset successfully for ${cleanEmail}`);

    return res.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.'
    });
  } catch (err) {
    console.error('Reset Password error:', err);
    return res.status(500).json({ success: false, message: 'Failed to reset password.' });
  }
});

export default router;
