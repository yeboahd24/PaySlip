import { useState } from 'react';
import { useCurrencyRates } from '../hooks/useCurrencyRates';

const CURRENCY_LABELS = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
  NGN: 'Nigerian Naira',
  XOF: 'CFA Franc',
};

const CURRENCY_SYMBOLS = {
  USD: '$',
  EUR: '\u20AC',
  GBP: '\u00A3',
  NGN: '\u20A6',
  XOF: 'CFA',
};

function fmt(amount, currency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CurrencyConverter({ summary, deductions }) {
  const { rates, loading, error } = useCurrencyRates();
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');

  if (!summary) return null;

  const rate = rates?.[currency];

  const convert = (ghs) => (rate ? ghs * rate : null);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        <span>Currency Converter</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3">
          {loading && <p className="text-xs text-gray-400">Loading exchange rates...</p>}
          {error && <p className="text-xs text-red-500">Could not load rates: {error}</p>}

          {rates && (
            <>
              {/* Currency selector */}
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(rates).map((code) => (
                  <button
                    key={code}
                    onClick={() => setCurrency(code)}
                    className={`px-2.5 py-1 text-xs rounded-full font-medium transition ${
                      currency === code
                        ? 'bg-ghana-green text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>

              {/* Exchange rate */}
              <p className="text-xs text-gray-400">
                1 GHS = {rate?.toFixed(4)} {currency} ({CURRENCY_LABELS[currency]})
              </p>

              {/* Converted values */}
              <div className="space-y-2 text-sm">
                <ConvertRow label="Gross Income" ghs={summary.gross_income} converted={convert(summary.gross_income)} currency={currency} />
                <ConvertRow label="SSNIT" ghs={deductions.ssnit.amount} converted={convert(deductions.ssnit.amount)} currency={currency} negative />
                <ConvertRow label="PAYE Tax" ghs={deductions.paye.total_tax} converted={convert(deductions.paye.total_tax)} currency={currency} negative />
                <ConvertRow label="Total Deductions" ghs={summary.total_deductions} converted={convert(summary.total_deductions)} currency={currency} negative />
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2">
                  <ConvertRow label="Net Take-Home" ghs={summary.net_take_home} converted={convert(summary.net_take_home)} currency={currency} bold />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ConvertRow({ label, converted, currency, negative, bold }) {
  return (
    <div className="flex justify-between">
      <span className={`text-gray-500 dark:text-gray-400 ${bold ? 'font-bold' : ''}`}>{label}</span>
      <span className={`${negative ? 'text-ghana-red' : ''} ${bold ? 'font-bold text-ghana-green' : 'text-gray-900 dark:text-gray-100'}`}>
        {converted !== null ? `${negative ? '-' : ''}${fmt(Math.abs(converted), currency)}` : '—'}
      </span>
    </div>
  );
}
