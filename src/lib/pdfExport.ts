import jsPDF from "jspdf";
import { Device } from "@/types/device";

export function exportDeviceToPDF(device: Device, timeRangeLabel: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Device Report", pageWidth / 2, yPos, { align: "center" });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString("id-ID")}`, pageWidth / 2, yPos, { align: "center" });
  
  // Line separator
  yPos += 8;
  doc.setDrawColor(200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  // Device Information Section
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0);
  doc.text("Device Information", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const deviceInfo = [
    ["Device Name:", device.name],
    ["Device ID:", device.id],
    ["Location:", device.location],
    ["Status:", device.status.toUpperCase()],
    ["Last Seen:", device.lastSeen ? new Date(device.lastSeen).toLocaleString("id-ID") : "-"],
  ];
  
  deviceInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 25, yPos);
    doc.setFont("helvetica", "normal");
    doc.text(value, 70, yPos);
    yPos += 7;
  });
  
  // Current Readings Section
  yPos += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Current Readings", 20, yPos);
  
  yPos += 10;
  const latest = device.readings.at(-1);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Temperature: ${latest?.temperature ?? "--"} °C`, 25, yPos);
  yPos += 7;
  doc.text(`Humidity: ${latest?.humidity ?? "--"} %`, 25, yPos);
  
  // Historical Data Section
  yPos += 15;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Historical Data", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Time Range: ${timeRangeLabel}`, 25, yPos);
  yPos += 7;
  doc.text(`Total Data Points: ${device.readings.length}`, 25, yPos);
  
  // Data Table Header
  yPos += 12;
  doc.setFont("helvetica", "bold");
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPos - 5, pageWidth - 40, 8, "F");
  doc.text("Time", 25, yPos);
  doc.text("Temperature (°C)", 80, yPos);
  doc.text("Humidity (%)", 140, yPos);
  
  yPos += 8;
  doc.setFont("helvetica", "normal");
  
  // Data Table Rows (latest 20 readings)
  const recentReadings = device.readings.slice(-20).reverse();
  
  recentReadings.forEach((reading, index) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(reading.time, 25, yPos);
    doc.text(reading.temperature.toFixed(2), 80, yPos);
    doc.text(reading.humidity.toFixed(2), 140, yPos);
    yPos += 6;
  });
  
  // Footer
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${totalPages} | CPEMS - Coolman Power Environment Monitoring System`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
  }
  
  // Save PDF
  const filename = `device-report-${device.id}-${Date.now()}.pdf`;
  doc.save(filename);
}
