const BASE = '/api/trade';

export async function getPortfolio(email) {
  const res = await fetch(`${BASE}/portfolio?email=${encodeURIComponent(email)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch portfolio.');
  return data; // { balance, portfolio, trades }
}

export async function buyStock(email, ticker, shares) {
  const res = await fetch(`${BASE}/buy`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ticker, shares }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Buy order failed.');
  return data; // { message, balance, portfolio, trade }
}

export async function sellStock(email, ticker, shares) {
  const res = await fetch(`${BASE}/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, ticker, shares }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Sell order failed.');
  return data; // { message, balance, portfolio, trade }
}
