const BASE_URL = import.meta.env.VITE_API_URL || '';

export async function apiPost(path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const err = new Error(data?.detail || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return res.json();
}

export async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`);

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return res.json();
}

export function calculateForward(payload) {
  return apiPost('/api/v1/calculate', payload);
}

export function calculateReverse(payload) {
  return apiPost('/api/v1/reverse-calculate', payload);
}

export function calculateBulk(payload) {
  return apiPost('/api/v1/calculate-bulk', payload);
}
