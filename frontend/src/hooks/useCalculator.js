import { useState, useRef, useCallback, useEffect } from 'react';
import { calculateForward, calculateReverse } from '../api/client';

export function useCalculator() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('forward'); // 'forward' | 'reverse'
  const debounceRef = useRef(null);

  async function calculate(payload) {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (mode === 'reverse') {
        data = await calculateReverse(payload);
        // Reverse returns { required_basic_salary, result }
        setResult({ ...data.result, required_basic_salary: data.required_basic_salary });
      } else {
        data = await calculateForward(payload);
        setResult(data);
      }
    } catch (err) {
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

  const debouncedCalculate = useCallback(
    (payload) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        calculate(payload);
      }, 400);
    },
    [mode],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return { result, loading, error, calculate, debouncedCalculate, mode, setMode };
}
