import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function generateMessagesPDF(messages = []) {
  const doc = new jsPDF({ orientation: 'landscape' });

  const title = 'Messages Report';
  doc.setFontSize(16);
  doc.text(title, 14, 16);

  const columns = [
    { header: 'Subject', dataKey: 'subject' },
    { header: 'Sender', dataKey: 'sender' },
    { header: 'Recipient', dataKey: 'recipient' },
    { header: 'Date', dataKey: 'date' },
    { header: 'Status', dataKey: 'status' },
  ];

  const rows = messages.map((m) => ({
    subject: m.subject || '',
    sender: m.sender || '',
    recipient: m.recipient || '',
    date: m.date ? new Date(m.date).toISOString().slice(0, 10) : '',
    status: m.status || '',
  }));

  autoTable(doc, {
    headStyles: { fillColor: [11, 57, 84] },
    styles: { fontSize: 10 },
    startY: 22,
    columns,
    body: rows,
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`messages_${dateStr}.pdf`);
}

export function generateServicesPDF(services = []) {
  const doc = new jsPDF({ orientation: 'landscape' });

  const title = 'Services Report';
  doc.setFontSize(16);
  doc.text(title, 14, 16);

  const columns = [
    { header: 'Service Type', dataKey: 'serviceType' },
    { header: 'Provider', dataKey: 'provider' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Date', dataKey: 'date' },
    { header: 'Cost', dataKey: 'cost' },
  ];

  const rows = services.map((s) => ({
    serviceType: s.serviceType || '',
    provider: s.provider || '',
    status: s.status || '',
    date: s.date ? new Date(s.date).toISOString().slice(0, 10) : '',
    cost: s.cost != null ? String(s.cost) : '',
  }));

  autoTable(doc, {
    headStyles: { fillColor: [11, 57, 84] },
    styles: { fontSize: 10 },
    startY: 22,
    columns,
    body: rows,
  });

  const dateStr = new Date().toISOString().slice(0, 10);
  doc.save(`services_${dateStr}.pdf`);
}

