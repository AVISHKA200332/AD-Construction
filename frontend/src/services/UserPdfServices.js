import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "https://ad-construction-1.onrender.com/users";

function authHeaders() {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const getAllUsers = async (params) => {
  const res = await axios.get(API_URL, { params, headers: authHeaders() });
  return res.data;
};

const createUser = async (user) => {
  const res = await axios.post(API_URL, user, { headers: authHeaders() });
  return res.data;
};

const updateUser = async (id, user) => {
  const res = await axios.put(`${API_URL}/${id}`, user, { headers: authHeaders() });
  return res.data;
};

const deleteUser = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`, { headers: authHeaders() });
  return res.data;
};

// PDF export function
const downloadUserReport = (users) => {
  const doc = new jsPDF();
  // First page: logo, company name, date/time
  const logoImg = new Image();
  logoImg.src = require('../assets/logo.png');
  doc.addImage(logoImg, 'PNG', 80, 20, 50, 30); // Centered logo
  doc.setFontSize(22);
  doc.text("AD Construction", 105, 60, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 105, 70, { align: 'center' });

  doc.addPage();
  doc.setFontSize(16);
  doc.text("User Details Table", 14, 18);

  autoTable(doc, {
    startY: 24,
    head: [[
      "Name",
      "Email",
      "Phone",
      "Role",
      "Age",
      "Address",
      "Created",
      "Updated"
    ]],
    body: users.map(u => [
      u.name || "-",
      u.gmail || "-",
      u.phone || "-",
      u.role || "-",
      u.age || "-",
      u.address || "-",
      u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-",
      u.updatedAt ? new Date(u.updatedAt).toLocaleDateString() : "-"
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] },
    alternateRowStyles: { fillColor: [230, 240, 255] },
  });

  // Quick stats below table
  const totalUsers = users.length;
  const roleCounts = {};
  users.forEach(u => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });
  let statsText = `Total Users: ${totalUsers}\n`;
  Object.keys(roleCounts).forEach(role => {
    statsText += `${role}: ${roleCounts[role]}\n`;
  });
  doc.setFontSize(12);
  doc.text(statsText, 14, doc.lastAutoTable.finalY + 10);

  doc.save("users_report.pdf");
};

const userPdfService = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  downloadUserReport,
};

export default userPdfService;