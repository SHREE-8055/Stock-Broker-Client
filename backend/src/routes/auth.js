const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// ─── Helper: safe user payload (no password) ─────────────────────────────────
function userPayload(user) {
  return {
    email:         user.email,
    name:          user.name,
    balance:       user.balance,
    subscriptions: user.subscriptions,
    portfolio:     user.portfolio,
    trades:        user.trades,
  };
}

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters.' });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = await User.create({ name: name.trim(), email, password });
    res.status(201).json(userPayload(user));
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const match = await user.matchPassword(password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.json(userPayload(user));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

module.exports = router;
