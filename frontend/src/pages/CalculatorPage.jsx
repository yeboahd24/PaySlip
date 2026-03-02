import { useState } from 'react';
import CalculatorForm from '../components/form/CalculatorForm';
import ResultsPanel from '../components/results/ResultsPanel';
import { useCalculator } from '../hooks/useCalculator';
import { encodeStateToURL, copyToClipboard } from '../utils/urlShare';
import { generatePayslipPDF } from '../utils/generatePayslipPDF';
import { generateCSV } from '../utils/generateCSV';
import { generateExcel } from '../utils/generateExcel';

export default function CalculatorPage() {
  const { result, loading, error, calculate, debouncedCalculate, mode, setMode } = useCalculator();
  const [shareMsg, setShareMsg] = useState('');
  const [period, setPeriod] = useState('monthly');
  const [exportOpen, setExportOpen] = useState(false);

  function handleShare() {
    const url = encodeStateToURL({ mode });
    copyToClipboard(url).then((ok) => {
      setShareMsg(ok ? 'Link copied!' : 'Could not copy');
      setTimeout(() => setShareMsg(''), 2000);
    });
  }

  function handleWhatsAppShare() {
    const url = encodeStateToURL({ mode });
    let text = 'Check out my Ghana salary breakdown:';
    if (result) {
      const s = result.summary;
      text = `My Ghana salary breakdown:\nGross: GHS ${s.gross_income.toLocaleString()}\nDeductions: GHS ${s.total_deductions.toLocaleString()}\nTake-Home: GHS ${s.net_take_home.toLocaleString()}\n\nCalculate yours:`;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank');
  }

  return (
    <>
      {/* Action buttons */}
      {result && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="flex rounded-md border border-gray-300 dark:border-gray-600 overflow-hidden text-xs">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-2.5 py-1.5 font-medium transition ${
                period === 'monthly'
                  ? 'bg-ghana-green text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('annual')}
              className={`px-2.5 py-1.5 font-medium transition ${
                period === 'annual'
                  ? 'bg-ghana-green text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300'
              }`}
            >
              Annual
            </button>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {shareMsg || 'Share'}
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-green-500 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {exportOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => { generatePayslipPDF(result); setExportOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  PDF
                </button>
                <button
                  onClick={() => { generateCSV(result); setExportOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  CSV
                </button>
                <button
                  onClick={() => { generateExcel(result); setExportOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Salary Details</h2>
          <CalculatorForm
            onSubmit={calculate}
            debouncedCalculate={debouncedCalculate}
            loading={loading}
            mode={mode}
            onModeChange={setMode}
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Pay Breakdown</h2>
          <ResultsPanel result={result} mode={mode} period={period} />
        </div>
      </div>
    </>
  );
}
