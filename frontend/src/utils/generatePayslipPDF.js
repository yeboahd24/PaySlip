import { jsPDF } from 'jspdf';

const GHS = (amount) => `GHS ${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function generatePayslipPDF(result, inputs = {}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  const green = [0, 107, 63];
  const gold = [252, 209, 22];
  const dark = [30, 30, 30];
  const gray = [120, 120, 120];

  // Header bar
  doc.setFillColor(...green);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Ghana Take-Home Pay Calculator', pageWidth / 2, 12, { align: 'center' });
  doc.setFontSize(10);
  doc.text('Monthly Payslip Breakdown', pageWidth / 2, 20, { align: 'center' });

  y = 42;

  // Company / employee info
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  const companyName = inputs.companyName || 'Company Name';
  const employeeName = inputs.employeeName || 'Employee Name';
  const month = new Date().toLocaleString('en-GH', { month: 'long', year: 'numeric' });
  doc.text(`Company: ${companyName}`, 14, y);
  doc.text(`Period: ${month}`, pageWidth - 14, y, { align: 'right' });
  y += 6;
  doc.text(`Employee: ${employeeName}`, 14, y);
  doc.text(`Tax Year: ${result.meta?.tax_year || new Date().getFullYear()}`, pageWidth - 14, y, { align: 'right' });
  y += 6;
  if (result.meta?.tax_mode === 'non_resident') {
    doc.setTextColor(...gold);
    doc.setFont(undefined, 'bold');
    doc.text('NON-RESIDENT — Flat 25% Tax Rate', 14, y);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...gray);
  }
  y += 6;

  // Divider
  doc.setDrawColor(...green);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Summary cards
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.setFont(undefined, 'bold');
  doc.text('SUMMARY', 14, y);
  y += 7;

  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);
  const summary = result.summary;
  const summaryRows = [
    ['Gross Income', GHS(summary.gross_income)],
    ['Total Deductions', GHS(summary.total_deductions)],
    ['Net Take-Home Pay', GHS(summary.net_take_home)],
  ];
  summaryRows.forEach(([label, value]) => {
    doc.setTextColor(...gray);
    doc.text(label, 18, y);
    doc.setTextColor(...dark);
    doc.setFont(undefined, 'bold');
    doc.text(value, pageWidth - 18, y, { align: 'right' });
    doc.setFont(undefined, 'normal');
    y += 6;
  });

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // Deductions
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.setFont(undefined, 'bold');
  doc.text('DEDUCTIONS', 14, y);
  y += 7;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const ded = result.deductions;
  const dedRows = [
    [`SSNIT (${(ded.ssnit.rate * 100).toFixed(1)}% of basic)`, GHS(ded.ssnit.amount)],
    [`Tier 2 Pension (${(ded.tier2_pension.rate * 100).toFixed(1)}% of basic)`, GHS(ded.tier2_pension.amount)],
    ['PAYE Income Tax', GHS(ded.paye.total_tax)],
  ];
  dedRows.forEach(([label, value]) => {
    doc.setTextColor(...gray);
    doc.text(label, 18, y);
    doc.setTextColor(...dark);
    doc.text(value, pageWidth - 18, y, { align: 'right' });
    y += 6;
  });

  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  // PAYE Band breakdown
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.setFont(undefined, 'bold');
  doc.text('PAYE TAX BAND BREAKDOWN', 14, y);
  y += 3;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...gray);
  doc.text(`Chargeable Income: ${GHS(ded.paye.chargeable_income)}`, 14, y + 4);
  y += 10;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(14, y - 3, pageWidth - 28, 7, 'F');
  doc.setTextColor(...dark);
  doc.setFont(undefined, 'bold');
  doc.setFontSize(9);
  doc.text('Band', 18, y + 1);
  doc.text('Income in Band', 70, y + 1);
  doc.text('Rate', 120, y + 1);
  doc.text('Tax', pageWidth - 18, y + 1, { align: 'right' });
  y += 8;

  doc.setFont(undefined, 'normal');
  ded.paye.band_breakdown.forEach((band) => {
    doc.setTextColor(...gray);
    doc.text(`Band ${band.band}`, 18, y);
    doc.text(GHS(band.income_in_band), 70, y);
    doc.text(`${(band.rate * 100).toFixed(1)}%`, 120, y);
    doc.setTextColor(...dark);
    doc.text(GHS(band.tax), pageWidth - 18, y, { align: 'right' });
    y += 6;
  });

  // Employer cost
  if (result.employer_cost) {
    y += 4;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFontSize(11);
    doc.setTextColor(...dark);
    doc.setFont(undefined, 'bold');
    doc.text('EMPLOYER COST', 14, y);
    y += 7;
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    const ec = result.employer_cost;
    doc.setTextColor(...gray);
    doc.text(`Employer SSNIT (${(ec.employer_ssnit.rate * 100).toFixed(1)}% of basic)`, 18, y);
    doc.setTextColor(...dark);
    doc.text(GHS(ec.employer_ssnit.amount), pageWidth - 18, y, { align: 'right' });
    y += 6;
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...gray);
    doc.text('Total Cost to Employer', 18, y);
    doc.setTextColor(...green);
    doc.text(GHS(ec.total_cost_to_employer), pageWidth - 18, y, { align: 'right' });
    y += 8;
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 20;
  doc.setDrawColor(...gold);
  doc.setLineWidth(1);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(...gray);
  doc.text('Tax rates based on Ghana Revenue Authority (GRA) guidelines. Always verify with GRA for official rates.', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text(`Generated on ${new Date().toLocaleDateString('en-GH')} — Ghana Take-Home Pay Calculator`, pageWidth / 2, y, { align: 'center' });

  doc.save(`payslip-${month.replace(' ', '-').toLowerCase()}.pdf`);
}
