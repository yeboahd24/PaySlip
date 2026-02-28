import { useState } from 'react';
import { apiPost } from '../api/client';

export function useCalculator() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function calculate(payload) {
    setLoading(true);
    setError(null);
    try {
      const data = await apiPost('/api/v1/calculate', payload);
      setResult(data);
    } catch (err) {
      // Extract validation error messages from 422 responses
      if (err.status === 422 && err.data?.detail) {
        const messages = Array.isArray(err.data.detail)
          ? err.data.detail.map((d) => d.msg).join('. ')
          : String(err.data.detail);
        setError(messages);
      } else {
        setError(err.message || 'Something went wrong');
      }
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return { result, loading, error, calculate };
}
