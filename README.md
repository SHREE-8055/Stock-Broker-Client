# 📈 StockPulse — Real-Time Stock Broker Dashboard

A full-stack **MERN** (MongoDB · Express · React · Node.js) application that simulates a stock broker client dashboard. Users can register, log in, subscribe to live stock feeds, watch prices update in real time via WebSocket, view animated charts, and place simulated buy/sell orders — all without a page refresh.

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment Variables](#environment-variables)
6. [Installation & Setup](#installation--setup)
7. [Running the App](#running-the-app)
8. [Demo Accounts](#demo-accounts)
9. [API Reference](#api-reference)
10. [WebSocket Protocol](#websocket-protocol)
11. [Architecture & Data Flow](#architecture--data-flow)
12. [Frontend Component Guide](#frontend-component-guide)
13. [Supported Stocks](#supported-stocks)
14. [How Prices Are Simulated](#how-prices-are-simulated)
15. [How Buy / Sell Works](#how-buy--sell-works)
16. [Extending the App](#extending-the-app)

---

## Features

| Area | Detail |
|---|---|
| **Auth** | Register with name + email + password (bcrypt hashed). Login with credentials. |
| **Virtual wallet** | Every new account starts with **$10,000** simulated cash. |
| **Watchlist** | Subscribe / unsubscribe to any of 5 supported stocks. Persisted in MongoDB. |
| **Live prices** | Prices update every **1 second** via WebSocket — no page refresh needed. |
| **Multi-user async** | Two (or more) browser tabs, each logged in as a different user, receive independent price streams based on their own subscription lists. |
| **Mini sparkline** | Each stock card shows a live scrolling area chart of the last 60 price ticks. |
| **Full chart modal** | Click 📈 to open a detailed area chart with X/Y axes, hover tooltips, open-price reference line, and a stats bar (Open · High · Low · Last). |
| **Buy / Sell** | Place market orders at the live price. Validates balance and share count. Tracks weighted average cost per holding. |
| **Portfolio tab** | Table of all holdings showing shares, avg cost, current price, market value, and live unrealised P&L. |
| **Navbar balance** | Cash balance in the nav bar updates instantly after every trade. |
| **Auto-reconnect** | WebSocket client reconnects automatically if the connection drops. |

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---|---|---|
| Node.js | ≥ 18 | Runtime |
| Express | ^4.18 | HTTP server & REST API |
| ws | ^8.16 | Native WebSocket server |
| Mongoose | ^8.1 | MongoDB ODM |
| bcryptjs | ^2.4 | Password hashing (salt rounds: 12) |
| dotenv | ^16.3 | Environment variable loading |
| uuid | ^9.0 | Session identifiers |
| nodemon | ^3.0 | Dev auto-restart (devDependency) |

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | ^18.2 | UI framework |
| Vite | ^5.1 | Build tool & dev server |
| Recharts | ^3.8 | Area charts & sparklines |
| CSS Modules | — | Scoped component styles |

### Database
- **MongoDB Atlas** (cloud) — connection string configured in `.env`

---

## Project Structure

```
stock/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Mongoose connection
│   │   │   └── stocks.js          # Supported tickers + seed prices
│   │   ├── models/
│   │   │   └── User.js            # User schema (auth, balance, portfolio, trades)
│   │   ├── routes/
│   │   │   ├── auth.js            # POST /api/auth/register  /login
│   │   │   ├── stocks.js          # GET /api/stocks  POST /subscribe  /unsubscribe
│   │   │   └── trade.js           # GET /api/trade/portfolio  POST /buy  /sell
│   │   ├── services/
│   │   │   └── priceSimulator.js  # 1-second price tick engine + WS registry
│   │   ├── websocket/
│   │   │   └── wsHandler.js       # WS message handling (auth, sync_subscriptions)
│   │   └── index.js               # App entry point
│   ├── .env                       # Environment variables (not committed)
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── auth.js            # login() / register() fetch helpers
│   │   │   ├── stocks.js          # getSupportedStocks() / subscribe() / unsubscribe()
│   │   │   └── trade.js           # buyStock() / sellStock() / getPortfolio()
│   │   ├── components/
│   │   │   ├── MiniSparkline.jsx  # Tiny in-card area chart (Recharts)
│   │   │   ├── Navbar.jsx         # Top nav — brand, WS status, cash balance, user
│   │   │   ├── PortfolioTable.jsx # Holdings table with live P&L
│   │   │   ├── StockCard.jsx      # Live price card with sparkline + Trade button
│   │   │   ├── StockChartModal.jsx# Full-screen 60s area chart with tooltips
│   │   │   ├── SubscribePanel.jsx # Pill buttons to add stocks to watchlist
│   │   │   └── TradeModal.jsx     # Buy / Sell order form with live order summary
│   │   ├── hooks/
│   │   │   └── useWebSocket.js    # Auto-reconnect WebSocket hook
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx      # Email + password sign-in
│   │   │   ├── RegisterPage.jsx   # Name + email + password + confirm registration
│   │   │   └── DashboardPage.jsx  # Main dashboard (watchlist + portfolio tabs)
│   │   ├── App.jsx                # Page-level routing (login | register | dashboard)
│   │   ├── index.css              # Global CSS variables & resets
│   │   └── main.jsx               # React DOM entry
│   ├── index.html
│   ├── vite.config.js             # Vite config + /api proxy to :5000
│   └── package.json
│
└── README.md
```

---

## Prerequisites

- **Node.js** v18 or later (tested on v24)
- **npm** v9 or later
- A **MongoDB Atlas** cluster (or local MongoDB ≥ 6)
- A modern browser (Chrome, Firefox, Edge, Safari)

Check your versions:

```bash
node -v
npm -v
```

---

## Environment Variables

Create (or edit) `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority&appName=<AppName>
```

| Variable | Description |
|---|---|
| `PORT` | Port the Express + WebSocket server listens on. Defaults to `5000`. |
| `MONGO_URI` | Full MongoDB connection string. Atlas or local (`mongodb://127.0.0.1:27017/stockdashboard`). |

> **Never commit `.env` to version control.** Add it to `.gitignore`.

---

## Installation & Setup

### 1. Clone / navigate to the project

```bash
cd ~/Desktop/stock
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Seed demo accounts (optional but recommended)

This creates `alice@demo.com / alice123` and `bob@demo.com / bob123` in your database:

```bash
cd ../backend
node src/scripts/seedUsers.js
```

Expected output:
```
Connected to MongoDB
✅  Updated: alice@demo.com
✅  Updated: bob@demo.com
Done.
```

---

## Running the App

Open **two terminal tabs**.

### Terminal 1 — Backend

```bash
cd backend

# Development (auto-restarts on file changes)
npm run dev

# Production
npm start
```

You should see:
```
✅  MongoDB connected: cluster0-shard-00-xx.mongodb.net
🚀  Backend running  →  http://localhost:5000
📡  WebSocket ready  →  ws://localhost:5000
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in 500ms
➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

> To test multi-user async updates, open a **second browser tab** (or an incognito window) and log in as a different user.

---

## Demo Accounts

| Email | Password | Starting balance |
|---|---|---|
| `alice@demo.com` | `alice123` | $10,000 |
| `bob@demo.com` | `bob123` | $10,000 |

You can also register any new account — it will receive $10,000 virtual cash automatically.

---

## API Reference

### Auth

#### `POST /api/auth/register`

Create a new user account.

**Request body:**
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response `201`:**
```json
{
  "email": "alice@example.com",
  "name": "Alice Smith",
  "balance": 10000,
  "subscriptions": [],
  "portfolio": [],
  "trades": []
}
```

**Errors:** `400` invalid input · `409` email already exists

---

#### `POST /api/auth/login`

Authenticate an existing user.

**Request body:**
```json
{
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response `200`:** same shape as register response.

**Errors:** `400` missing fields · `401` wrong credentials

---

### Stocks

#### `GET /api/stocks`

Returns all 5 supported tickers with their latest simulated price.

**Response `200`:**
```json
[
  { "ticker": "GOOG", "price": 172.84 },
  { "ticker": "TSLA", "price": 178.23 },
  { "ticker": "AMZN", "price": 186.91 },
  { "ticker": "META", "price": 498.10 },
  { "ticker": "NVDA", "price": 880.55 }
]
```

---

#### `POST /api/stocks/subscribe`

Add a ticker to a user's watchlist.

**Request body:**
```json
{ "email": "alice@example.com", "ticker": "GOOG" }
```

**Response `200`:**
```json
{ "subscriptions": ["GOOG", "TSLA"] }
```

---

#### `POST /api/stocks/unsubscribe`

Remove a ticker from a user's watchlist.

**Request body:**
```json
{ "email": "alice@example.com", "ticker": "GOOG" }
```

**Response `200`:**
```json
{ "subscriptions": ["TSLA"] }
```

---

### Trading

#### `GET /api/trade/portfolio?email=alice@example.com`

Returns the user's current holdings enriched with live market data.

**Response `200`:**
```json
{
  "balance": 9423.37,
  "portfolio": [
    {
      "ticker": "AMZN",
      "shares": 3,
      "avgCost": 192.21,
      "currentPrice": 194.50,
      "marketValue": 583.50,
      "pnl": 6.87,
      "pnlPct": 1.191
    }
  ],
  "trades": [
    {
      "ticker": "AMZN",
      "type": "buy",
      "shares": 3,
      "price": 192.21,
      "total": 576.63,
      "createdAt": "2026-06-14T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/trade/buy`

Place a market buy order at the current simulated price.

**Request body:**
```json
{ "email": "alice@example.com", "ticker": "AMZN", "shares": 3 }
```

**Response `200`:**
```json
{
  "message": "Bought 3 share(s) of AMZN at $192.21",
  "balance": 9423.37,
  "portfolio": [ /* enriched holdings */ ],
  "trade": { "ticker": "AMZN", "type": "buy", "shares": 3, "price": 192.21, "total": 576.63 }
}
```

**Errors:** `400` unsupported ticker · `400` invalid share count · `400` insufficient balance · `404` user not found

---

#### `POST /api/trade/sell`

Place a market sell order.

**Request body:**
```json
{ "email": "alice@example.com", "ticker": "AMZN", "shares": 1 }
```

**Response `200`:**
```json
{
  "message": "Sold 1 share(s) of AMZN at $194.50",
  "balance": 9617.87,
  "portfolio": [ /* updated holdings */ ],
  "trade": { "ticker": "AMZN", "type": "sell", "shares": 1, "price": 194.50, "total": 194.50 }
}
```

**Errors:** `400` unsupported ticker · `400` invalid share count · `400` insufficient shares

---

### Health

#### `GET /health`

```json
{ "status": "ok" }
```

---

## WebSocket Protocol

The frontend connects to `ws://localhost:5000` and exchanges JSON messages.

### Client → Server

| Message type | Payload | Purpose |
|---|---|---|
| `auth` | `{ email }` | Authenticate the socket connection after opening. The server looks up the user's subscriptions in MongoDB and starts streaming prices. |
| `sync_subscriptions` | `{ email, subscriptions: string[] }` | Called after a REST subscribe/unsubscribe so the price simulator updates its in-memory registry without requiring a reconnect. |

### Server → Client

| Message type | Payload | Purpose |
|---|---|---|
| `auth_ok` | `{ email, name, subscriptions, snapshot }` | Confirms authentication. `snapshot` contains the current price for every subscribed ticker. |
| `auth_error` | `{ message }` | Authentication failed (user not found). |
| `price_update` | `{ data: { [ticker]: { price, change, changePct } } }` | Sent every 1 second. Contains only the tickers the authenticated user subscribes to. |
| `snapshot` | `{ snapshot: { [ticker]: { price, change, changePct } } }` | Sent after `sync_subscriptions` to immediately show prices for newly added tickers. |
| `error` | `{ message }` | Generic error (e.g. invalid JSON). |

### Price update payload shape

```json
{
  "type": "price_update",
  "data": {
    "GOOG": { "price": 172.84, "change": 0.34, "changePct": 0.197 },
    "NVDA": { "price": 881.20, "change": -2.15, "changePct": -0.243 }
  }
}
```

---

## Architecture & Data Flow

```
Browser Tab A (Alice)              Browser Tab B (Bob)
      │                                   │
      │  WebSocket (ws://localhost:5000)  │
      │◄──────────────────────────────────►│
      │                                   │
      ▼                                   ▼
┌─────────────────────────────────────────────┐
│              Express + ws Server            │
│                                             │
│  ┌────────────────────────────────────┐     │
│  │       priceSimulator.js            │     │
│  │  setInterval 1000ms                │     │
│  │  nudge all 5 prices ±0.8%          │     │
│  │  broadcast to each WS client       │     │
│  │  (only tickers they subscribe to)  │     │
│  └────────────────────────────────────┘     │
│                                             │
│  REST API                                   │
│  /api/auth   /api/stocks   /api/trade       │
└──────────────────────┬──────────────────────┘
                       │ Mongoose
                       ▼
              ┌────────────────┐
              │  MongoDB Atlas │
              │  users         │
              │  ├ email       │
              │  ├ password    │
              │  ├ balance     │
              │  ├ subscriptions│
              │  ├ portfolio   │
              │  └ trades      │
              └────────────────┘
```

**Key design decisions:**

- The WebSocket server and REST API share **the same HTTP server** (`http.createServer(app)`), so a single port handles both.
- The price simulator keeps an **in-memory registry** of connected WebSocket clients and their subscriptions. REST subscribe/unsubscribe calls update MongoDB, then the client sends a `sync_subscriptions` WS message to update the in-memory registry — no reconnect required.
- Price history (the 60-tick chart buffer) lives in a `useRef` on the frontend, not in React state, so every incoming tick does **not** trigger a full re-render. A separate `historyVer` counter increments once per tick to sync the UI efficiently.

---

## Frontend Component Guide

### Pages

| Page | File | Description |
|---|---|---|
| Login | `pages/LoginPage.jsx` | Email + password form. Links to Register. Has demo account fill buttons. |
| Register | `pages/RegisterPage.jsx` | Name + email + password + confirm. On success immediately logs the user in. |
| Dashboard | `pages/DashboardPage.jsx` | Main authenticated view. Manages WebSocket connection, price state, history buffer, and all modals. |

### Components

| Component | File | Description |
|---|---|---|
| `Navbar` | `components/Navbar.jsx` | Sticky top bar. Shows brand, live WS status indicator (pulsing dot), cash balance, user avatar, and sign-out. |
| `SubscribePanel` | `components/SubscribePanel.jsx` | Row of pill buttons for stocks not yet in the watchlist. Clicking subscribes and adds the card. |
| `StockCard` | `components/StockCard.jsx` | Shows ticker, price, change, mini sparkline, owned-shares badge, and Trade / 📈 buttons. Flashes green or red on each tick. |
| `MiniSparkline` | `components/MiniSparkline.jsx` | 52px tall Recharts `AreaChart` with no axes. Color matches price direction. `isAnimationActive={false}` keeps it smooth at 1fps. |
| `StockChartModal` | `components/StockChartModal.jsx` | Full-screen overlay with a 340px tall `AreaChart`, custom tooltip, open-price reference line, and stats bar. |
| `TradeModal` | `components/TradeModal.jsx` | Buy / Sell tabbed order form. Shows live order summary (total cost, balance after). Calls `/api/trade/buy` or `/api/trade/sell`. |
| `PortfolioTable` | `components/PortfolioTable.jsx` | Responsive table of holdings. All numeric columns update live as WS prices arrive. Summary bar shows total portfolio value and total P&L. |

### Hooks

| Hook | File | Description |
|---|---|---|
| `useWebSocket` | `hooks/useWebSocket.js` | Manages a single WebSocket connection. Auto-reconnects after 2 seconds on close. Exposes `sendMessage`. Cleans up on unmount. |

---

## Supported Stocks

| Ticker | Company | Seed Price |
|---|---|---|
| `GOOG` | Alphabet Inc. | $172.50 |
| `TSLA` | Tesla, Inc. | $177.90 |
| `AMZN` | Amazon.com, Inc. | $186.40 |
| `META` | Meta Platforms | $497.25 |
| `NVDA` | NVIDIA Corp. | $878.35 |

To add more tickers, edit `backend/src/config/stocks.js` and add the same ticker to `COMPANY_NAMES` in the frontend components.

---

## How Prices Are Simulated

`backend/src/services/priceSimulator.js` runs a `setInterval` every **1000 ms**:

```
newPrice = currentPrice × (1 + random(-0.008, +0.008))
```

- The random factor is `(Math.random() - 0.5) * 0.016`, giving a ±0.8% per-tick maximum swing.
- `Math.max(0.01, ...)` prevents prices going negative.
- Prices are rounded to 2 decimal places.
- The `change` and `changePct` values sent to the client are computed against the **previous tick**, not the seed price.

After updating all prices, the simulator iterates every connected WebSocket client, looks up their subscription list, and broadcasts only their subset of tickers. This means Alice watching `GOOG + TSLA` and Bob watching `AMZN + NVDA` receive completely independent payloads.

---

## How Buy / Sell Works

### Buy

1. Look up the current in-memory price for the ticker.
2. Calculate `total = price × shares`.
3. Check `user.balance >= total` — reject with a descriptive error if not.
4. Deduct `total` from `user.balance`.
5. Update the holding using **weighted average cost**:
   ```
   newAvgCost = (oldAvgCost × oldShares + price × newShares) / totalShares
   ```
6. Append a trade record to `user.trades`.
7. Persist to MongoDB.
8. Return the updated `balance` and enriched `portfolio`.

### Sell

1. Check the user holds at least `shares` of the ticker.
2. Credit `total = price × shares` to `user.balance`.
3. Reduce `holding.shares`. If shares drop to ≤ 0.000001 (floating-point dust), remove the holding entirely.
4. Append a trade record.
5. Persist and return updated state.

### P&L calculation (live)

The portfolio is enriched on every price update in the frontend:

```js
pnl    = (currentPrice - avgCost) × shares
pnlPct = ((currentPrice - avgCost) / avgCost) × 100
```

This is recalculated client-side every second without hitting the server.

---

## Extending the App

### Add a new stock

1. In `backend/src/config/stocks.js`, add the ticker to `SUPPORTED_STOCKS` and give it a seed price in `SEED_PRICES`.
2. In the frontend, add the ticker → company name mapping to `COMPANY_NAMES` inside `StockCard.jsx`, `TradeModal.jsx`, and `StockChartModal.jsx`.

### Use real prices

Replace the `setInterval` body in `priceSimulator.js` with a call to a market data API (e.g. Alpaca, Polygon.io, Yahoo Finance). Keep the same `broadcast` logic — only the price source changes.

### Add JWT authentication

1. Install `jsonwebtoken`.
2. Issue a signed token on login/register and return it in the response.
3. Add an `auth` middleware to protected routes that verifies the token from the `Authorization: Bearer <token>` header.
4. Store the token in `localStorage` on the frontend and attach it to API requests.

### Persist chart history

Currently the 60-tick history buffer lives in React memory and resets on page refresh. To persist it, send history snapshots over WebSocket or store tick data in a time-series collection in MongoDB (e.g. one document per ticker per minute).

---

## Scripts

| Command | Where | What it does |
|---|---|---|
| `npm start` | `backend/` | Start backend with `node` |
| `npm run dev` | `backend/` | Start backend with `nodemon` (hot-reload) |
| `node src/scripts/seedUsers.js` | `backend/` | Create / update demo accounts in the database |
| `npm run dev` | `frontend/` | Start Vite dev server on port 5173 |
| `npm run build` | `frontend/` | Production build to `frontend/dist/` |
| `npm run preview` | `frontend/` | Serve the production build locally |

---

## License

MIT — free to use, modify, and distribute.
