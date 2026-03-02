import BulkCalculator from '../components/BulkCalculator';

export default function BulkPage() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Bulk Payroll Calculator</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Calculate take-home pay for up to 50 employees at once.</p>
      <BulkCalculator />
    </div>
  );
}
