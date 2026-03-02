import { formatCurrency } from '../../utils/formatCurrency';
import Tooltip from '../Tooltip';

export default function YearComparisonCard({ yearComparison }) {
  if (!yearComparison) return null;

  const { previous_year, previous_tax, current_tax, difference } = yearComparison;
  const increased = difference > 0;
  const decreased = difference < 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        <Tooltip text={`Compares your PAYE tax under the current year's bands vs ${previous_year} bands. This helps you understand how Ghana's annual budget changes affected your take-home pay.`}>
          Year-over-Year Comparison
        </Tooltip>
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{previous_year} PAYE</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(previous_tax)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Current PAYE</span>
          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(current_tax)}</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-gray-100">
          <span>Difference</span>
          <span className={increased ? 'text-ghana-red' : decreased ? 'text-ghana-green' : 'text-gray-600 dark:text-gray-400'}>
            {increased ? '+' : ''}{formatCurrency(difference)}/mo
          </span>
        </div>
        {difference !== 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {increased
              ? `Your monthly tax increased by ${formatCurrency(Math.abs(difference))} compared to ${previous_year}.`
              : `Your monthly tax decreased by ${formatCurrency(Math.abs(difference))} compared to ${previous_year}.`}
          </p>
        )}
      </div>
    </div>
  );
}
