const formatter = new Intl.NumberFormat('en-GH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return `GHS ${formatter.format(amount)}`;
}

export function formatRate(rate) {
  return `${(rate * 100).toFixed(1)}%`;
}
