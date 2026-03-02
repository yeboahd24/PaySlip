import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const SALARY_LEVELS = [
  1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000,
  6000, 7000, 8000, 9000, 10000, 12000, 15000, 20000,
  25000, 30000, 40000, 50000, 75000, 100000,
];

export default function SalaryIndexPage() {
  useEffect(() => {
    document.title = 'Ghana Salary Breakdown by Level | Take-Home Pay Calculator';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Browse take-home pay breakdowns for common salary levels in Ghana, from GHS 1,000 to GHS 100,000. See PAYE tax, SSNIT, and net pay for each.');
    }
    return () => {
      document.title = 'Ghana Take-Home Pay Calculator | PAYE, SSNIT & Pension';
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        Ghana Salary Breakdown by Level
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Select a salary level to see the full take-home pay breakdown including PAYE tax, SSNIT, and Tier 2 pension deductions.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {SALARY_LEVELS.map((salary) => (
          <Link
            key={salary}
            to={`/salary/${salary}`}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center hover:border-ghana-green hover:shadow-md transition group"
          >
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-ghana-green transition">
              GHS {salary.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">per month</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link to="/" className="text-sm text-ghana-green hover:underline">Use custom calculator</Link>
      </div>
    </div>
  );
}
