import * as XLSX from 'xlsx';

const GHS = (amount) => Number(amount.toFixed(2));

export function generateExcel(result) {
  const wb = XLSX.utils.book_new();
  const s = result.summary;
  const d = result.deductions;
  const ec = result.employer_cost;

  // Sheet 1: Summary
  const summaryData = [
    ['Ghana Take-Home Pay Calculator'],
    [''],
    ['Item', 'Amount (GHS)'],
    ['Gross Income', GHS(s.gross_income)],
    ['Total Deductions', GHS(s.total_deductions)],
    ['Net Take-Home Pay', GHS(s.net_take_home)],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  ws1['!cols'] = [{ wch: 25 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Summary');

  // Sheet 2: Deductions
  const dedData = [
    ['Deduction', 'Rate', 'Amount (GHS)', 'Basis'],
    ['SSNIT', `${(d.ssnit.rate * 100).toFixed(1)}%`, GHS(d.ssnit.amount), d.ssnit.basis],
    ['Tier 2 Pension', `${(d.tier2_pension.rate * 100).toFixed(1)}%`, GHS(d.tier2_pension.amount), d.tier2_pension.basis],
  ];
  if (d.tier3_pension) {
    dedData.push(['Tier 3 Pension', `${(d.tier3_pension.rate * 100).toFixed(1)}%`, GHS(d.tier3_pension.amount), d.tier3_pension.basis]);
  }
  dedData.push(['PAYE Income Tax', '', GHS(d.paye.total_tax), '']);
  const ws2 = XLSX.utils.aoa_to_sheet(dedData);
  ws2['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 18 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Deductions');

  // Sheet 3: Tax Bands
  const bandData = [
    ['Chargeable Income', GHS(d.paye.chargeable_income)],
    [''],
    ['Band', 'Income in Band (GHS)', 'Rate', 'Tax (GHS)'],
  ];
  d.paye.band_breakdown.forEach((band) => {
    bandData.push([`Band ${band.band}`, GHS(band.income_in_band), `${(band.rate * 100).toFixed(1)}%`, GHS(band.tax)]);
  });
  bandData.push(['', '', 'Total PAYE', GHS(d.paye.total_tax)]);
  const ws3 = XLSX.utils.aoa_to_sheet(bandData);
  ws3['!cols'] = [{ wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Tax Bands');

  // Sheet 4: Employer Cost
  if (ec) {
    const ecData = [
      ['Employer Cost', 'Rate', 'Amount (GHS)'],
      ['Employer SSNIT', `${(ec.employer_ssnit.rate * 100).toFixed(1)}%`, GHS(ec.employer_ssnit.amount)],
      ['Total Cost to Employer', '', GHS(ec.total_cost_to_employer)],
    ];
    const ws4 = XLSX.utils.aoa_to_sheet(ecData);
    ws4['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws4, 'Employer Cost');
  }

  const month = new Date().toLocaleString('en-GH', { month: 'long', year: 'numeric' }).replace(' ', '-').toLowerCase();
  XLSX.writeFile(wb, `payslip-${month}.xlsx`);
}
