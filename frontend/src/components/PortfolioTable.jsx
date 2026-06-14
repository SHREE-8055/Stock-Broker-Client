import styles from './PortfolioTable.module.css';

export default function PortfolioTable({ portfolio, onTrade, onChart }) {
  if (!portfolio || portfolio.length === 0) {
    return (
      <div className={styles.empty}>
        <span>💼</span>
        <p>No holdings yet. Buy some stocks to build your portfolio.</p>
      </div>
    );
  }

  const totalValue = portfolio.reduce((sum, h) => sum + h.marketValue, 0);
  const totalPnl   = portfolio.reduce((sum, h) => sum + h.pnl, 0);

  return (
    <div className={styles.wrapper}>
      {/* Summary bar */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Portfolio Value</span>
          <span className={styles.summaryValue}>${totalValue.toFixed(2)}</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>Total P&amp;L</span>
          <span className={`${styles.summaryValue} ${totalPnl >= 0 ? styles.green : styles.red}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Holdings table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Shares</th>
              <th>Avg Cost</th>
              <th>Mkt Price</th>
              <th>Mkt Value</th>
              <th>P&amp;L</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map((h) => (
              <tr key={h.ticker}>
                <td>
                  <span className={styles.tickerCell}>{h.ticker}</span>
                </td>
                <td>{h.shares.toFixed(h.shares % 1 === 0 ? 0 : 4)}</td>
                <td>${h.avgCost.toFixed(2)}</td>
                <td>${h.currentPrice.toFixed(2)}</td>
                <td>${h.marketValue.toFixed(2)}</td>
                <td>
                  <span className={h.pnl >= 0 ? styles.green : styles.red}>
                    {h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)}
                    <small> ({h.pnl >= 0 ? '+' : ''}{h.pnlPct.toFixed(2)}%)</small>
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button
                      className={styles.chartBtn}
                      onClick={() => onChart && onChart(h.ticker)}
                      title="View chart"
                    >
                      📈
                    </button>
                    <button
                      className={styles.tradeBtn}
                      onClick={() => onTrade(h.ticker)}
                    >
                      Trade
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
