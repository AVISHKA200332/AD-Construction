// Utility to generate PDF invoice using jsPDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateInvoicePDF({ orderId, customer, cart, total }) {
  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text('INVOICE', 14, 18);
  doc.setFontSize(12);
  doc.text(`Order #${orderId}`, 14, 26);
  doc.text('AD Construction', 150, 18, { align: 'right' });
  doc.text('Colombo, Sri Lanka', 150, 24, { align: 'right' });

  doc.setFontSize(14);
  doc.text('Billed To:', 14, 38);
  doc.setFontSize(12);
  doc.text(customer.name, 14, 44);
  doc.text(`${customer.email} | ${customer.phone}`, 14, 50);
  doc.text(customer.address, 14, 56);

  // Table
  autoTable(doc, {
    head: [['Item', 'Qty', 'Unit Price', 'Total']],
    body: cart.map(item => [
      item.name,
      item.quantity,
      `Rs. ${Number(item.unitPrice).toLocaleString()}`,
      `Rs. ${(item.unitPrice * item.quantity).toLocaleString()}`
    ]),
    startY: 65,
    theme: 'grid',
    headStyles: { fillColor: [44, 62, 80] },
    styles: { fontSize: 11 },
  });

  const finalY = doc.lastAutoTable?.finalY || 80;
  doc.setFontSize(14);
  doc.text(`Total: Rs. ${total.toLocaleString()}`, 14, finalY + 12);

  doc.setFontSize(10);
  doc.text('Thank you for your business!', 14, finalY + 22);

  doc.save(`Invoice_${orderId}.pdf`);
}
