import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/logo.png'; // ✅ adjust the path to your logo

// Helper to draw a colored box with text
function drawBox(pdf, x, y, w, h, color, text, textColor = '#fff', fontSize = 16) {
  pdf.setFillColor(...color);
  pdf.rect(x, y, w, h, 'F');
  pdf.setTextColor(textColor);
  pdf.setFontSize(fontSize);
  pdf.text(text, x + w / 2, y + h / 2, { align: 'center', baseline: 'middle' });
}

// Helper to add logo
function addLogo(pdf, x, y, w, h) {
  pdf.addImage(logo, 'PNG', x, y, w, h);
}

export const generateProjectReport = (projects) => {
  const pdf = new jsPDF();

  // --- Creative Header ---
  addLogo(pdf, 10, 8, 20, 20);
  pdf.setFontSize(22);
  pdf.setTextColor(59, 130, 246);
  pdf.setFont('helvetica', 'bold');
  pdf.text('AD Construction', 35, 18);
  pdf.setFontSize(13);
  pdf.setTextColor('#333');
  pdf.setFont('helvetica', 'normal');
  pdf.text('Project Report', 35, 26);

  // --- Project Table (One Page) ---
  const startY = 35;
  const columns = [
    'Project Name',
    'Client',
    'Status',
    'Priority',
    'Start Date',
    'End Date',
    'Budget',
    'Completion %',
  ];
  const tableData = projects.map((project) => [
    project.name || 'N/A',
    project.client || 'N/A',
    project.status || 'N/A',
    project.priority || 'N/A',
    project.startDate
      ? new Date(project.startDate).toLocaleDateString('en-GB')
      : 'N/A',
    project.endDate
      ? new Date(project.endDate).toLocaleDateString('en-GB')
      : 'N/A',
    project.budget ? `Rs. ${Number(project.budget).toLocaleString()}` : 'N/A',
    `${Number(project.completion) || 0}%`,
  ]);

  autoTable(pdf, {
    head: [columns],
    body: tableData,
    startY,
    styles: {
      fontSize: 10,
      cellPadding: 3,
      halign: 'center',
      valign: 'middle',
      textColor: [51, 51, 51],
    },
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [243, 244, 246],
    },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 25 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 },
      6: { cellWidth: 25 },
      7: { cellWidth: 22 },
    },
    margin: { left: 10, right: 10 },
    theme: 'striped',
    didDrawPage: function (data) {
      // Stylish Footer
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(10);
      pdf.setTextColor('#666');
      pdf.text(
        `Generated: ${new Date().toLocaleString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })}`,
        10,
        pageHeight - 10
      );
      pdf.text(
        'Contact: info@adconstruction.com | +94 70 103 8400',
        120,
        pageHeight - 10
      );
    },
  });

  return pdf;
};

export const downloadProjectReport = (projects) => {
  try {
    if (!projects || !Array.isArray(projects)) {
      console.error('Invalid projects data:', projects);
      return false;
    }
    const pdf = generateProjectReport(projects);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fileName = `Project_Report_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

const pdfService = {
  generateProjectReport,
  downloadProjectReport,
};

export default pdfService;
