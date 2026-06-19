// Helper for API and WebSocket base URLs. Respects Vite env vars when set.
const API_BASE = import.meta.env.VITE_API_BASE || '';
const WS_BASE  = import.meta.env.VITE_WS_BASE || '';

function getApi(path) {
  // Ensure path starts with '/'
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

function resolveWs() {
  if (WS_BASE) return WS_BASE;
  if (API_BASE) {
    try {
      const url = new URL(API_BASE);
      const proto = url.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${proto}//${url.host}`;
    } catch {
      // fallthrough
    }
  }
  return `ws://${window.location.hostname}:5000`;
}

const WS_URL = resolveWs();

export { API_BASE, getApi, WS_URL };
