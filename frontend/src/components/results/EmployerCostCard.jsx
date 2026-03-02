import { formatCurrency, formatRate } from '../../utils/formatCurrency';
import Tooltip from '../Tooltip';

export default function EmployerCostCard({ employerCost }) {
  if (!employerCost) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
        <Tooltip text="This is what your employer actually pays for your position. It includes your gross salary plus the employer's mandatory SSNIT contribution (13% of basic salary). Useful for salary negotiations and HR budgeting.">
          Employer Cost
        </Tooltip>
      </h3>
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Employer SSNIT</span>
          <span className="text-xs text-gray-400 ml-2">
            ({formatRate(employerCost.employer_ssnit.rate)} of {employerCost.employer_ssnit.basis.toLowerCase()})
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {formatCurrency(employerCost.employer_ssnit.amount)}
        </span>
      </div>
      <div className="flex items-center justify-between pt-2 mt-1">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Total Cost to Employer</span>
        <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
          {formatCurrency(employerCost.total_cost_to_employer)}
        </span>
      </div>
    </div>
  );
}
