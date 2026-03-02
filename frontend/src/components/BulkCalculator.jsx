import { useBulkCalculator } from '../hooks/useBulkCalculator';
import { generateBulkCSV } from '../utils/generateBulkCSV';
import { generateBulkExcel } from '../utils/generateBulkExcel';

const GHS = (v) => `GHS ${v.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function BulkCalculator() {
  const { employees, result, loading, error, addEmployee, removeEmployee, updateEmployee, calculate } = useBulkCalculator();

  return (
    <div className="space-y-6">
      {/* Employee Input Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <th className="pb-2 pr-2">#</th>
              <th className="pb-2 pr-2">Name (Optional)</th>
              <th className="pb-2 pr-2">Basic Salary (GHS)</th>
              <th className="pb-2 pr-2">Non-Resident</th>
              <th className="pb-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp, idx) => (
              <tr key={emp.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-2 text-gray-400">{idx + 1}</td>
                <td className="py-2 pr-2">
                  <input
                    type="text"
                    placeholder={`Employee ${idx + 1}`}
                    value={emp.name}
                    onChange={(e) => updateEmployee(emp.id, 'name', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-ghana-green outline-none"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={emp.basic_salary}
                    onChange={(e) => updateEmployee(emp.id, 'basic_salary', e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-ghana-green outline-none"
                  />
                </td>
                <td className="py-2 pr-2 text-center">
                  <input
                    type="checkbox"
                    checked={emp.is_non_resident}
                    onChange={(e) => updateEmployee(emp.id, 'is_non_resident', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-ghana-green focus:ring-ghana-green"
                  />
                </td>
                <td className="py-2">
                  <button
                    onClick={() => removeEmployee(emp.id)}
                    disabled={employees.length <= 1}
                    className="text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    title="Remove employee"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={addEmployee}
          disabled={employees.length >= 50}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Employee ({employees.length}/50)
        </button>

        <button
          onClick={calculate}
          disabled={loading}
          className="px-4 py-1.5 text-sm font-semibold bg-ghana-green hover:bg-ghana-green-light text-white rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Calculating...' : 'Calculate All'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Aggregate Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard label="Total Gross" value={GHS(result.aggregate.total_gross_income)} />
            <SummaryCard label="Total Deductions" value={GHS(result.aggregate.total_deductions)} />
            <SummaryCard label="Total Net Pay" value={GHS(result.aggregate.total_net_take_home)} accent />
            <SummaryCard label="Employer Cost" value={GHS(result.aggregate.total_employer_cost)} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <SummaryCard label="Employees" value={result.aggregate.employee_count} />
            <SummaryCard label="Avg Gross" value={GHS(result.aggregate.average_gross_income)} />
            <SummaryCard label="Avg Net Pay" value={GHS(result.aggregate.average_net_take_home)} />
          </div>

          {/* Per-Employee Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 pr-2">Name</th>
                  <th className="pb-2 pr-2 text-right">Gross</th>
                  <th className="pb-2 pr-2 text-right">SSNIT</th>
                  <th className="pb-2 pr-2 text-right">PAYE</th>
                  <th className="pb-2 pr-2 text-right">Total Ded.</th>
                  <th className="pb-2 text-right">Net Pay</th>
                </tr>
              </thead>
              <tbody>
                {result.results.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-2 pr-2 font-medium">
                      {result.employeeNames?.[i] || `Employee ${i + 1}`}
                      {r.meta?.tax_mode === 'non_resident' && (
                        <span className="ml-1 text-xs bg-ghana-gold text-white px-1.5 py-0.5 rounded">NR</span>
                      )}
                    </td>
                    <td className="py-2 pr-2 text-right">{GHS(r.summary.gross_income)}</td>
                    <td className="py-2 pr-2 text-right">{GHS(r.deductions.ssnit.amount)}</td>
                    <td className="py-2 pr-2 text-right">{GHS(r.deductions.paye.total_tax)}</td>
                    <td className="py-2 pr-2 text-right">{GHS(r.summary.total_deductions)}</td>
                    <td className="py-2 text-right font-semibold text-ghana-green">{GHS(r.summary.net_take_home)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => generateBulkCSV(result)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Export CSV
            </button>
            <button
              onClick={() => generateBulkExcel(result)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              Export Excel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-lg font-bold mt-0.5 ${accent ? 'text-ghana-green' : 'text-gray-900 dark:text-gray-100'}`}>{value}</p>
    </div>
  );
}
