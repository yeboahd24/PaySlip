import { useState, useEffect } from 'react';

const CACHE_KEY = 'currency_rates_ghs';
const CACHE_TTL = 60 * 60 * 1000; // 1 hour
const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'GBP', 'NGN', 'XOF'];

export function useCurrencyRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check sessionStorage cache
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_TTL) {
          setRates(parsed.rates);
          return;
        }
      }
    } catch {
      // ignore cache errors
    }

    setLoading(true);
    fetch('https://open.er-api.com/v6/latest/GHS')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch rates');
        return res.json();
      })
      .then((data) => {
        if (data.result !== 'success') throw new Error('API error');
        const filtered = {};
        for (const code of SUPPORTED_CURRENCIES) {
          if (data.rates[code]) {
            filtered[code] = data.rates[code];
          }
        }
        setRates(filtered);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rates: filtered, timestamp: Date.now() }));
        } catch {
          // ignore storage errors
        }
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { rates, loading, error, supportedCurrencies: SUPPORTED_CURRENCIES };
}
