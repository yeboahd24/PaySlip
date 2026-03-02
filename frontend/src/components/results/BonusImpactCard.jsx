import { formatCurrency, formatRate } from '../../utils/formatCurrency';
import Tooltip from '../Tooltip';

export default function BonusImpactCard({ bonusImpact }) {
  if (!bonusImpact) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-800 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        <Tooltip text="This shows how much of your bonus you actually take home. The effective tax rate on the bonus depends on which tax band your income falls into. Higher earners pay more tax on bonuses.">
          Bonus / Overtime Impact
        </Tooltip>
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Bonus Amount</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(bonusImpact.bonus_amount)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tax on Bonus</span>
          <span className="font-medium text-ghana-red">{formatCurrency(bonusImpact.tax_on_bonus)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Effective Rate on Bonus</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatRate(bonusImpact.effective_rate)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-amber-200 dark:border-amber-800 text-sm font-bold text-gray-900 dark:text-gray-100">
          <span>You Keep</span>
          <span className="text-ghana-green">{formatCurrency(bonusImpact.net_bonus)}</span>
        </div>
      </div>
    </div>
  );
}
