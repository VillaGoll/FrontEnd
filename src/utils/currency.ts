export const gtqFormatter = new Intl.NumberFormat('es-GT', {
  style: 'currency',
  currency: 'GTQ',
});

export function formatCurrency(value: number | null | undefined): string {
  return gtqFormatter.format(value ?? 0);
}