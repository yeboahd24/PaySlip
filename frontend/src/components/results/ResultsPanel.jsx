import SummaryCards from './SummaryCards';
import DeductionDetails from './DeductionDetails';
import BandBreakdown from './BandBreakdown';
import ReliefsApplied from './ReliefsApplied';

export default function ResultsPanel({ result }) {
  if (!result) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] text-gray-400 text-sm">
        Enter your salary to see the breakdown
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SummaryCards summary={result.summary} />
      <DeductionDetails deductions={result.deductions} />
      <BandBreakdown paye={result.deductions.paye} />
      <ReliefsApplied reliefsApplied={result.reliefs_applied} />
    </div>
  );
}
