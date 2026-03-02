const GHS = (amount) => amount.toFixed(2);

export function generateCSV(result) {
  const rows = [];
  const s = result.summary;
  const d = result.deductions;
  const ec = result.employer_cost;

  // Summary
  rows.push(['SUMMARY', '']);
  rows.push(['Gross Income', GHS(s.gross_income)]);
  rows.push(['Total Deductions', GHS(s.total_deductions)]);
  rows.push(['Net Take-Home Pay', GHS(s.net_take_home)]);
  rows.push(['', '']);

  // Deductions
  rows.push(['DEDUCTIONS', '']);
  rows.push([`SSNIT (${(d.ssnit.rate * 100).toFixed(1)}%)`, GHS(d.ssnit.amount)]);
  rows.push([`Tier 2 Pension (${(d.tier2_pension.rate * 100).toFixed(1)}%)`, GHS(d.tier2_pension.amount)]);
  if (d.tier3_pension) {
    rows.push([`Tier 3 Pension (${(d.tier3_pension.rate * 100).toFixed(1)}%)`, GHS(d.tier3_pension.amount)]);
  }
  rows.push(['PAYE Income Tax', GHS(d.paye.total_tax)]);
  rows.push(['', '']);

  // Tax Bands
  rows.push(['TAX BAND BREAKDOWN', '', '', '']);
  rows.push(['Band', 'Income in Band', 'Rate', 'Tax']);
  d.paye.band_breakdown.forEach((band) => {
    rows.push([`Band ${band.band}`, GHS(band.income_in_band), `${(band.rate * 100).toFixed(1)}%`, GHS(band.tax)]);
  });
  rows.push(['', '']);

  // Employer Cost
  if (ec) {
    rows.push(['EMPLOYER COST', '']);
    rows.push([`Employer SSNIT (${(ec.employer_ssnit.rate * 100).toFixed(1)}%)`, GHS(ec.employer_ssnit.amount)]);
    rows.push(['Total Cost to Employer', GHS(ec.total_cost_to_employer)]);
  }

  const csvContent = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const month = new Date().toLocaleString('en-GH', { month: 'long', year: 'numeric' }).replace(' ', '-').toLowerCase();
  link.href = url;
  link.download = `payslip-${month}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
