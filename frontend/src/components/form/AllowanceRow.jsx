export default function AllowanceRow({ allowance, onChange, onRemove }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        placeholder="Name"
        value={allowance.name}
        onChange={(e) => onChange({ ...allowance, name: e.target.value })}
        className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-ghana-green focus:border-ghana-green outline-none dark:bg-gray-700 dark:text-white"
      />
      <input
        type="number"
        min="0"
        step="0.01"
        placeholder="Amount"
        value={allowance.amount}
        onChange={(e) => onChange({ ...allowance, amount: e.target.value })}
        className="w-28 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-ghana-green focus:border-ghana-green outline-none dark:bg-gray-700 dark:text-white"
      />
      <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap cursor-pointer">
        <input
          type="checkbox"
          checked={allowance.taxable}
          onChange={(e) => onChange({ ...allowance, taxable: e.target.checked })}
          className="accent-ghana-green"
        />
        Taxable
      </label>
      <button
        type="button"
        onClick={onRemove}
        className="text-ghana-red hover:text-red-700 text-lg font-bold leading-none px-1"
        aria-label="Remove allowance"
      >
        &times;
      </button>
    </div>
  );
}
