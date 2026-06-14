require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');

const connectDB = require('./config/db');
const { init: initSimulator } = require('./services/priceSimulator');
const { setupWebSocket } = require('./websocket/wsHandler');

const authRoutes  = require('./routes/auth');
const stockRoutes = require('./routes/stocks');
const tradeRoutes = require('./routes/trade');

// ─── App setup ────────────────────────────────────────────────────────────────
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/trade',  tradeRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// ─── HTTP + WebSocket server ──────────────────────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Wire up WebSocket handlers
setupWebSocket(wss);

// Start the price simulator (broadcasts every 1 s)
initSimulator(wss);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀  Backend running  →  http://localhost:${PORT}`);
    console.log(`📡  WebSocket ready  →  ws://localhost:${PORT}\n`);
  });
});
