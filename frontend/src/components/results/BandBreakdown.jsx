import { formatCurrency, formatRate } from '../../utils/formatCurrency';

export default function BandBreakdown({ paye }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">PAYE Band Breakdown</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Chargeable Income: {formatCurrency(paye.chargeable_income)}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 font-medium">Band</th>
              <th className="pb-2 font-medium text-right">Income in Band</th>
              <th className="pb-2 font-medium text-right">Rate</th>
              <th className="pb-2 font-medium text-right">Tax</th>
            </tr>
          </thead>
          <tbody>
            {paye.band_breakdown.map((band, i) => (
              <tr
                key={band.band}
                className={`border-b border-gray-50 dark:border-gray-700 ${i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-700/50' : ''}`}
              >
                <td className="py-1.5 text-gray-900 dark:text-gray-100">{band.band}</td>
                <td className="py-1.5 text-right text-gray-900 dark:text-gray-100">{formatCurrency(band.income_in_band)}</td>
                <td className="py-1.5 text-right text-gray-900 dark:text-gray-100">{formatRate(band.rate)}</td>
                <td className="py-1.5 text-right font-medium text-gray-900 dark:text-gray-100">{formatCurrency(band.tax)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-gray-300 dark:border-gray-600 font-bold text-gray-900 dark:text-gray-100">
              <td className="pt-2" colSpan={3}>Total PAYE</td>
              <td className="pt-2 text-right">{formatCurrency(paye.total_tax)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
