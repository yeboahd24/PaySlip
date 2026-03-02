import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { calculateForward } from '../api/client';
import ResultsPanel from '../components/results/ResultsPanel';

const NEARBY_OFFSETS = [-2000, -1000, -500, 500, 1000, 2000];

export default function SalaryPage() {
  const { amount } = useParams();
  const salary = parseFloat(amount);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!salary || salary <= 0 || salary > 1000000) {
      setError('Invalid salary amount');
      return;
    }

    // Set page meta
    document.title = `GHS ${salary.toLocaleString()} Salary Breakdown | Ghana Take-Home Pay Calculator`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `See the full take-home pay breakdown for a GHS ${salary.toLocaleString()} monthly salary in Ghana. PAYE tax, SSNIT, Tier 2 pension and net pay calculated instantly.`);
    }

    calculateForward({ basic_salary: salary })
      .then((data) => {
        setResult(data);
        setError(null);
      })
      .catch(() => {
        setError('Failed to calculate. Please try again.');
      });

    return () => {
      document.title = 'Ghana Take-Home Pay Calculator | PAYE, SSNIT & Pension';
    };
  }, [salary]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Invalid Salary</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <Link to="/salary" className="text-ghana-green hover:underline">Browse common salary levels</Link>
      </div>
    );
  }

  const nearbySalaries = NEARBY_OFFSETS
    .map((offset) => salary + offset)
    .filter((s) => s > 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        GHS {salary?.toLocaleString()} Monthly Salary Breakdown
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Full PAYE tax, SSNIT, Tier 2 pension, and net take-home pay for a GHS {salary?.toLocaleString()} salary in Ghana.
      </p>

      <ResultsPanel result={result} mode="forward" period="monthly" />

      {/* Nearby salaries */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Compare Nearby Salaries</h2>
        <div className="flex flex-wrap gap-2">
          {nearbySalaries.map((s) => (
            <Link
              key={s}
              to={`/salary/${s}`}
              className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-ghana-green hover:text-white transition"
            >
              GHS {s.toLocaleString()}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link to="/salary" className="text-sm text-ghana-green hover:underline">View all salary levels</Link>
        <span className="mx-2 text-gray-300">|</span>
        <Link to="/" className="text-sm text-ghana-green hover:underline">Custom calculator</Link>
      </div>
    </div>
  );
}
