import { useMemo } from 'react';
import SummaryCards from './SummaryCards';
import DeductionDetails from './DeductionDetails';
import BandBreakdown from './BandBreakdown';
import ReliefsApplied from './ReliefsApplied';
import EmployerCostCard from './EmployerCostCard';
import BonusImpactCard from './BonusImpactCard';
import YearComparisonCard from './YearComparisonCard';
import SalaryDonutChart from './SalaryDonutChart';
import CurrencyConverter from '../CurrencyConverter';

function scaleResult(result, multiplier) {
  if (multiplier === 1) return result;

  const m = multiplier;
  const s = result.summary;
  const d = result.deductions;
  const ec = result.employer_cost;

  return {
    ...result,
    summary: {
      gross_income: +(s.gross_income * m).toFixed(2),
      total_deductions: +(s.total_deductions * m).toFixed(2),
      net_take_home: +(s.net_take_home * m).toFixed(2),
    },
    deductions: {
      ssnit: { ...d.ssnit, amount: +(d.ssnit.amount * m).toFixed(2) },
      tier2_pension: { ...d.tier2_pension, amount: +(d.tier2_pension.amount * m).toFixed(2) },
      tier3_pension: d.tier3_pension
        ? { ...d.tier3_pension, amount: +(d.tier3_pension.amount * m).toFixed(2) }
        : null,
      paye: {
        ...d.paye,
        chargeable_income: +(d.paye.chargeable_income * m).toFixed(2),
        total_tax: +(d.paye.total_tax * m).toFixed(2),
        band_breakdown: d.paye.band_breakdown.map((b) => ({
          ...b,
          income_in_band: +(b.income_in_band * m).toFixed(2),
          tax: +(b.tax * m).toFixed(2),
        })),
      },
    },
    employer_cost: ec
      ? {
          employer_ssnit: { ...ec.employer_ssnit, amount: +(ec.employer_ssnit.amount * m).toFixed(2) },
          total_cost_to_employer: +(ec.total_cost_to_employer * m).toFixed(2),
        }
      : null,
  };
}

export default function ResultsPanel({ result, mode, period = 'monthly' }) {
  const multiplier = period === 'annual' ? 12 : 1;
  const scaled = useMemo(
    () => (result ? scaleResult(result, multiplier) : null),
    [result, multiplier],
  );

  if (!scaled) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 dark:text-gray-500 text-sm">
        {mode === 'reverse'
          ? 'Enter your desired take-home pay to find the required salary'
          : 'Enter your salary to see the breakdown'}
      </div>
    );
  }

  const isNonResident = result?.meta?.tax_mode === 'non_resident';

  return (
    <div className="space-y-4">
      {isNonResident && (
        <div className="text-xs text-center font-semibold text-white bg-ghana-gold rounded-lg py-1.5">
          Non-Resident: Flat 25% Tax
        </div>
      )}

      {period === 'annual' && (
        <div className="text-xs text-center text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg py-1.5">
          Showing annual figures (monthly x 12)
        </div>
      )}

      {/* Reverse mode: show required salary prominently */}
      {mode === 'reverse' && result.required_basic_salary && (
        <div className="bg-ghana-green text-white rounded-lg p-4 text-center">
          <p className="text-sm opacity-80">You need a basic salary of</p>
          <p className="text-3xl font-bold mt-1">
            GHS {result.required_basic_salary.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm opacity-80 mt-1">to take home your desired amount</p>
        </div>
      )}

      <SalaryDonutChart summary={scaled.summary} deductions={scaled.deductions} />
      <SummaryCards summary={scaled.summary} />
      <DeductionDetails deductions={scaled.deductions} />
      <BandBreakdown paye={scaled.deductions.paye} />
      <ReliefsApplied reliefsApplied={result.reliefs_applied} />
      <EmployerCostCard employerCost={scaled.employer_cost} />
      {result.bonus_impact && <BonusImpactCard bonusImpact={result.bonus_impact} />}
      {result.year_comparison && <YearComparisonCard yearComparison={result.year_comparison} />}
      <CurrencyConverter summary={scaled.summary} deductions={scaled.deductions} />
    </div>
  );
}
