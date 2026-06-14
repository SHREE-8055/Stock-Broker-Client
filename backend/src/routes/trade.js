const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const { SUPPORTED_STOCKS }  = require('../config/stocks');
const { getCurrentPrices }  = require('../services/priceSimulator');

/**
 * GET /api/trade/portfolio?email=xxx
 * Returns the user's balance, holdings and trade history.
 */
router.get('/portfolio', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const prices = getCurrentPrices();

    // Enrich each holding with current market value and P&L
    const enriched = user.portfolio.map((h) => ({
      ticker:       h.ticker,
      shares:       h.shares,
      avgCost:      h.avgCost,
      currentPrice: prices[h.ticker] ?? h.avgCost,
      marketValue:  (prices[h.ticker] ?? h.avgCost) * h.shares,
      pnl:          ((prices[h.ticker] ?? h.avgCost) - h.avgCost) * h.shares,
      pnlPct:       h.avgCost > 0
        ? (((prices[h.ticker] ?? h.avgCost) - h.avgCost) / h.avgCost) * 100
        : 0,
    }));

    res.json({
      balance:   user.balance,
      portfolio: enriched,
      trades:    user.trades.slice().reverse(), // newest first
    });
  } catch (err) {
    console.error('Portfolio error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * POST /api/trade/buy
 * Body: { email, ticker, shares }
 */
router.post('/buy', async (req, res) => {
  try {
    const { email, ticker, shares } = req.body;
    const qty = parseFloat(shares);

    if (!SUPPORTED_STOCKS.includes(ticker)) {
      return res.status(400).json({ error: `${ticker} is not supported.` });
    }
    if (!qty || qty <= 0 || !Number.isFinite(qty)) {
      return res.status(400).json({ error: 'Shares must be a positive number.' });
    }

    const prices = getCurrentPrices();
    const price  = prices[ticker];
    const total  = parseFloat((price * qty).toFixed(2));

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (user.balance < total) {
      return res.status(400).json({
        error: `Insufficient balance. Need $${total.toFixed(2)}, have $${user.balance.toFixed(2)}.`,
      });
    }

    // Deduct balance
    user.balance = parseFloat((user.balance - total).toFixed(2));

    // Update holding (weighted average cost)
    const existing = user.portfolio.find((h) => h.ticker === ticker);
    if (existing) {
      const newTotalShares = existing.shares + qty;
      existing.avgCost = parseFloat(
        ((existing.avgCost * existing.shares + price * qty) / newTotalShares).toFixed(4)
      );
      existing.shares = parseFloat(newTotalShares.toFixed(6));
    } else {
      user.portfolio.push({ ticker, shares: qty, avgCost: price });
    }

    // Record trade
    user.trades.push({ ticker, type: 'buy', shares: qty, price, total });

    await user.save();

    const prices2 = getCurrentPrices();
    const enriched = user.portfolio.map((h) => ({
      ticker:       h.ticker,
      shares:       h.shares,
      avgCost:      h.avgCost,
      currentPrice: prices2[h.ticker] ?? h.avgCost,
      marketValue:  (prices2[h.ticker] ?? h.avgCost) * h.shares,
      pnl:          ((prices2[h.ticker] ?? h.avgCost) - h.avgCost) * h.shares,
      pnlPct: h.avgCost > 0
        ? (((prices2[h.ticker] ?? h.avgCost) - h.avgCost) / h.avgCost) * 100
        : 0,
    }));

    res.json({
      message:   `Bought ${qty} share(s) of ${ticker} at $${price.toFixed(2)}`,
      balance:   user.balance,
      portfolio: enriched,
      trade:     user.trades[user.trades.length - 1],
    });
  } catch (err) {
    console.error('Buy error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

/**
 * POST /api/trade/sell
 * Body: { email, ticker, shares }
 */
router.post('/sell', async (req, res) => {
  try {
    const { email, ticker, shares } = req.body;
    const qty = parseFloat(shares);

    if (!SUPPORTED_STOCKS.includes(ticker)) {
      return res.status(400).json({ error: `${ticker} is not supported.` });
    }
    if (!qty || qty <= 0 || !Number.isFinite(qty)) {
      return res.status(400).json({ error: 'Shares must be a positive number.' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const holding = user.portfolio.find((h) => h.ticker === ticker);
    if (!holding || holding.shares < qty) {
      return res.status(400).json({
        error: `Insufficient shares. You own ${holding ? holding.shares.toFixed(4) : 0} share(s) of ${ticker}.`,
      });
    }

    const prices = getCurrentPrices();
    const price  = prices[ticker];
    const total  = parseFloat((price * qty).toFixed(2));

    // Credit balance
    user.balance = parseFloat((user.balance + total).toFixed(2));

    // Update holding
    holding.shares = parseFloat((holding.shares - qty).toFixed(6));
    if (holding.shares <= 0.000001) {
      // Remove zero/dust positions
      user.portfolio = user.portfolio.filter((h) => h.ticker !== ticker);
    }

    // Record trade
    user.trades.push({ ticker, type: 'sell', shares: qty, price, total });

    await user.save();

    const prices2 = getCurrentPrices();
    const enriched = user.portfolio.map((h) => ({
      ticker:       h.ticker,
      shares:       h.shares,
      avgCost:      h.avgCost,
      currentPrice: prices2[h.ticker] ?? h.avgCost,
      marketValue:  (prices2[h.ticker] ?? h.avgCost) * h.shares,
      pnl:          ((prices2[h.ticker] ?? h.avgCost) - h.avgCost) * h.shares,
      pnlPct: h.avgCost > 0
        ? (((prices2[h.ticker] ?? h.avgCost) - h.avgCost) / h.avgCost) * 100
        : 0,
    }));

    res.json({
      message:   `Sold ${qty} share(s) of ${ticker} at $${price.toFixed(2)}`,
      balance:   user.balance,
      portfolio: enriched,
      trade:     user.trades[user.trades.length - 1],
    });
  } catch (err) {
    console.error('Sell error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
