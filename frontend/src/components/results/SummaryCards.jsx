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
        colorClass="bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
      />
      <Card
        label="Total Deductions"
        amount={summary.total_deductions}
        colorClass="bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
      />
      <Card
        label="Net Take-Home"
        amount={summary.net_take_home}
        colorClass="bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
      />
    </div>
  );
}
