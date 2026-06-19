import { getApi } from '../config/remote';

const BASE = getApi('/api/stocks');

export async function getSupportedStocks() {
  const res = await fetch(BASE);
  const data = await res.json();
  if (!res.ok) throw new Error('Failed to fetch stocks.');
  return data; // [{ ticker, price }]
}

export async function subscribe(email, ticker) {
  const res = await fetch(`${BASE}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ticker }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Subscribe failed.');
  return data; // { subscriptions }
}

export async function unsubscribe(email, ticker) {
  const res = await fetch(`${BASE}/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ticker }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Unsubscribe failed.');
  return data; // { subscriptions }
}
