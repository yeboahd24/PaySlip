const GHS = (amount) => amount.toFixed(2);

export function generateBulkCSV(bulkResult) {
  const rows = [];
  const names = bulkResult.employeeNames || [];

  // Per-employee rows
  rows.push(['Name', 'Gross Income', 'SSNIT', 'Tier 2', 'PAYE', 'Total Deductions', 'Net Take-Home', 'Employer Cost']);
  bulkResult.results.forEach((r, i) => {
    const s = r.summary;
    const d = r.deductions;
    const ec = r.employer_cost;
    rows.push([
      names[i] || `Employee ${i + 1}`,
      GHS(s.gross_income),
      GHS(d.ssnit.amount),
      GHS(d.tier2_pension.amount),
      GHS(d.paye.total_tax),
      GHS(s.total_deductions),
      GHS(s.net_take_home),
      ec ? GHS(ec.total_cost_to_employer) : '',
    ]);
  });

  // Totals row
  const agg = bulkResult.aggregate;
  rows.push([]);
  rows.push(['TOTALS', '', '', '', '', '', '', '']);
  rows.push(['Total Gross Income', GHS(agg.total_gross_income)]);
  rows.push(['Total Deductions', GHS(agg.total_deductions)]);
  rows.push(['Total Net Take-Home', GHS(agg.total_net_take_home)]);
  rows.push(['Total Employer Cost', GHS(agg.total_employer_cost)]);
  rows.push(['Average Gross Income', GHS(agg.average_gross_income)]);
  rows.push(['Average Net Take-Home', GHS(agg.average_net_take_home)]);

  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bulk-payroll-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
