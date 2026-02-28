import Header from './components/Header';
import Footer from './components/Footer';
import CalculatorForm from './components/form/CalculatorForm';
import ResultsPanel from './components/results/ResultsPanel';
import { useCalculator } from './hooks/useCalculator';

export default function App() {
  const { result, loading, error, calculate } = useCalculator();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Salary Details</h2>
            <CalculatorForm onSubmit={calculate} loading={loading} />
          </div>

          {/* Results */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pay Breakdown</h2>
            <ResultsPanel result={result} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
