const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { SUPPORTED_STOCKS } = require('../config/stocks');
const { getCurrentPrices } = require('../services/priceSimulator');

/**
 * GET /api/stocks
 * Returns the list of supported tickers with their latest simulated prices.
 */
router.get('/', (req, res) => {
  const prices = getCurrentPrices();
  const data = SUPPORTED_STOCKS.map((ticker) => ({
    ticker,
    price: prices[ticker],
  }));
  res.json(data);
});

/**
 * POST /api/stocks/subscribe
 * Body: { email, ticker }
 * Adds ticker to the user's subscription list.
 */
router.post('/subscribe', async (req, res) => {
  try {
    const { email, ticker } = req.body;

    if (!SUPPORTED_STOCKS.includes(ticker)) {
      return res.status(400).json({ error: `${ticker} is not a supported stock.` });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.subscriptions.includes(ticker)) {
      user.subscriptions.push(ticker);
      await user.save();
    }

    res.json({ subscriptions: user.subscriptions });
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * POST /api/stocks/unsubscribe
 * Body: { email, ticker }
 * Removes ticker from the user's subscription list.
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email, ticker } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.subscriptions = user.subscriptions.filter((t) => t !== ticker);
    await user.save();

    res.json({ subscriptions: user.subscriptions });
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
