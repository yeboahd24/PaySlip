import ComparisonView from '../components/ComparisonView';

export default function ComparePage() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Compare Salary Packages</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter two basic salaries to compare take-home pay side by side.</p>
      <ComparisonView />
    </div>
  );
}
