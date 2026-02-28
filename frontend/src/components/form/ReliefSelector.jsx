export default function ReliefSelector({ reliefs, onChange }) {
  function update(field, value) {
    onChange({ ...reliefs, [field]: value });
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Additional Reliefs
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
          <span className="text-sm">Marriage Relief</span>
          <span className="text-xs text-gray-400 ml-auto">GHS 100/mo</span>
        </label>

        {/* Children */}
        <div className="flex items-center gap-2">
          <span className="text-sm">Children (education)</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => update('children', Math.max(0, reliefs.children - 1))}
              disabled={reliefs.children === 0}
              className="w-7 h-7 rounded border border-gray-300 text-sm font-bold disabled:opacity-30 hover:bg-gray-100"
            >
              &minus;
            </button>
            <span className="w-6 text-center text-sm font-medium">{reliefs.children}</span>
            <button
              type="button"
              onClick={() => update('children', Math.min(3, reliefs.children + 1))}
              disabled={reliefs.children === 3}
              className="w-7 h-7 rounded border border-gray-300 text-sm font-bold disabled:opacity-30 hover:bg-gray-100"
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
          <span className="text-sm">Disability Relief</span>
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
          <span className="text-sm">Old Age Relief (60+)</span>
          <span className="text-xs text-gray-400 ml-auto">GHS 125/mo</span>
        </label>
      </div>
    </div>
  );
}
