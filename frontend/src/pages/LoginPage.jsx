import { useState } from 'react';
import { login } from '../api/auth';
import styles from './AuthPage.module.css';

export default function LoginPage({ onLogin, onGoRegister }) {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>

        <div className={styles.logo}>
          <span className={styles.logoIcon}>📈</span>
          <h1 className={styles.logoText}>StockPulse</h1>
        </div>
        <p className={styles.subtitle}>Sign in to your account</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}><span>demo accounts</span></div>
        <div className={styles.demos}>
          <button className={styles.demoBtn} onClick={() => { setEmail('alice@demo.com'); setPassword('alice123'); }}>
            alice@demo.com
          </button>
          <button className={styles.demoBtn} onClick={() => { setEmail('bob@demo.com'); setPassword('bob123'); }}>
            bob@demo.com
          </button>
        </div>

        <p className={styles.switch}>
          Don't have an account?{' '}
          <button className={styles.switchLink} onClick={onGoRegister}>
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
