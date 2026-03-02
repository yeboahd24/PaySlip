import { formatCurrency } from '../../utils/formatCurrency';

const COLORS = {
  take_home: '#006B3F',
  ssnit: '#3B82F6',
  tier2: '#8B5CF6',
  tier3: '#A855F7',
  paye: '#CE1126',
};

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 0 ${end.x} ${end.y}`;
}

export default function SalaryDonutChart({ summary, deductions }) {
  const gross = summary.gross_income;
  if (!gross || gross <= 0) return null;

  const segments = [
    { key: 'take_home', label: 'Take-Home', value: summary.net_take_home, color: COLORS.take_home },
    { key: 'ssnit', label: 'SSNIT', value: deductions.ssnit.amount, color: COLORS.ssnit },
    { key: 'tier2', label: 'Tier 2', value: deductions.tier2_pension.amount, color: COLORS.tier2 },
  ];

  if (deductions.tier3_pension) {
    segments.push({ key: 'tier3', label: 'Tier 3', value: deductions.tier3_pension.amount, color: COLORS.tier3 });
  }

  segments.push({ key: 'paye', label: 'PAYE', value: deductions.paye.total_tax, color: COLORS.paye });

  const filtered = segments.filter((s) => s.value > 0);

  const cx = 100, cy = 100, r = 80, strokeWidth = 24;
  let angle = 0;

  const arcs = filtered.map((seg) => {
    const sweep = (seg.value / gross) * 360;
    const startAngle = angle;
    angle += sweep;
    const endAngle = angle;

    // Avoid rendering a full 360 arc (SVG can't handle it)
    const clampedSweep = Math.min(sweep, 359.99);

    return {
      ...seg,
      path: arcPath(cx, cy, r, startAngle, startAngle + clampedSweep),
      pct: ((seg.value / gross) * 100).toFixed(1),
    };
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Where Your Salary Goes</h3>
      <div className="flex items-center gap-6">
        {/* SVG Donut */}
        <div className="shrink-0">
          <svg width="140" height="140" viewBox="0 0 200 200">
            {arcs.map((arc) => (
              <path
                key={arc.key}
                d={arc.path}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
            ))}
            {/* Center text */}
            <text x={cx} y={cy - 6} textAnchor="middle" className="fill-gray-500 dark:fill-gray-400" fontSize="10">
              Net Pay
            </text>
            <text x={cx} y={cy + 12} textAnchor="middle" className="fill-gray-900 dark:fill-gray-100 font-bold" fontSize="14">
              {((summary.net_take_home / gross) * 100).toFixed(0)}%
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-1.5">
          {arcs.map((seg) => (
            <div key={seg.key} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="text-gray-600 dark:text-gray-400">{seg.label}</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(seg.value)}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">({seg.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
