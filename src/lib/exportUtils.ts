import Papa from "papaparse";
import { jsPDF } from "jspdf";

import 'jspdf';
declare module 'jspdf' {
  interface jsPDF {
    autoTable?: (options: Record<string, unknown>) => jsPDF;
  }
}

export interface ReportRow {
  [key: string]: string | number | boolean;
}

/**
 * Format period string from filename like "summary-report-2026-06-18-2026-06-25"
 * into readable format: "18 Jun 2026 — 25 Jun 2026"
 */
function formatPeriod(filename: string): string {
  const suffix = filename.split("report-")[1]; // "2026-06-18-2026-06-25"
  if (!suffix) return "-";

  // Match two ISO dates: YYYY-MM-DD and YYYY-MM-DD
  const match = suffix.match(/(\d{4}-\d{2}-\d{2})-?(\d{4}-\d{2}-\d{2})?$/);
  if (!match) return suffix.replace(/-/g, "/");

  const formatDate = (iso: string) => {
    const [y, m, d] = iso.split("-");
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
    ];
    return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
  };

  const start = formatDate(match[1]);
  const end = match[2] ? formatDate(match[2]) : start;

  if (match[1] === match[2]) return start;
  return `${start} — ${end}`;
}

/**
 * Export data to CSV file with custom column labels
 */
export function exportToCSV(
  data: ReportRow[],
  filename: string,
  columnLabels?: string[]
): void {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  const keys = Object.keys(data[0]);
  
  // If columnLabels provided, rename keys to labels
  let exportData = data;
  if (columnLabels && columnLabels.length === keys.length) {
    exportData = data.map(row => {
      const newRow: ReportRow = {};
      keys.forEach((key, idx) => {
        newRow[columnLabels[idx]] = row[key];
      });
      return newRow;
    });
  }

  const csv = Papa.unparse(exportData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to PDF file with custom column labels
 */
export function exportToPDF(
  data: ReportRow[],
  filename: string,
  columns: string[],
  columnLabels?: string[]
): void {
  if (!data || data.length === 0) {
    throw new Error("No data to export");
  }

  const doc = new jsPDF({
    orientation: columns.length > 5 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  // Title
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Thermal Monitoring System Report", 14, 15);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB`, 14, 22);
  doc.text(`Period: ${formatPeriod(filename)}`, 14, 28);

  // Use columnLabels if provided, otherwise use columns
  const headers = columnLabels || columns.map(col => 
    col.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())
  );

  // Prepare table data
  const tableData = data.map(row => columns.map(col => String(row[col] ?? "-")));

  // Use autoTable if available (via jspdf-autotable), else fallback to manual table
  const docAny = doc as unknown as Record<string, unknown>;
  if (typeof docAny.autoTable === "function") {
    (docAny.autoTable as (opts: Record<string, unknown>) => void)({
      head: [headers],
      body: tableData,
      startY: 35,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 14, right: 14 },
    });
  } else {
    // Fallback: simple table without autoTable
    let y = 35;
    const colWidth = (doc.internal.pageSize.getWidth() - 28) / columns.length;
    
    // Header
    doc.setFillColor(59, 130, 246);
    doc.rect(14, y - 5, doc.internal.pageSize.getWidth() - 28, 8, "F");
    doc.setTextColor(255);
    doc.setFontSize(8);
    headers.forEach((header, i) => {
      doc.text(header, 16 + i * colWidth, y);
    });
    
    // Data rows
    doc.setTextColor(0);
    y += 8;
    tableData.forEach((row, rowIdx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      if (rowIdx % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 5, doc.internal.pageSize.getWidth() - 28, 8, "F");
      }
      row.forEach((cell, i) => {
        doc.text(String(cell).substring(0, 25), 16 + i * colWidth, y);
      });
      y += 8;
    });
  }

  // Save
  doc.save(`${filename}.pdf`);
}
