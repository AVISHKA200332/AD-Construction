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

  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 35;

  // --- Executive Summary ---
  const total = Array.isArray(projects) ? projects.length : 0;
  const byStatus = (projects || []).reduce((acc, p) => { const k = p.status || 'Unknown'; acc[k] = (acc[k]||0)+1; return acc; }, {});
  const byPriority = (projects || []).reduce((acc, p) => { const k = p.priority || 'Unknown'; acc[k] = (acc[k]||0)+1; return acc; }, {});
  const completed = byStatus['Completed'] || 0;
  const active = byStatus['In Progress'] || 0;
  const avgCompletion = total ? Math.round((projects||[]).reduce((s,p)=> s + (Number(p.completion)||0), 0) / total) : 0;
  const budgetSum = (projects||[]).reduce((s,p)=> s + (Number(p.budget)||0), 0);

  pdf.setFont('helvetica','bold');
  pdf.setTextColor('#0B3954');
  pdf.setFontSize(14);
  pdf.text('Executive Summary', 10, y);
  y += 4;

  // Summary cards (2 rows x 2 cols)
  const cardW = (pageWidth - 10 - 10 - 6) / 2; // margins 10 each, gap 6
  const cardH = 16;
  const colors = {
    total: [11, 57, 84],
    active: [37, 99, 235],
    completed: [22, 163, 74],
    avg: [245, 158, 11],
  };
  drawBox(pdf, 10, y, cardW, cardH, colors.total, `Total Projects: ${total}`);
  drawBox(pdf, 10 + cardW + 6, y, cardW, cardH, colors.active, `Active: ${active}`);
  y += cardH + 4;
  drawBox(pdf, 10, y, cardW, cardH, colors.completed, `Completed: ${completed}`);
  const budgetText = `Budget: Rs. ${budgetSum.toLocaleString()}`;
  drawBox(pdf, 10 + cardW + 6, y, cardW, cardH, colors.avg, `Avg Completion: ${avgCompletion}%`);
  y += cardH + 6;

  // Budget pill
  pdf.setFont('helvetica','normal');
  pdf.setTextColor('#333');
  pdf.setFontSize(11);
  pdf.text(budgetText, 10, y);
  y += 6;

  // --- Distributions ---
  const sectionTop = y;
  pdf.setFont('helvetica','bold');
  pdf.setTextColor('#0B3954');
  pdf.setFontSize(13);
  pdf.text('Status Distribution', 10, y);
  pdf.text('Priority Distribution', pageWidth/2 + 5, y);
  y += 4;
  pdf.setFont('helvetica','normal');
  pdf.setTextColor('#333');
  pdf.setFontSize(10);

  const drawBars = (x, yStart, dict) => {
    const entries = Object.entries(dict || {});
    if (entries.length === 0) {
      pdf.text('No data', x, yStart + 4);
      return 8;
    }
    const max = Math.max(1, ...entries.map(([,v])=>v));
    let yy = yStart;
    entries.forEach(([k,v]) => {
      // label
      pdf.text(String(k), x, yy + 4);
      // bar
      const barX = x + 40;
      const barW = (pageWidth/2 - 55);
      const w = Math.max(2, Math.round((v/max) * barW));
      pdf.setFillColor(200, 215, 230);
      pdf.rect(barX, yy, barW, 4, 'F');
      pdf.setFillColor(11, 57, 84);
      pdf.rect(barX, yy, w, 4, 'F');
      pdf.setTextColor('#666');
      pdf.text(String(v), barX + barW + 3, yy + 3.5);
      pdf.setTextColor('#333');
      yy += 6;
    });
    return (entries.length * 6) + 2;
  };

  const leftH = drawBars(10, y, byStatus);
  const rightH = drawBars(pageWidth/2 + 5, y, byPriority);
  y = sectionTop + Math.max(leftH, rightH) + 6;

  // Divider line before table
  pdf.setDrawColor(230, 230, 230);
  pdf.line(10, y, pageWidth-10, y);
  y += 4;

  // --- Project Table ---
  const startY = y;
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
