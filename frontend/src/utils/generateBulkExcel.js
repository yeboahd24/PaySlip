import * as XLSX from 'xlsx';

const N = (amount) => Number(amount.toFixed(2));

export function generateBulkExcel(bulkResult) {
  const wb = XLSX.utils.book_new();
  const names = bulkResult.employeeNames || [];

  // Sheet 1: Employee Details
  const header = ['Name', 'Gross Income', 'SSNIT', 'Tier 2', 'PAYE', 'Total Deductions', 'Net Take-Home', 'Employer Cost', 'Tax Mode'];
  const empRows = bulkResult.results.map((r, i) => {
    const s = r.summary;
    const d = r.deductions;
    const ec = r.employer_cost;
    return [
      names[i] || `Employee ${i + 1}`,
      N(s.gross_income),
      N(d.ssnit.amount),
      N(d.tier2_pension.amount),
      N(d.paye.total_tax),
      N(s.total_deductions),
      N(s.net_take_home),
      ec ? N(ec.total_cost_to_employer) : 0,
      r.meta?.tax_mode || 'resident',
    ];
  });
  const ws1 = XLSX.utils.aoa_to_sheet([header, ...empRows]);
  ws1['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Employee Details');

  // Sheet 2: Aggregate Summary
  const agg = bulkResult.aggregate;
  const aggData = [
    ['Aggregate Summary'],
    [''],
    ['Metric', 'Value (GHS)'],
    ['Employee Count', agg.employee_count],
    ['Total Gross Income', N(agg.total_gross_income)],
    ['Total Deductions', N(agg.total_deductions)],
    ['Total Net Take-Home', N(agg.total_net_take_home)],
    ['Total Employer Cost', N(agg.total_employer_cost)],
    ['Average Gross Income', N(agg.average_gross_income)],
    ['Average Net Take-Home', N(agg.average_net_take_home)],
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(aggData);
  ws2['!cols'] = [{ wch: 25 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Aggregate');

  XLSX.writeFile(wb, `bulk-payroll-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
