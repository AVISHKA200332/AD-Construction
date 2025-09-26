import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logger from '../utils/logger';
import logo from '../assets/logo.png';

// Helper to draw a colored box with text
function drawBox(pdf, x, y, w, h, color, text, textColor = '#fff', fontSize = 14) {
  pdf.setFillColor(...color);
  pdf.rect(x, y, w, h, 'F');
  pdf.setTextColor(textColor);
  pdf.setFontSize(fontSize);
  pdf.text(text, x + w / 2, y + h / 2, { align: 'center', baseline: 'middle' });
}

// Helper to add logo
function addLogo(pdf, x, y, w, h) {
  try {
    pdf.addImage(logo, 'PNG', x, y, w, h);
  } catch (error) {
    console.error('Error adding logo:', error);
  }
}

export const generateInventoryReport = (items, buyerOrders = []) => {
  const pdf = new jsPDF();

  // --- Cover Page ---
  addLogo(pdf, 80, 30, 50, 50);
  pdf.setFontSize(28);
  pdf.setTextColor(11, 57, 84); // Dark blue from the theme
  pdf.setFont('helvetica', 'bold');
  pdf.text('AD Construction', 105, 95, { align: 'center' });
  pdf.setFontSize(18);
  pdf.setTextColor('#333');
  pdf.text('Inventory Management Report', 105, 110, { align: 'center' });
  pdf.setFontSize(12);
  pdf.setTextColor('#666');
  pdf.text(
    `Generated on: ${new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })}`,
    105,
    125,
    { align: 'center' }
  );
  
  // Statistics Overview on Cover Page
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.amount * item.unitPrice), 0);
  const outOfStock = items.filter(item => item.amount === 0).length;
  const lowStock = items.filter(item => item.amount > 0 && item.amount < 10).length;
  
  pdf.setFontSize(14);
  pdf.setTextColor('#333');
  pdf.text('Quick Statistics', 105, 145, { align: 'center' });
  
  // Draw stats boxes
  drawBox(pdf, 30, 155, 40, 15, [34, 197, 94], `Items: ${totalItems}`);
  drawBox(pdf, 75, 155, 60, 15, [59, 130, 246], `Value: Rs.${totalValue.toLocaleString()}`);
  drawBox(pdf, 140, 155, 40, 15, [239, 68, 68], `Out: ${outOfStock}`);
  
  pdf.addPage();

  // --- Current Stock Page ---
  pdf.setFontSize(20);
  pdf.setTextColor(11, 57, 84);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Current Stock Overview', 20, 20);
  pdf.setFontSize(10);
  pdf.setTextColor('#333');
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Total Items: ${totalItems} | Total Value: Rs.${totalValue.toLocaleString()}`, 20, 28);

  const stockData = items.map((item) => [
    item.name || 'N/A',
    item.type || 'N/A',
    item.seller || 'N/A',
    item.amount || '0',
    item.metric || 'Units',
    item.unitPrice ? `Rs.${Number(item.unitPrice).toLocaleString()}` : '0',
    item.amount && item.unitPrice ? `Rs.${(item.amount * item.unitPrice).toLocaleString()}` : '0',
    item.status || 'active',
  ]);

  const stockColumns = [
    'Item Name',
    'Type',
    'Seller',
    'Quantity',
    'Unit',
    'Unit Price',
    'Total Value',
    'Status',
  ];

  pdf.autoTable({
    head: [stockColumns],
    body: stockData,
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [11, 57, 84],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 25 },
      2: { cellWidth: 25 },
      3: { cellWidth: 18 },
      4: { cellWidth: 18 },
      5: { cellWidth: 22 },
      6: { cellWidth: 25 },
      7: { cellWidth: 18 },
    },
    margin: { left: 20, right: 20 },
  });

  // --- Stock Analysis Page ---
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.setTextColor(11, 57, 84);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Stock Analysis', 20, 30);

  // Group items by type
  const typeAnalysis = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = {
        count: 0,
        totalAmount: 0,
        totalValue: 0,
        items: []
      };
    }
    acc[item.type].count++;
    acc[item.type].totalAmount += item.amount || 0;
    acc[item.type].totalValue += (item.amount * item.unitPrice) || 0;
    acc[item.type].items.push(item.name);
    return acc;
  }, {});

  let yPosition = 50;
  Object.entries(typeAnalysis).forEach(([type, data]) => {
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 30;
    }
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(type, 20, yPosition);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Items: ${data.count} | Quantity: ${data.totalAmount} | Value: Rs.${data.totalValue.toLocaleString()}`, 20, yPosition + 6);
    yPosition += 15;
  });

  // --- Stock Alerts ---
  const lowStockItems = items.filter(item => item.amount > 0 && item.amount < 10);
  const outOfStockItems = items.filter(item => item.amount === 0);
  
  if (lowStockItems.length > 0 || outOfStockItems.length > 0) {
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(239, 68, 68); // Red color for alerts
    pdf.setFont('helvetica', 'bold');
    pdf.text('⚠ Stock Alerts', 20, 30);
    
    yPosition = 45;
    
    if (outOfStockItems.length > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(220, 38, 38);
      pdf.text('Out of Stock Items:', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setTextColor('#333');
      outOfStockItems.forEach(item => {
        pdf.text(`• ${item.name} (${item.type}) - Seller: ${item.seller}`, 25, yPosition);
        yPosition += 5;
      });
      yPosition += 10;
    }
    
    if (lowStockItems.length > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(251, 146, 60); // Orange color
      pdf.text('Low Stock Items (< 10 units):', 20, yPosition);
      yPosition += 8;
      
      pdf.setFontSize(10);
      pdf.setTextColor('#333');
      lowStockItems.forEach(item => {
        pdf.text(`• ${item.name} (${item.type}) - Current: ${item.amount} units`, 25, yPosition);
        yPosition += 5;
      });
    }
  }

  // --- Buyer Orders Page (if any) ---
  if (buyerOrders && buyerOrders.length > 0) {
    pdf.addPage();
    pdf.setFontSize(18);
    pdf.setTextColor(11, 57, 84);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Recent Re-Stock Orders', 20, 30);

    const orderData = [];
    buyerOrders.slice(0, 10).forEach(order => {
      order.items.forEach(item => {
        orderData.push([
          order.customerName || 'N/A',
          item.type || 'N/A',
          item.amount || '0',
          item.metric || 'Units',
          item.unitPrice ? `Rs.${Number(item.unitPrice).toLocaleString()}` : '0',
          item.lineTotal ? `Rs.${Number(item.lineTotal).toLocaleString()}` : '0',
          new Date(order.createdAt).toLocaleDateString('en-GB')
        ]);
      });
    });

    const orderColumns = [
      'Customer/Site',
      'Item Type',
      'Quantity',
      'Unit',
      'Unit Price',
      'Total',
      'Date'
    ];

    pdf.autoTable({
      head: [orderColumns],
      body: orderData,
      startY: 40,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [11, 57, 84],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
  }

  // --- Summary Page ---
  pdf.addPage();
  pdf.setFontSize(18);
  pdf.setTextColor(11, 57, 84);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Inventory Summary', 20, 30);

  // Calculate summary statistics
  const activeItems = items.filter(item => item.status === 'active').length;
  const archivedItems = items.filter(item => item.status === 'archived').length;
  const averageUnitPrice = items.length > 0 
    ? (items.reduce((sum, item) => sum + (item.unitPrice || 0), 0) / items.length).toFixed(2)
    : 0;
  const totalStock = items.reduce((sum, item) => sum + (item.amount || 0), 0);

  // Draw summary boxes
  drawBox(pdf, 20, 50, 60, 20, [34, 197, 94], `Active: ${activeItems}`, '#fff', 12);
  drawBox(pdf, 85, 50, 60, 20, [156, 163, 175], `Archived: ${archivedItems}`, '#fff', 12);
  drawBox(pdf, 20, 75, 60, 20, [59, 130, 246], `Total Stock: ${totalStock}`, '#fff', 12);
  drawBox(pdf, 85, 75, 60, 20, [251, 146, 60], `Avg Price: Rs.${averageUnitPrice}`, '#fff', 12);

  // Top sellers
  const sellerStats = items.reduce((acc, item) => {
    if (!acc[item.seller]) {
      acc[item.seller] = { count: 0, value: 0 };
    }
    acc[item.seller].count++;
    acc[item.seller].value += (item.amount * item.unitPrice) || 0;
    return acc;
  }, {});

  const topSellers = Object.entries(sellerStats)
    .sort((a, b) => b[1].value - a[1].value)
    .slice(0, 5);

  pdf.setFontSize(14);
  pdf.setTextColor('#333');
  pdf.text('Top Suppliers:', 20, 105);
  
  yPosition = 115;
  pdf.setFontSize(10);
  topSellers.forEach(([seller, stats], index) => {
    pdf.text(`${index + 1}. ${seller} - ${stats.count} items, Rs.${stats.value.toLocaleString()}`, 25, yPosition);
    yPosition += 6;
  });

  // --- Footer on last page ---
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFontSize(10);
  pdf.setTextColor('#666');
  pdf.text(
    'Generated by AD Construction Inventory Management System',
    20,
    pageHeight - 20
  );
  pdf.text(
    `Page ${pdf.internal.getNumberOfPages()} | ${new Date().toLocaleString('en-GB')}`,
    20,
    pageHeight - 15
  );
  pdf.text(
    'Contact: info@adconstruction.com | +94 70 103 8400',
    20,
    pageHeight - 10
  );

  return pdf;
};

export const downloadInventoryReport = (items, buyerOrders = []) => {
  try {
    if (!items || !Array.isArray(items)) {
      console.error('Invalid inventory data:', items);
      return false;
    }
    const pdf = generateInventoryReport(items, buyerOrders);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const fileName = `Inventory_Report_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.pdf`;
    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

const inventoryPdfService = {
  generateInventoryReport,
  downloadInventoryReport,
};

export default inventoryPdfService;
