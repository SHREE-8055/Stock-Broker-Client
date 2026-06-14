import { useState, useEffect, useCallback, useRef } from 'react';
import { subscribe, unsubscribe, getSupportedStocks } from '../api/stocks';
import useWebSocket    from '../hooks/useWebSocket';
import StockCard       from '../components/StockCard';
import SubscribePanel  from '../components/SubscribePanel';
import Navbar          from '../components/Navbar';
import TradeModal      from '../components/TradeModal';
import PortfolioTable  from '../components/PortfolioTable';
import StockChartModal from '../components/StockChartModal';
import styles from './DashboardPage.module.css';

const WS_URL      = `ws://${window.location.hostname}:5000`;
const MAX_HISTORY = 60; // keep last 60 seconds of ticks

function nowLabel() {
  return new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function DashboardPage({ user, onLogout, onUserUpdate }) {
  const [subscriptions,   setSubscriptions]   = useState(user.subscriptions || []);
  const [prices,          setPrices]          = useState({});
  const [supportedStocks, setSupportedStocks] = useState([]);
  const [wsStatus,        setWsStatus]        = useState('connecting');

  // Price history: { [ticker]: [{ time, price }, …] }  — kept in a ref so
  // we update it without causing re-renders on every tick; a separate state
  // counter forces a render at most once per second.
  const historyRef  = useRef({});
  const [historyVer, setHistoryVer] = useState(0);

  // Trade state
  const [portfolio,   setPortfolio]   = useState(user.portfolio || []);
  const [balance,     setBalance]     = useState(user.balance ?? 10000);
  const [tradeTarget, setTradeTarget] = useState(null);
  const [chartTarget, setChartTarget] = useState(null);
  const [activeTab,   setActiveTab]   = useState('watchlist');

  useEffect(() => {
    getSupportedStocks().then(setSupportedStocks).catch(console.error);
  }, []);

  // ── Append a tick to history for one ticker ─────────────────────────────
  const appendHistory = useCallback((ticker, price) => {
    const h    = historyRef.current;
    const prev = h[ticker] || [];
    const next = [...prev, { time: nowLabel(), price }];
    h[ticker]  = next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next;
  }, []);

  // ── WebSocket messages ───────────────────────────────────────────────────
  const handleMessage = useCallback((msg) => {
    if (msg.type === 'auth_ok') {
      setWsStatus('connected');
      if (msg.snapshot) {
        const snap = msg.snapshot;
        setPrices((p) => ({ ...p, ...snap }));
        Object.entries(snap).forEach(([t, d]) => appendHistory(t, d.price));
        setHistoryVer((v) => v + 1);
      }
    }

    if (msg.type === 'price_update') {
      const upd = msg.data;
      setPrices((p) => ({ ...p, ...upd }));
      Object.entries(upd).forEach(([t, d]) => appendHistory(t, d.price));
      setHistoryVer((v) => v + 1);
    }

    if (msg.type === 'snapshot') {
      const snap = msg.snapshot;
      setPrices((p) => ({ ...p, ...snap }));
      Object.entries(snap).forEach(([t, d]) => appendHistory(t, d.price));
      setHistoryVer((v) => v + 1);
    }
  }, [appendHistory]);

  const { sendMessage } = useWebSocket(WS_URL, {
    onOpen:    () => { setWsStatus('connected'); sendMessage({ type: 'auth', email: user.email }); },
    onClose:   () => setWsStatus('disconnected'),
    onMessage: handleMessage,
  });

  // ── Subscribe / unsubscribe ──────────────────────────────────────────────
  const handleSubscribe = async (ticker) => {
    const { subscriptions: updated } = await subscribe(user.email, ticker);
    setSubscriptions(updated);
    sendMessage({ type: 'sync_subscriptions', email: user.email, subscriptions: updated });
  };

  const handleUnsubscribe = async (ticker) => {
    const { subscriptions: updated } = await unsubscribe(user.email, ticker);
    setSubscriptions(updated);
    sendMessage({ type: 'sync_subscriptions', email: user.email, subscriptions: updated });
    setPrices((p) => { const n = { ...p }; delete n[ticker]; return n; });
    delete historyRef.current[ticker];
  };

  // ── Trade complete ───────────────────────────────────────────────────────
  const handleTradeComplete = ({ balance: newBal, portfolio: newPort }) => {
    setBalance(newBal);
    setPortfolio(newPort);
    onUserUpdate((prev) => ({ ...prev, balance: newBal, portfolio: newPort }));
  };

  // ── Helpers ──────────────────────────────────────────────────────────────
  const ownedShares  = (ticker) => (portfolio.find((p) => p.ticker === ticker)?.shares ?? 0);
  const currentPrice = (ticker) => prices[ticker]?.price ?? 0;
  const getHistory   = (ticker) => historyRef.current[ticker] || [];

  const availableToSubscribe = supportedStocks.filter((s) => !subscriptions.includes(s.ticker));

  return (
    <div className={styles.layout}>
      <Navbar user={user} balance={balance} wsStatus={wsStatus} onLogout={onLogout} />

      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Add Stock ── */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Add to Watchlist</h2>
            <SubscribePanel available={availableToSubscribe} onSubscribe={handleSubscribe} />
          </section>

          {/* ── Tabs ── */}
          <div className={styles.tabBar}>
            <button
              className={`${styles.tabBtn} ${activeTab === 'watchlist' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('watchlist')}
            >
              Watchlist <span className={styles.tabCount}>{subscriptions.length}</span>
            </button>
            <button
              className={`${styles.tabBtn} ${activeTab === 'portfolio' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('portfolio')}
            >
              Portfolio <span className={styles.tabCount}>{portfolio.length}</span>
            </button>
          </div>

          {/* ── Watchlist ── */}
          {activeTab === 'watchlist' && (
            <section className={styles.section}>
              {subscriptions.length === 0 ? (
                <div className={styles.empty}>
                  <span className={styles.emptyIcon}>📊</span>
                  <p>No stocks yet. Add some above to see live prices and charts.</p>
                </div>
              ) : (
                <div className={styles.grid}>
                  {subscriptions.map((ticker) => (
                    <StockCard
                      key={ticker}
                      ticker={ticker}
                      data={prices[ticker] || null}
                      history={getHistory(ticker)}
                      ownedShares={ownedShares(ticker)}
                      onRemove={() => handleUnsubscribe(ticker)}
                      onTrade={(t) => setTradeTarget(t)}
                      onChart={(t) => setChartTarget(t)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── Portfolio ── */}
          {activeTab === 'portfolio' && (
            <section className={styles.section}>
              <PortfolioTable
                portfolio={portfolio.map((h) => ({
                  ...h,
                  currentPrice: prices[h.ticker]?.price ?? h.avgCost,
                  marketValue:  (prices[h.ticker]?.price ?? h.avgCost) * h.shares,
                  pnl:          ((prices[h.ticker]?.price ?? h.avgCost) - h.avgCost) * h.shares,
                  pnlPct: h.avgCost > 0
                    ? (((prices[h.ticker]?.price ?? h.avgCost) - h.avgCost) / h.avgCost) * 100
                    : 0,
                }))}
                onTrade={(t) => setTradeTarget(t)}
                onChart={(t) => setChartTarget(t)}
              />
            </section>
          )}

        </div>
      </main>

      {/* ── Chart Modal ── */}
      {chartTarget && (
        <StockChartModal
          ticker={chartTarget}
          history={getHistory(chartTarget)}
          data={prices[chartTarget] || null}
          onClose={() => setChartTarget(null)}
          onTrade={(t) => { setChartTarget(null); setTradeTarget(t); }}
        />
      )}

      {/* ── Trade Modal ── */}
      {tradeTarget && (
        <TradeModal
          ticker={tradeTarget}
          price={currentPrice(tradeTarget)}
          balance={balance}
          ownedShares={ownedShares(tradeTarget)}
          email={user.email}
          onClose={() => setTradeTarget(null)}
          onTradeComplete={handleTradeComplete}
        />
      )}
    </div>
  );
}
