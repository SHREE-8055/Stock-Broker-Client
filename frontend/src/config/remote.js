// Helper for API and WebSocket base URLs. Respects Vite env vars when set.
// NOTE: In production you should set `VITE_API_BASE` and `VITE_WS_BASE`
// in your hosting provider (e.g. Vercel). A fallback is provided here
// to help quick fixes when those env vars are missing.
const FALLBACK_API = 'https://stock-broker-client-1-0hff.onrender.com';
const FALLBACK_WS  = 'wss://stock-broker-client-1-0hff.onrender.com';

const API_BASE = import.meta.env.VITE_API_BASE || FALLBACK_API;
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
  return FALLBACK_WS;
}

const WS_URL = resolveWs();

export { API_BASE, getApi, WS_URL };
