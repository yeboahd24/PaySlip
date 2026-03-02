import Tooltip from '../Tooltip';

export default function ReliefSelector({ reliefs, onChange }) {
  function update(field, value) {
    onChange({ ...reliefs, [field]: value });
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <Tooltip text="Tax reliefs reduce your chargeable income before PAYE is calculated. Personal relief (GHS 365/mo) is applied automatically. These are additional reliefs you may qualify for.">
          Additional Reliefs
        </Tooltip>
      </label>
      <div className="space-y-3">
        {/* Marriage */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={reliefs.marriage}
            onChange={(e) => update('marriage', e.target.checked)}
            className="accent-ghana-green"
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">Marriage Relief</span>
          <span className="text-xs text-gray-400 ml-auto">GHS 100/mo</span>
        </label>

        {/* Children */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-900 dark:text-gray-100">Children (education)</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => update('children', Math.max(0, reliefs.children - 1))}
              disabled={reliefs.children === 0}
              className="w-7 h-7 rounded border border-gray-300 dark:border-gray-600 text-sm font-bold disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
            >
              &minus;
            </button>
            <span className="w-6 text-center text-sm font-medium text-gray-900 dark:text-gray-100">{reliefs.children}</span>
            <button
              type="button"
              onClick={() => update('children', Math.min(3, reliefs.children + 1))}
              disabled={reliefs.children === 3}
              className="w-7 h-7 rounded border border-gray-300 dark:border-gray-600 text-sm font-bold disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100"
            >
              +
            </button>
            <span className="text-xs text-gray-400">GHS 50/child/mo</span>
          </div>
        </div>

        {/* Disability */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={reliefs.disability}
            onChange={(e) => update('disability', e.target.checked)}
            className="accent-ghana-green"
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">Disability Relief</span>
          <span className="text-xs text-gray-400 ml-auto">25% of chargeable</span>
        </label>

        {/* Old Age */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={reliefs.old_age}
            onChange={(e) => update('old_age', e.target.checked)}
            className="accent-ghana-green"
          />
          <span className="text-sm text-gray-900 dark:text-gray-100">Old Age Relief (60+)</span>
          <span className="text-xs text-gray-400 ml-auto">GHS 125/mo</span>
        </label>
      </div>
    </div>
  );
}
