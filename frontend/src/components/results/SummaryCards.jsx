import { formatCurrency } from '../../utils/formatCurrency';

function Card({ label, amount, colorClass }) {
  return (
    <div className={`rounded-lg p-4 ${colorClass}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-2xl font-bold mt-1">{formatCurrency(amount)}</p>
    </div>
  );
}

export default function SummaryCards({ summary }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card
        label="Gross Income"
        amount={summary.gross_income}
        colorClass="bg-green-50 text-green-800 border border-green-200"
      />
      <Card
        label="Total Deductions"
        amount={summary.total_deductions}
        colorClass="bg-red-50 text-red-800 border border-red-200"
      />
      <Card
        label="Net Take-Home"
        amount={summary.net_take_home}
        colorClass="bg-amber-50 text-amber-800 border border-amber-200"
      />
    </div>
  );
}
