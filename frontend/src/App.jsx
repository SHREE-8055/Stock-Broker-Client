import { useState } from 'react';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  // 'login' | 'register' | 'dashboard'
  const [page, setPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin    = (userData) => { setUser(userData); setPage('dashboard'); };
  const handleLogout   = () => { setUser(null); setPage('login'); };

  if (page === 'dashboard' && user) {
    return <DashboardPage user={user} onLogout={handleLogout} onUserUpdate={setUser} />;
  }
  if (page === 'register') {
    return <RegisterPage onRegistered={handleLogin} onGoLogin={() => setPage('login')} />;
  }
  return <LoginPage onLogin={handleLogin} onGoRegister={() => setPage('register')} />;
}
