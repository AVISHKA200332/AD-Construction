
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../assets/logo.png";

const API_URL = "/users";  // Simple path without /api

const getAllUsers = async (params) => {
  const res = await axios.get(API_URL, { params });
  return res.data;
};

const createUser = async (user) => {
  const res = await axios.post(API_URL, user);
  return res.data;
};

const updateUser = async (id, user) => {
  const res = await axios.put(`${API_URL}/${id}`, user);
  return res.data;
};
const deleteUser = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};

// PDF export function
// options: { role?: string, search?: string }
const downloadUserReport = (users, options = {}) => {
  const doc = new jsPDF();
  // First page: logo, company name, date/time
  const logoImg = new Image();
  logoImg.src = logo; // webpack asset import
  doc.addImage(logoImg, 'PNG', 80, 20, 50, 30); // Centered logo
  doc.setFontSize(22);
  doc.text("AD Construction", 105, 60, { align: 'center' });
  doc.setFontSize(12);
  doc.text(`Report Generated: ${new Date().toLocaleString()}`, 105, 70, { align: 'center' });

  // Filters summary
  const roleLabel = options.role || 'All';
  const searchLabel = options.search ? `, Search: ${options.search}` : '';
  doc.text(`Filters — Role: ${roleLabel}${searchLabel}`, 105, 78, { align: 'center' });

  doc.addPage();
  doc.setFontSize(16);
  doc.text(`User Details — Role: ${roleLabel}`, 14, 18);

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
  doc.text(statsText, 14, doc.lastAutoTable.finalY + 10);
  // File name with role
  const roleSlug = (roleLabel || 'All').toString().toLowerCase().replace(/\s+/g, '_');
  doc.save(`users_report_${roleSlug}.pdf`);
};

const UserPdfServices = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  downloadUserReport,
};

export default UserPdfServices;