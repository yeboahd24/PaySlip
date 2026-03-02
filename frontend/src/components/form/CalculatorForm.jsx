import { useState, useEffect, useCallback } from 'react';
import SalaryInput from './SalaryInput';
import AllowanceList from './AllowanceList';
import ReliefSelector from './ReliefSelector';
import Tooltip from '../Tooltip';

const initialReliefs = { marriage: false, children: 0, disability: false, old_age: false };

export default function CalculatorForm({ onSubmit, debouncedCalculate, loading, mode, onModeChange }) {
  const [salary, setSalary] = useState('');
  const [desiredNet, setDesiredNet] = useState('');
  const [allowances, setAllowances] = useState([]);
  const [reliefs, setReliefs] = useState(initialReliefs);
  const [bonus, setBonus] = useState('');
  const [tier3Rate, setTier3Rate] = useState('');
  const [isNonResident, setIsNonResident] = useState(false);

  const buildPayload = useCallback(() => {
    if (mode === 'reverse') {
      const net = parseFloat(desiredNet);
      if (!net || net <= 0) return null;
      const validAllowances = allowances
        .filter((a) => a.name.trim() && parseFloat(a.amount) > 0)
        .map((a) => ({ name: a.name.trim(), amount: parseFloat(a.amount), taxable: a.taxable }));
      return { desired_net: net, allowances: validAllowances, reliefs, is_non_resident: isNonResident };
    }

    const basicSalary = parseFloat(salary);
    if (!basicSalary || basicSalary <= 0) return null;
    const validAllowances = allowances
      .filter((a) => a.name.trim() && parseFloat(a.amount) > 0)
      .map((a) => ({ name: a.name.trim(), amount: parseFloat(a.amount), taxable: a.taxable }));
    const payload = { basic_salary: basicSalary, allowances: validAllowances, reliefs, is_non_resident: isNonResident };
    if (!isNonResident) {
      const bonusVal = parseFloat(bonus);
      if (bonusVal > 0) payload.bonus = bonusVal;
      const t3 = parseFloat(tier3Rate);
      if (t3 > 0) payload.tier3_rate = t3 / 100;
    }
    return payload;
  }, [salary, desiredNet, allowances, reliefs, bonus, tier3Rate, mode, isNonResident]);

  // Real-time calculation on any input change
  useEffect(() => {
    const payload = buildPayload();
    if (payload && debouncedCalculate) {
      debouncedCalculate(payload);
    }
  }, [salary, desiredNet, allowances, reliefs, bonus, tier3Rate, mode, isNonResident, buildPayload, debouncedCalculate]);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = buildPayload();
    if (payload) onSubmit(payload);
  }

  const isValid = mode === 'reverse' ? parseFloat(desiredNet) > 0 : parseFloat(salary) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <button
          type="button"
          onClick={() => onModeChange('forward')}
          className={`flex-1 py-2 text-sm font-medium transition ${
            mode === 'forward'
              ? 'bg-ghana-green text-white'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          Salary → Take-Home
        </button>
        <button
          type="button"
          onClick={() => onModeChange('reverse')}
          className={`flex-1 py-2 text-sm font-medium transition ${
            mode === 'reverse'
              ? 'bg-ghana-green text-white'
              : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          Take-Home → Salary
        </button>
      </div>

      {/* Non-Resident Toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={isNonResident}
            onChange={(e) => setIsNonResident(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-300 dark:bg-gray-600 peer-checked:bg-ghana-gold rounded-full transition" />
          <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-4 transition-transform" />
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Non-Resident (Flat 25% Tax)
        </span>
      </label>

      {/* Main Input */}
      {mode === 'forward' ? (
        <SalaryInput value={salary} onChange={setSalary} />
      ) : (
        <div>
          <label htmlFor="desired-net" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Tooltip text="Enter the amount you want to take home each month. We'll calculate the gross salary you need to negotiate.">
              Desired Take-Home Pay (Monthly)
            </Tooltip>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm">
              GHS
            </span>
            <input
              id="desired-net"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={desiredNet}
              onChange={(e) => setDesiredNet(e.target.value)}
              className="w-full pl-14 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-ghana-green outline-none transition dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}

      <AllowanceList allowances={allowances} onChange={setAllowances} />
      {!isNonResident && <ReliefSelector reliefs={reliefs} onChange={setReliefs} />}

      {/* Tier 3 Voluntary Pension */}
      {mode === 'forward' && !isNonResident && (
        <div>
          <label htmlFor="tier3" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Tooltip text="Tier 3 is a voluntary provident fund. Contributions up to 16.5% of gross salary are tax-deductible, reducing your PAYE. A great way to save for retirement while paying less tax.">
              Tier 3 Voluntary Pension (Optional)
            </Tooltip>
          </label>
          <div className="relative">
            <input
              id="tier3"
              type="number"
              min="0"
              max="16.5"
              step="0.5"
              placeholder="0"
              value={tier3Rate}
              onChange={(e) => setTier3Rate(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-ghana-green outline-none transition dark:bg-gray-700 dark:text-white"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm">
              %
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Max 16.5% of gross salary. Tax-deductible.</p>
        </div>
      )}

      {/* Bonus Input (forward mode only, residents only) */}
      {mode === 'forward' && !isNonResident && (
        <div>
          <label htmlFor="bonus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <Tooltip text="Enter a one-off bonus to see how much of it you'll actually keep after tax. This shows the marginal tax impact on additional income.">
              Bonus / Overtime (Optional)
            </Tooltip>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium text-sm">
              GHS
            </span>
            <input
              id="bonus"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={bonus}
              onChange={(e) => setBonus(e.target.value)}
              className="w-full pl-14 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-ghana-green focus:border-ghana-green outline-none transition dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full bg-ghana-green hover:bg-ghana-green-light disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Calculating...
          </span>
        ) : mode === 'reverse' ? (
          'Find Required Salary'
        ) : (
          'Calculate Take-Home Pay'
        )}
      </button>
    </form>
  );
}
