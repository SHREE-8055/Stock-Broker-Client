import styles from './Navbar.module.css';

export default function Navbar({ user, balance, wsStatus, onLogout }) {
  const statusLabel = {
    connecting:   'Connecting…',
    connected:    'Live',
    disconnected: 'Reconnecting…',
  }[wsStatus] ?? wsStatus;

  return (
    <nav className={styles.nav}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.brandIcon}>📈</span>
        <span className={styles.brandName}>StockPulse</span>
      </div>

      {/* Center: WS status */}
      <div className={styles.center}>
        <span className={`${styles.statusDot} ${styles[wsStatus]}`} />
        <span className={styles.statusLabel}>{statusLabel}</span>
      </div>

      {/* Right: balance + user + logout */}
      <div className={styles.right}>
        <div className={styles.balance}>
          <span className={styles.balanceLabel}>Cash</span>
          <span className={styles.balanceValue}>${(balance ?? 0).toFixed(2)}</span>
        </div>

        <div className={styles.userInfo}>
          <span className={styles.avatar}>{user.name.charAt(0).toUpperCase()}</span>
          <span className={styles.userName}>{user.name}</span>
        </div>

        <button className={styles.logoutBtn} onClick={onLogout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
