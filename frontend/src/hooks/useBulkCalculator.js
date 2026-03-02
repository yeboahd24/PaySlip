import { useState, useCallback } from 'react';
import { calculateBulk } from '../api/client';

const emptyEmployee = () => ({
  id: Date.now() + Math.random(),
  name: '',
  basic_salary: '',
  is_non_resident: false,
});

export function useBulkCalculator() {
  const [employees, setEmployees] = useState([emptyEmployee(), emptyEmployee()]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addEmployee = useCallback(() => {
    setEmployees((prev) => {
      if (prev.length >= 50) return prev;
      return [...prev, emptyEmployee()];
    });
  }, []);

  const removeEmployee = useCallback((id) => {
    setEmployees((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((e) => e.id !== id);
    });
  }, []);

  const updateEmployee = useCallback((id, field, value) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  }, []);

  const calculate = useCallback(async () => {
    const valid = employees.filter((e) => parseFloat(e.basic_salary) > 0);
    if (valid.length === 0) {
      setError('Add at least one employee with a salary');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload = {
        employees: valid.map((e) => ({
          basic_salary: parseFloat(e.basic_salary),
          is_non_resident: e.is_non_resident,
        })),
      };
      const data = await calculateBulk(payload);
      // Attach names for display
      data.employeeNames = valid.map((e) => e.name || `Employee ${valid.indexOf(e) + 1}`);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Bulk calculation failed');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [employees]);

  return { employees, result, loading, error, addEmployee, removeEmployee, updateEmployee, calculate };
}
