/**
 * Format a number to Indonesian Rupiah (IDR) currency format.
 * @param number The number to format
 * @returns Formatted string (e.g., Rp 15.000.000)
 */
export const formatRupiah = (number: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(number);
};
