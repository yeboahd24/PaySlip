import { useState, useEffect, useCallback } from 'react';
import { calculateForward } from '../api/client';
import { formatCurrency } from '../utils/formatCurrency';

function CompactInput({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
      <div className="relative">
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">GHS</span>
        <input
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-ghana-green focus:border-ghana-green outline-none dark:bg-gray-700 dark:text-white"
        />
      </div>
    </div>
  );
}

function ResultColumn({ label, result, colorClass }) {
  if (!result) {
    return (
      <div className={`flex-1 rounded-lg border p-4 ${colorClass}`}>
        <h4 className="text-sm font-semibold mb-3">{label}</h4>
        <p className="text-xs text-gray-400">Enter a salary to see results</p>
      </div>
    );
  }

  const { summary, deductions, employer_cost } = result;
  return (
    <div className={`flex-1 rounded-lg border p-4 ${colorClass}`}>
      <h4 className="text-sm font-semibold mb-3">{label}</h4>
      <div className="space-y-2 text-sm">
        <Row label="Gross" value={summary.gross_income} />
        <Row label="SSNIT" value={deductions.ssnit.amount} negative />
        <Row label="Tier 2" value={deductions.tier2_pension.amount} negative />
        <Row label="PAYE" value={deductions.paye.total_tax} negative />
        <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
          <Row label="Net Take-Home" value={summary.net_take_home} bold />
        </div>
        {employer_cost && (
          <Row label="Employer Cost" value={employer_cost.total_cost_to_employer} muted />
        )}
      </div>
    </div>
  );
}

function Row({ label, value, negative, bold, muted }) {
  return (
    <div className="flex justify-between">
      <span className={`${muted ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'} ${bold ? 'font-bold' : ''}`}>{label}</span>
      <span className={`${negative ? 'text-ghana-red' : ''} ${bold ? 'font-bold text-ghana-green' : ''} ${muted ? 'text-gray-400' : 'font-medium text-gray-900 dark:text-gray-100'}`}>
        {negative ? '-' : ''}{formatCurrency(value)}
      </span>
    </div>
  );
}

function DiffColumn({ resultA, resultB }) {
  if (!resultA || !resultB) return null;

  const diffs = [
    { label: 'Gross', diff: resultB.summary.gross_income - resultA.summary.gross_income },
    { label: 'SSNIT', diff: resultB.deductions.ssnit.amount - resultA.deductions.ssnit.amount },
    { label: 'PAYE', diff: resultB.deductions.paye.total_tax - resultA.deductions.paye.total_tax },
    { label: 'Net Take-Home', diff: resultB.summary.net_take_home - resultA.summary.net_take_home, bold: true },
  ];

  return (
    <div className="flex-1 max-w-[120px] rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4">
      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 text-center">Difference</h4>
      <div className="space-y-2 text-sm">
        {diffs.map(({ label, diff, bold: b }) => (
          <div key={label} className="flex justify-end">
            <span className={`${b ? 'font-bold' : ''} ${diff > 0 ? 'text-ghana-green' : diff < 0 ? 'text-ghana-red' : 'text-gray-400'}`}>
              {diff > 0 ? '+' : ''}{formatCurrency(diff)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparisonView() {
  const [salaryA, setSalaryA] = useState('');
  const [salaryB, setSalaryB] = useState('');
  const [resultA, setResultA] = useState(null);
  const [resultB, setResultB] = useState(null);

  const fetchResult = useCallback(async (salary, setResult) => {
    const val = parseFloat(salary);
    if (!val || val <= 0) { setResult(null); return; }
    try {
      const data = await calculateForward({ basic_salary: val });
      setResult(data);
    } catch {
      setResult(null);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchResult(salaryA, setResultA), 400);
    return () => clearTimeout(t);
  }, [salaryA, fetchResult]);

  useEffect(() => {
    const t = setTimeout(() => fetchResult(salaryB, setResultB), 400);
    return () => clearTimeout(t);
  }, [salaryB, fetchResult]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CompactInput label="Package A — Basic Salary" value={salaryA} onChange={setSalaryA} />
        <CompactInput label="Package B — Basic Salary" value={salaryB} onChange={setSalaryB} />
      </div>
      <div className="flex gap-3">
        <ResultColumn label="Package A" result={resultA} colorClass="border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20" />
        <DiffColumn resultA={resultA} resultB={resultB} />
        <ResultColumn label="Package B" result={resultB} colorClass="border-purple-200 dark:border-purple-800 bg-purple-50/30 dark:bg-purple-900/20" />
      </div>
    </div>
  );
}
