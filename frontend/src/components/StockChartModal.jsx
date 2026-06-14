import { useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import styles from './StockChartModal.module.css';

const COMPANY_NAMES = {
  GOOG: 'Alphabet Inc.',
  TSLA: 'Tesla, Inc.',
  AMZN: 'Amazon.com, Inc.',
  META: 'Meta Platforms',
  NVDA: 'NVIDIA Corp.',
};

// Custom tooltip bubble
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTime}>{label}</p>
      <p className={styles.tooltipPrice}>${payload[0].value.toFixed(2)}</p>
    </div>
  );
}

export default function StockChartModal({ ticker, history, data, onClose, onTrade }) {
  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const price     = data?.price     ?? 0;
  const change    = data?.change    ?? 0;
  const changePct = data?.changePct ?? 0;
  const isUp      = change >= 0;
  const color     = isUp ? '#3fb950' : '#f85149';

  // First price in history window (for reference line)
  const openPrice = history.length > 0 ? history[0].price : price;

  // Min / max for domain padding
  const prices   = history.map((d) => d.price);
  const minPrice = prices.length ? Math.min(...prices) : price * 0.99;
  const maxPrice = prices.length ? Math.max(...prices) : price * 1.01;
  const pad      = (maxPrice - minPrice) * 0.15 || price * 0.005;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true">

        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            <span className={styles.ticker}>{ticker}</span>
            <span className={styles.company}>{COMPANY_NAMES[ticker]}</span>
          </div>

          <div className={styles.priceBlock}>
            <span className={styles.price}>${price.toFixed(2)}</span>
            <span className={`${styles.change} ${isUp ? styles.up : styles.down}`}>
              {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{change.toFixed(2)} ({isUp ? '+' : ''}{changePct.toFixed(3)}%)
            </span>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.tradeBtn} onClick={() => { onClose(); onTrade(ticker); }}>
              Trade
            </button>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
          </div>
        </div>

        {/* ── Chart ── */}
        <div className={styles.chartWrap}>
          {history.length < 2 ? (
            <div className={styles.noData}>Waiting for data…</div>
          ) : (
            <ResponsiveContainer width="100%" height={340}>
              <AreaChart data={history} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={color} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={color} stopOpacity={0}   />
                  </linearGradient>
                </defs>

                <CartesianGrid stroke="#30363d" strokeDasharray="4 4" vertical={false} />

                <XAxis
                  dataKey="time"
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />

                <YAxis
                  domain={[minPrice - pad, maxPrice + pad]}
                  tick={{ fill: '#8b949e', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v.toFixed(0)}`}
                  width={60}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Dashed open-price reference line */}
                <ReferenceLine
                  y={openPrice}
                  stroke="#58a6ff"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />

                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={color}
                  strokeWidth={2}
                  fill="url(#chartGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Stats bar ── */}
        <div className={styles.stats}>
          {[
            { label: 'Open (window)', value: `$${openPrice.toFixed(2)}` },
            { label: 'High',  value: `$${maxPrice.toFixed(2)}` },
            { label: 'Low',   value: `$${minPrice.toFixed(2)}` },
            { label: 'Last',  value: `$${price.toFixed(2)}` },
            { label: 'Data points', value: history.length },
          ].map((s) => (
            <div className={styles.statItem} key={s.label}>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statValue}>{s.value}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
