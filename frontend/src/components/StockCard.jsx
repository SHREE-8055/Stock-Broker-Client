import { useEffect, useRef, useState } from 'react';
import MiniSparkline from './MiniSparkline';
import styles from './StockCard.module.css';

const COMPANY_NAMES = {
  GOOG: 'Alphabet Inc.',
  TSLA: 'Tesla, Inc.',
  AMZN: 'Amazon.com, Inc.',
  META: 'Meta Platforms',
  NVDA: 'NVIDIA Corp.',
};

export default function StockCard({ ticker, data, history, ownedShares, onRemove, onTrade, onChart }) {
  const prevPriceRef = useRef(null);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (!data) return;
    if (prevPriceRef.current !== null && prevPriceRef.current !== data.price) {
      setFlash(data.price > prevPriceRef.current ? 'up' : 'down');
      const t = setTimeout(() => setFlash(null), 600);
      return () => clearTimeout(t);
    }
    prevPriceRef.current = data.price;
  }, [data?.price]);

  const price     = data?.price     ?? null;
  const change    = data?.change    ?? 0;
  const changePct = data?.changePct ?? 0;
  const isUp      = change >= 0;

  return (
    <div className={`${styles.card} ${flash ? styles[`flash_${flash}`] : ''}`}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <span className={styles.ticker}>{ticker}</span>
          <span className={styles.company}>{COMPANY_NAMES[ticker] ?? ticker}</span>
        </div>
        <button
          className={styles.removeBtn}
          onClick={onRemove}
          title="Remove from watchlist"
          aria-label={`Remove ${ticker}`}
        >✕</button>
      </div>

      {/* ── Price ── */}
      <div className={styles.priceRow}>
        <span className={styles.price}>
          {price !== null ? `$${price.toFixed(2)}` : '—'}
        </span>
      </div>

      {/* ── Change ── */}
      <div className={`${styles.changeRow} ${isUp ? styles.up : styles.down}`}>
        <span className={styles.arrow}>{isUp ? '▲' : '▼'}</span>
        <span>{isUp ? '+' : ''}{change.toFixed(2)}</span>
        <span>({isUp ? '+' : ''}{changePct.toFixed(3)}%)</span>
      </div>

      {/* ── Mini sparkline ── */}
      <div className={styles.sparkWrap} onClick={() => onChart(ticker)} title="View chart">
        <MiniSparkline history={history} isUp={isUp} />
        {(!history || history.length < 2) && (
          <span className={styles.sparkPlaceholder}>Collecting data…</span>
        )}
      </div>

      {/* ── Owned badge ── */}
      {ownedShares > 0 && (
        <div className={styles.owned}>
          📦 {ownedShares} share{ownedShares !== 1 ? 's' : ''} owned
        </div>
      )}

      {/* ── Footer ── */}
      <div className={styles.footer}>
        <span className={styles.liveLabel}>
          <span className={styles.liveDot} /> LIVE
        </span>
        <div className={styles.actions}>
          <button
            className={styles.chartBtn}
            onClick={() => onChart(ticker)}
            title="Open chart"
            aria-label={`Open chart for ${ticker}`}
          >
            📈
          </button>
          <button
            className={styles.tradeBtn}
            onClick={() => onTrade(ticker)}
            disabled={price === null}
          >
            Trade
          </button>
        </div>
      </div>
    </div>
  );
}
