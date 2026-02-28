import { formatCurrency, formatRate } from '../../utils/formatCurrency';

function Row({ label, rate, amount, basis }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400 ml-2">({formatRate(rate)} of {basis})</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
    </div>
  );
}

export default function DeductionDetails({ deductions }) {
  const { ssnit, tier2_pension, paye } = deductions;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Deduction Breakdown</h3>
      <Row label="SSNIT" rate={ssnit.rate} amount={ssnit.amount} basis={ssnit.basis} />
      <Row label="Tier 2 Pension" rate={tier2_pension.rate} amount={tier2_pension.amount} basis={tier2_pension.basis} />
      <div className="flex items-center justify-between py-2 border-b border-gray-100">
        <div>
          <span className="text-sm font-medium text-gray-700">PAYE (Income Tax)</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{formatCurrency(paye.total_tax)}</span>
      </div>
      <div className="flex items-center justify-between pt-2 mt-1">
        <span className="text-sm font-bold text-gray-900">Total Deductions</span>
        <span className="text-sm font-bold text-ghana-red">
          {formatCurrency(ssnit.amount + tier2_pension.amount + paye.total_tax)}
        </span>
      </div>
    </div>
  );
}
