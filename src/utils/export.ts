export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers: { key: keyof T | ((item: T) => any); label: string }[]
) => {
  if (!data || data.length === 0) {
    alert('Tidak ada data untuk diexport.');
    return;
  }

  const csvRows = [headers.map((h) => h.label).join(',')];

  data.forEach((item) => {
    const row = headers.map((header) => {
      let value = typeof header.key === 'function' ? header.key(item) : item[header.key as keyof T];
      
      // Handle null/undefined gracefully
      if (value === null || value === undefined) {
        value = '';
      }
      
      // Escape rules: wrap string in quotes, double up internal quotes
      const escapedStr = `"${String(value).replace(/"/g, '""')}"`;
      return escapedStr;
    });
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
