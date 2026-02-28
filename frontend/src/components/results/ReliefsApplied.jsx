import { formatCurrency } from '../../utils/formatCurrency';

const LABELS = {
  personal_relief: 'Personal Relief',
  marriage_relief: 'Marriage Relief',
  child_education_relief: 'Child Education Relief',
  disability_relief: 'Disability Relief',
  old_age_relief: 'Old Age Relief',
};

export default function ReliefsApplied({ reliefsApplied }) {
  const entries = Object.entries(reliefsApplied).filter(([, v]) => v > 0);

  if (entries.length === 0) return null;

  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Reliefs Applied</h3>
      <div className="space-y-1">
        {entries.map(([key, amount]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-gray-600">{LABELS[key] || key}</span>
            <span className="font-medium">{formatCurrency(amount)}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-3 pt-2 border-t border-gray-200 text-sm font-bold">
        <span>Total Reliefs</span>
        <span className="text-ghana-green">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
