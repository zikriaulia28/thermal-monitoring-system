import Papa from 'papaparse';
import { jsPDF } from 'jspdf';

declare global {
  namespace jspdf {
    interface jsPDF {
      autoTable?: (options: any) => jsPDF;
    }
  }
}

export function exportToCSV(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(data: any[], filename: string, columns: string[]) {
  try {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Add title
    doc.setFontSize(14);
    doc.text(`Report: ${filename}`, 14, 10);

    // Add metadata
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('id-ID')}`, 14, 18);

    // Prepare table data
    const tableData = data.map((row) =>
      columns.map((col) => {
        const value = row[col];
        if (typeof value === 'number') return value.toFixed(2);
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        return String(value || '-');
      })
    );

    // Simple table rendering without autoTable
    let yPos = 25;
    const pageHeight = doc.internal.pageSize.getHeight();
    const rowHeight = 8;
    const startX = 14;
    const colWidth = (doc.internal.pageSize.getWidth() - 28) / columns.length;

    // Header row
    doc.setFillColor(66, 139, 202);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('', 'bold');

    columns.forEach((col, idx) => {
      const label = col.replace(/([A-Z])/g, ' $1').toUpperCase();
      doc.text(label, startX + idx * colWidth + 2, yPos + 5, { maxWidth: colWidth - 4 });
    });

    // Data rows
    doc.setTextColor(0, 0, 0);
    doc.setFont('', 'normal');
    let rowIdx = 0;

    tableData.forEach((row) => {
      yPos += rowHeight;

      // Add new page if needed
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      // Alternate row colors
      if (rowIdx % 2 === 0) {
        doc.setFillColor(245, 245, 245);
        doc.rect(startX, yPos - 6, doc.internal.pageSize.getWidth() - 28, rowHeight, 'F');
      }

      // Draw row cells
      row.forEach((cell, idx) => {
        doc.text(cell, startX + idx * colWidth + 2, yPos, { maxWidth: colWidth - 4 });
      });

      rowIdx++;
    });

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('PDF Export Error:', error);
    alert('Failed to export PDF. Try CSV format instead.');
  }
}

export function exportToExcel(data: any[], filename: string) {
  // Simple Excel export using CSV format (.xlsx would need additional library)
  // For now, we'll export as CSV and user can open in Excel
  exportToCSV(data, filename);
}

export function convertTableToHTML(data: any[], columns: string[]): string {
  let html = '<table border="1" cellpadding="5" cellspacing="0">';
  html += '<thead><tr>';
  columns.forEach((col) => {
    html += `<th>${col}</th>`;
  });
  html += '</tr></thead><tbody>';

  data.forEach((row) => {
    html += '<tr>';
    columns.forEach((col) => {
      const value = row[col] || '-';
      html += `<td>${value}</td>`;
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}
