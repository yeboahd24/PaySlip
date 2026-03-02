import Tooltip from '../Tooltip';

export default function SalaryInput({ value, onChange }) {
  return (
    <div>
      <label htmlFor="basic-salary" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        <Tooltip text="Your basic salary before allowances. SSNIT (5.5%) and Tier 2 pension (5%) are calculated on this amount only — not on allowances.">
          Basic Salary (Monthly)
        </Tooltip>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm">
          GHS
        </span>
        <input
          id="basic-salary"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-14 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-ghana-green outline-none transition dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );
}
