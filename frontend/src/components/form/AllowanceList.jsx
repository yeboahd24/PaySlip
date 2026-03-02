import AllowanceRow from './AllowanceRow';

const emptyAllowance = () => ({ name: '', amount: '', taxable: true });

export default function AllowanceList({ allowances, onChange }) {
  function updateRow(index, updated) {
    const next = [...allowances];
    next[index] = updated;
    onChange(next);
  }

  function removeRow(index) {
    onChange(allowances.filter((_, i) => i !== index));
  }

  function addRow() {
    onChange([...allowances, emptyAllowance()]);
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Allowances
      </label>
      <div className="space-y-2">
        {allowances.map((a, i) => (
          <AllowanceRow
            key={i}
            allowance={a}
            onChange={(updated) => updateRow(i, updated)}
            onRemove={() => removeRow(i)}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2 text-sm text-ghana-green hover:text-ghana-green-light font-medium"
      >
        + Add Allowance
      </button>
    </div>
  );
}
