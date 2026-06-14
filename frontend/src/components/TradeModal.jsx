import { useState, useEffect } from 'react';
import { buyStock, sellStock } from '../api/trade';
import styles from './TradeModal.module.css';

const COMPANY_NAMES = {
  GOOG: 'Alphabet Inc.',
  TSLA: 'Tesla, Inc.',
  AMZN: 'Amazon.com, Inc.',
  META: 'Meta Platforms',
  NVDA: 'NVIDIA Corp.',
};

export default function TradeModal({ ticker, price, balance, ownedShares, email, onClose, onTradeComplete }) {
  const [tab,     setTab]     = useState('buy'); // 'buy' | 'sell'
  const [shares,  setShares]  = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const qty       = parseFloat(shares) || 0;
  const total     = qty * price;
  const maxBuy    = price > 0 ? Math.floor(balance / price) : 0;
  const canBuy    = qty > 0 && total <= balance;
  const canSell   = qty > 0 && qty <= ownedShares;

  const handleTrade = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const fn     = tab === 'buy' ? buyStock : sellStock;
      const result = await fn(email, ticker, qty);
      setSuccess(result.message);
      setShares('');
      onTradeComplete(result); // bubble up { balance, portfolio }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={`Trade ${ticker}`}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.ticker}>{ticker}</span>
            <span className={styles.company}>{COMPANY_NAMES[ticker]}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Price info */}
        <div className={styles.priceInfo}>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>Market Price</span>
            <span className={styles.infoValue}>${price.toFixed(2)}</span>
          </div>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>Cash Balance</span>
            <span className={styles.infoValue}>${balance.toFixed(2)}</span>
          </div>
          <div className={styles.infoBox}>
            <span className={styles.infoLabel}>You Own</span>
            <span className={styles.infoValue}>{ownedShares} shares</span>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'buy' ? styles.tabActive : ''}`}
            onClick={() => { setTab('buy'); setError(''); setSuccess(''); setShares(''); }}
          >
            Buy
          </button>
          <button
            className={`${styles.tab} ${tab === 'sell' ? styles.tabActive : ''}`}
            onClick={() => { setTab('sell'); setError(''); setSuccess(''); setShares(''); }}
            disabled={ownedShares <= 0}
          >
            Sell {ownedShares > 0 ? `(${ownedShares})` : '(none)'}
          </button>
        </div>

        {/* Order form */}
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="shares">
              Number of shares
              {tab === 'buy'  && <span className={styles.hint}>Max you can buy: {maxBuy}</span>}
              {tab === 'sell' && <span className={styles.hint}>Available: {ownedShares}</span>}
            </label>
            <input
              id="shares"
              className={styles.input}
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 5"
              value={shares}
              onChange={(e) => { setShares(e.target.value); setError(''); setSuccess(''); }}
            />
          </div>

          {/* Order summary */}
          {qty > 0 && (
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>{qty} × ${price.toFixed(2)}</span>
                <span className={styles.summaryTotal}>${total.toFixed(2)}</span>
              </div>
              {tab === 'buy' && (
                <div className={styles.summaryRow}>
                  <span>Balance after</span>
                  <span className={canBuy ? styles.green : styles.red}>
                    ${(balance - total).toFixed(2)}
                  </span>
                </div>
              )}
              {tab === 'sell' && (
                <div className={styles.summaryRow}>
                  <span>Balance after</span>
                  <span className={styles.green}>${(balance + total).toFixed(2)}</span>
                </div>
              )}
            </div>
          )}

          {error   && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.successMsg}>{success}</p>}

          <button
            className={`${styles.tradeBtn} ${tab === 'sell' ? styles.sellBtn : ''}`}
            onClick={handleTrade}
            disabled={loading || (tab === 'buy' ? !canBuy : !canSell)}
          >
            {loading
              ? 'Processing…'
              : tab === 'buy'
              ? `Buy ${qty > 0 ? qty : ''} Share${qty !== 1 ? 's' : ''}`
              : `Sell ${qty > 0 ? qty : ''} Share${qty !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
