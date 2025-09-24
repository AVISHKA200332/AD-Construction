import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateMessagesPDF(messages) {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [['Subject', 'Sender', 'Recipient', 'Date', 'Status']],
    body: messages.map(m => [
      m.subject,
      m.sender,
      m.recipient,
      m.date ? new Date(m.date).toISOString().slice(0,10) : '',
      m.status
    ]),
    startY: 28
  });
  doc.setFontSize(18);
  doc.text('Messages', 14, 18);
  doc.save('messages.pdf');
}

export function generateServicesPDF(services) {
  const doc = new jsPDF();
  autoTable(doc, {
    head: [['Service Type', 'Provider', 'Status', 'Date', 'Cost']],
    body: services.map(svc => [
      svc.serviceType,
      svc.provider,
      svc.status,
      svc.date ? new Date(svc.date).toISOString().slice(0,10) : '',
      svc.cost
    ]),
    startY: 28
  });
  doc.setFontSize(18);
  doc.text('Services', 14, 18);
  doc.save('services.pdf');
}
