import { formatCurrency, formatRate } from '../../utils/formatCurrency';
import Tooltip from '../Tooltip';

function Row({ label, rate, amount, basis, tooltip }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {tooltip ? <Tooltip text={tooltip}>{label}</Tooltip> : label}
        </span>
        <span className="text-xs text-gray-400 ml-2">({formatRate(rate)} of {basis})</span>
      </div>
      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(amount)}</span>
    </div>
  );
}

export default function DeductionDetails({ deductions }) {
  const { ssnit, tier2_pension, tier3_pension, paye } = deductions;

  const total = ssnit.amount + tier2_pension.amount + (tier3_pension?.amount || 0) + paye.total_tax;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Deduction Breakdown</h3>
      <Row
        label="SSNIT"
        rate={ssnit.rate}
        amount={ssnit.amount}
        basis={ssnit.basis}
        tooltip="Social Security & National Insurance Trust (Tier 1). This 5.5% employee contribution goes towards your pension fund. Your employer also contributes 13% on top of this."
      />
      <Row
        label="Tier 2 Pension"
        rate={tier2_pension.rate}
        amount={tier2_pension.amount}
        basis={tier2_pension.basis}
        tooltip="Mandatory Occupational Pension Scheme. This 5% goes to a private pension fund of your choice, managed independently from SSNIT."
      />
      {tier3_pension && (
        <Row
          label="Tier 3 Pension"
          rate={tier3_pension.rate}
          amount={tier3_pension.amount}
          basis={tier3_pension.basis}
          tooltip="Voluntary Provident Fund. Your contributions are tax-deductible (up to 16.5% of gross salary), reducing your PAYE. Funds are managed by licensed trustees."
        />
      )}
      <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <Tooltip text="Pay As You Earn — income tax calculated on your chargeable income using progressive GRA tax bands. The more you earn, the higher the rate on the additional income (0% to 35%).">
              PAYE (Income Tax)
            </Tooltip>
          </span>
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(paye.total_tax)}</span>
      </div>
      <div className="flex items-center justify-between pt-2 mt-1">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Total Deductions</span>
        <span className="text-sm font-bold text-ghana-red">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
