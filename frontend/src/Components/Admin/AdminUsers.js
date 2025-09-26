/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import searchIcon from "../../assets/icons/search.png";
import filterIcon from "../../assets/icons/filter.png";
import fileTextIcon from "../../assets/icons/file-text.png";
import plusIcon from "../../assets/icons/plus.png";
import AddUserModel from "./AddUserModel";
import userService from "../../services/userService";
import UserPdfServices from "../../services/UserPdfServices";
import { validateUser, formatUserRole, safeFormatPhoneNumber } from "../../utils/userValidation";

function AdminUsers() {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); // "all", "user", "admin", "manager"

  // Create a ref for the print component
  const componentRef = useRef();

  // Print configuration using react-to-print
  const handlePrint = useReactToPrint({
    content: () => componentRef.current, // Reference to the component to print
    documentTitle: "Users Report", // Title of the printed document
    onAfterPrint: () => alert("Users Report Successfully Downloaded!"), // Callback after printing
  });

  // New User State
  const [newUser, setNewUser] = useState({
    name: "",
    gmail: "",
    phone: "",
    role: "Client",
    age: "",
    address: "",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await userService.getAllUsers();
      
      if (response.users) {
        setUsers(response.users);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, currentPage, sortBy, sortOrder]);

  // This file was renamed to AdminUsers.js

  return (
    <div ref={componentRef}>
      {/* User management UI here */}
    </div>
  );
}

export default AdminUsers;
