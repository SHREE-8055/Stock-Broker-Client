import { useState } from 'react';
import styles from './SubscribePanel.module.css';

const COMPANY_NAMES = {
  GOOG: 'Alphabet Inc.',
  TSLA: 'Tesla, Inc.',
  AMZN: 'Amazon.com, Inc.',
  META: 'Meta Platforms',
  NVDA: 'NVIDIA Corp.',
};

export default function SubscribePanel({ available, onSubscribe }) {
  const [loading, setLoading] = useState(null); // ticker being subscribed

  const handleClick = async (ticker) => {
    setLoading(ticker);
    await onSubscribe(ticker);
    setLoading(null);
  };

  if (available.length === 0) {
    return (
      <div className={styles.allSubscribed}>
        ✅ You're watching all supported stocks.
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      {available.map(({ ticker }) => (
        <button
          key={ticker}
          className={styles.stockBtn}
          onClick={() => handleClick(ticker)}
          disabled={loading === ticker}
          aria-label={`Subscribe to ${ticker}`}
        >
          <span className={styles.ticker}>{ticker}</span>
          <span className={styles.name}>{COMPANY_NAMES[ticker]}</span>
          <span className={styles.addIcon}>{loading === ticker ? '…' : '+'}</span>
        </button>
      ))}
    </div>
  );
}
