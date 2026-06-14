const User = require('../models/User');
const {
  registerClient,
  authenticateClient,
  updateSubscriptions,
  removeClient,
  getCurrentPrices,
} = require('../services/priceSimulator');

/**
 * Attach all WebSocket event handlers to the ws server.
 */
function setupWebSocket(wss) {
  wss.on('connection', (ws) => {
    registerClient(ws);

    ws.on('message', async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw);
      } catch {
        return ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON.' }));
      }

      // ── auth ──────────────────────────────────────────────────────────────
      if (msg.type === 'auth') {
        const { email } = msg;
        try {
          const user = await User.findOne({ email });
          if (!user) {
            return ws.send(
              JSON.stringify({ type: 'auth_error', message: 'User not found. Please log in first.' })
            );
          }
          authenticateClient(ws, email, user.subscriptions);

          // Send an immediate price snapshot for subscribed tickers
          const prices = getCurrentPrices();
          const snapshot = {};
          for (const ticker of user.subscriptions) {
            snapshot[ticker] = { price: prices[ticker], change: 0, changePct: 0 };
          }

          ws.send(
            JSON.stringify({
              type: 'auth_ok',
              email: user.email,
              name: user.name,
              subscriptions: user.subscriptions,
              snapshot,
            })
          );
        } catch (err) {
          console.error('WS auth error:', err);
          ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed.' }));
        }
      }

      // ── sync_subscriptions ────────────────────────────────────────────────
      // Client sends this after subscribe/unsubscribe REST calls so the
      // simulator picks up the new list without a reconnect.
      if (msg.type === 'sync_subscriptions') {
        const { email, subscriptions } = msg;
        updateSubscriptions(email, subscriptions);

        // Send immediate snapshot for newly added tickers
        const prices = getCurrentPrices();
        const snapshot = {};
        for (const ticker of subscriptions) {
          snapshot[ticker] = { price: prices[ticker], change: 0, changePct: 0 };
        }
        ws.send(JSON.stringify({ type: 'snapshot', snapshot }));
      }
    });

    ws.on('close', () => removeClient(ws));
    ws.on('error', (err) => console.error('WS error:', err));
  });
}

module.exports = { setupWebSocket };
