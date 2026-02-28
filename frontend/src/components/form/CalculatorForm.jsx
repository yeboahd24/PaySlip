import { useState } from 'react';
import SalaryInput from './SalaryInput';
import AllowanceList from './AllowanceList';
import ReliefSelector from './ReliefSelector';

const initialReliefs = { marriage: false, children: 0, disability: false, old_age: false };

export default function CalculatorForm({ onSubmit, loading }) {
  const [salary, setSalary] = useState('');
  const [allowances, setAllowances] = useState([]);
  const [reliefs, setReliefs] = useState(initialReliefs);

  function handleSubmit(e) {
    e.preventDefault();

    const basicSalary = parseFloat(salary);
    if (!basicSalary || basicSalary <= 0) return;

    // Filter out empty/incomplete allowances
    const validAllowances = allowances
      .filter((a) => a.name.trim() && parseFloat(a.amount) > 0)
      .map((a) => ({
        name: a.name.trim(),
        amount: parseFloat(a.amount),
        taxable: a.taxable,
      }));

    onSubmit({
      basic_salary: basicSalary,
      allowances: validAllowances,
      reliefs,
    });
  }

  const isValid = parseFloat(salary) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <SalaryInput value={salary} onChange={setSalary} />
      <AllowanceList allowances={allowances} onChange={setAllowances} />
      <ReliefSelector reliefs={reliefs} onChange={setReliefs} />

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-ghana-green hover:bg-ghana-green-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Calculating...
          </span>
        ) : (
          'Calculate Take-Home Pay'
        )}
      </button>
    </form>
  );
}
