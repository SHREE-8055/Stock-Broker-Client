const { SUPPORTED_STOCKS, SEED_PRICES } = require('../config/stocks');

// Live price state — shallow copy of seed values
const prices = { ...SEED_PRICES };

// Keep a record of the previous price so clients can display trend arrows
const prevPrices = { ...SEED_PRICES };

// WebSocket client registry
// Map<ws, { email: string | null }>
let clients = new Map();
let wss = null;

/**
 * Register the WebSocket server so the simulator can broadcast.
 */
function init(wsServer) {
  wss = wsServer;

  setInterval(() => {
    // 1. Save previous prices
    for (const ticker of SUPPORTED_STOCKS) {
      prevPrices[ticker] = prices[ticker];
    }

    // 2. Nudge each price by ±0.8 %
    for (const ticker of SUPPORTED_STOCKS) {
      const pct = (Math.random() - 0.5) * 0.016; // ±0.8 %
      prices[ticker] = Math.max(0.01, prices[ticker] * (1 + pct));
      prices[ticker] = parseFloat(prices[ticker].toFixed(2));
    }

    // 3. Broadcast to every authenticated client
    if (!wss) return;
    wss.clients.forEach((ws) => {
      const meta = clients.get(ws);
      if (!meta || !meta.email) return;
      if (ws.readyState !== 1 /* OPEN */) return;

      const payload = buildPayload(meta.email);
      if (payload) {
        ws.send(JSON.stringify({ type: 'price_update', data: payload }));
      }
    });
  }, 1000);
}

/**
 * Build the price payload for a specific user.
 * Returned object contains only the tickers they subscribe to.
 * Fetches subscriptions fresh from the in-memory clients map.
 */
function buildPayload(email) {
  const subs = getSubscriptions(email);
  if (!subs || subs.length === 0) return null;

  const payload = {};
  for (const ticker of subs) {
    payload[ticker] = {
      price: prices[ticker],
      change: parseFloat((prices[ticker] - prevPrices[ticker]).toFixed(2)),
      changePct: parseFloat(
        (((prices[ticker] - prevPrices[ticker]) / prevPrices[ticker]) * 100).toFixed(3)
      ),
    };
  }
  return payload;
}

// ─── Client registry helpers ──────────────────────────────────────────────────

function registerClient(ws) {
  clients.set(ws, { email: null, subscriptions: [] });
}

function authenticateClient(ws, email, subscriptions = []) {
  clients.set(ws, { email, subscriptions });
}

function updateSubscriptions(email, subscriptions) {
  // Update all sockets that belong to this email
  for (const [ws, meta] of clients.entries()) {
    if (meta.email === email) {
      clients.set(ws, { ...meta, subscriptions });
    }
  }
}

function getSubscriptions(email) {
  for (const [, meta] of clients.entries()) {
    if (meta.email === email) return meta.subscriptions;
  }
  return [];
}

function removeClient(ws) {
  clients.delete(ws);
}

function getCurrentPrices() {
  const snapshot = {};
  for (const ticker of SUPPORTED_STOCKS) {
    snapshot[ticker] = prices[ticker];
  }
  return snapshot;
}

module.exports = {
  init,
  registerClient,
  authenticateClient,
  updateSubscriptions,
  removeClient,
  getCurrentPrices,
};
