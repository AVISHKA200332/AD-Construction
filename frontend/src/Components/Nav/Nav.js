import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";
import profilePic from "../../assets/profile.jpg";
import NotificationIcon from "./NotificationIcon";
import MessageInsert from "../MessaageInsert/MessageInsert";

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [role, setRole] = useState("");
  const [userData, setUserData] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recent, setRecent] = useState([]);
  const [users, setUsers] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ subject: "", message: "", recipientId: "" });
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      // Clear all authentication data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("ad_role");
      
      // Redirect to signin page
      navigate("/signin");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Try to read role and user data from storage set during sign-in
    const storedRole = localStorage.getItem("ad_role");
    const storedUserData = localStorage.getItem("userData");
    
    if (storedRole) setRole(storedRole);
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Notification: fetch unread inbox count
  useEffect(() => {
    const BASE_URL = "http://localhost:5000";
    let timer;
    const fetchUnread = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) { setUnreadCount(0); return; }
        const res = await axios.get(`${BASE_URL}/messages/inbox`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const msgs = res.data?.messages || [];
        const count = msgs.filter(m => (m.isRead === false) || (m.status === 'Unread')).length;
        setUnreadCount(count);
        // store top 5 recent by date
        const sorted = [...msgs].sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0));
        setRecent(sorted.slice(0,5));
      } catch (e) {
        // silent fail
      }
    };
    fetchUnread();
    timer = setInterval(fetchUnread, 30000); // poll every 30s
    return () => { if (timer) clearInterval(timer); };
  }, []);

  // Load users for quick compose
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/users");
        setUsers(res.data.users || []);
      } catch (_) {}
    };
    loadUsers();
  }, []);

  const communicationPath = (() => {
    switch (role) {
      case "Admin": return "/admin/communication";
      case "Site Manager": return "/site-manager/communication";
      case "Supervisor": return "/supervisor/communication";
      case "Labor": return "/labor/communication";
      case "Client":
      default: return "/client/communication";
    }
  })();

  const openCompose = () => {
    setForm({ subject: "", message: "", recipientId: "" });
    setModalOpen(true);
    setNotifOpen(false);
  };

  const submitCompose = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      await axios.post("http://localhost:5000/messages", {
        subject: form.subject,
        message: form.message,
        recipientId: form.recipientId,
      }, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setModalOpen(false);
      // After sending, navigate to Sent for visibility
      navigate(communicationPath);
    } catch (err) {
      alert(err.response?.data?.error || err.message || "Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur bg-[#0B3954]/80 text-white px-6 py-3 border-b border-white/10 shadow-lg">
      {/* Accent gradient bar */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#F5CB5C] via-transparent to-[#F5CB5C]/60 pointer-events-none"></div>
      <div className="relative flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Company Logo"
            className="h-12 w-auto object-contain rounded"
          />
          <span className="ml-3 text-lg font-extrabold tracking-wide hidden sm:inline">AD Construction</span>
        </div>

        {/* Nav Links */}
        <ul
          className={`fixed top-[70px] right-0 h-[calc(100vh-70px)] w-full bg-[#0B3954] lg:bg-transparent flex-col items-center gap-6 pt-8 transform transition-transform duration-300 lg:static lg:h-auto lg:w-auto lg:flex lg:flex-row lg:gap-2 lg:pt-0 ${
            menuOpen ? "translate-x-0 flex" : "translate-x-full lg:translate-x-0 lg:flex"
          }`}
        >
          {(() => {
            const isClient = role === "Client";
            const isAdmin = role === "Admin";
            const isSM = role === "Site Manager";
            const isSup = role === "Supervisor";
            const isLabor = role === "Labor";

            let links = [];
            if (isClient) {
              const base = "/client";
              links = [
                { to: `${base}/dashboard`, label: "Dashboard" },
                { to: `${base}/projects`, label: "Projects" },
                { to: `${base}/financial`, label: "Financial" },
                { to: `${base}/reports`, label: "Reports" },
                { to: `${base}/communication`, label: "Communication" },
                { to: `${base}/inventory`, label: "Inventory" },
                { to: `${base}/settings`, label: "Settings" },
              ];
            } else if (isAdmin) {
              const base = "/admin";
              links = [
                { to: `${base}/dashboard`, label: "Dashboard" },
                { to: `${base}/users`, label: "Users" },
                { to: `${base}/projects`, label: "Projects" },
                { to: `${base}/financial`, label: "Financial" },
                { to: `${base}/reports`, label: "Reports" },
                { to: `${base}/communication`, label: "Communication" },
                { to: `${base}/settings`, label: "Settings" },
              ];
            } else if (isSM) {
              const base = "/site-manager";
              links = [
                { to: `${base}/dashboard`, label: "Dashboard" },
                { to: `${base}/projects`, label: "Projects" },
                { to: `${base}/financial`, label: "Financial" },
                { to: `${base}/reports`, label: "Reports" },
                { to: `${base}/communication`, label: "Communication" },
                { to: `${base}/inventory`, label: "Inventory" },
                { to: `${base}/settings`, label: "Settings" },
              ];
            } else if (isSup) {
              const base = "/supervisor";
              links = [
                { to: `${base}/dashboard`, label: "Dashboard" },
                { to: `${base}/projects`, label: "Projects" },
                { to: `${base}/financial`, label: "Financial" },
                { to: `${base}/reports`, label: "Reports" },
                { to: `${base}/communication`, label: "Communication" },
                { to: `${base}/inventory`, label: "Inventory" },
                { to: `${base}/settings`, label: "Settings" },
              ];
            } else if (isLabor) {
              const base = "/labor";
              links = [
                { to: `${base}/dashboard`, label: "Dashboard" },
                { to: `${base}/projects`, label: "Projects" },
                { to: `${base}/reports`, label: "Reports" },
                { to: `${base}/communication`, label: "Communication" },
                { to: `${base}/inventory`, label: "Inventory" },
                { to: `${base}/settings`, label: "Settings" },
              ];
            } else {
              // Guest
              links = [
                { to: "/", label: "Home" },
                { to: "/projects", label: "Projects" },
              ];
            }

            return links.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg font-semibold transition relative group ${
                      isActive
                        ? "text-[#0B3954] bg-[#F5CB5C]"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`
                  }
                >
                  <span className="relative z-10">{item.label}</span>
                  <span className="absolute inset-x-2 -bottom-[2px] h-[2px] bg-gradient-to-r from-transparent via-[#F5CB5C] to-transparent opacity-0 group-hover:opacity-100 transition" />
                </NavLink>
              </li>
            ));
          })()}
          {/* Static anchors removed in favor of typed routes */}
          <li className="block lg:hidden">
            <Link to="/signin" className="px-3 py-2 rounded-lg font-semibold text-white/90 hover:text-white hover:bg-white/10 transition">
              Sign In
            </Link>
          </li>
          <li className="block lg:hidden">
            <Link to="/signup" className="px-3 py-2 rounded-lg font-semibold text-white/90 hover:text-white hover:bg-white/10 transition">
              Sign Up
            </Link>
          </li>
        </ul>

        {/* Notification & Profile Section */}
        <div className="relative flex items-center ml-4 gap-4" ref={dropdownRef}>
          <button onClick={() => setNotifOpen(!notifOpen)} title="Messages" className="relative">
            <NotificationIcon count={unreadCount} />
          </button>
          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-96 bg-white text-black rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-semibold text-[#0B3954]">Messages</div>
                <div className="text-xs text-gray-500">Unread: {unreadCount}</div>
              </div>
              <div className="max-h-80 overflow-auto">
                {recent.length === 0 && (
                  <div className="px-4 py-6 text-gray-500 text-sm">No recent messages</div>
                )}
                {recent.map(m => (
                  <button
                    key={m._id}
                    onClick={() => { setNotifOpen(false); navigate(communicationPath); }}
                    className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 ${!m.isRead ? 'bg-yellow-50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-[#0B3954] line-clamp-1">{m.subject}</div>
                      <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${m.status==='Unread'?'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700'}`}>{m.status || (m.isRead?'Read':'Unread')}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">From {m.sender} • {m.date ? new Date(m.date).toLocaleDateString() : ''}</div>
                    {m.message && <div className="text-xs text-gray-500 mt-1 line-clamp-1">{m.message}</div>}
                  </button>
                ))}
              </div>
              <div className="px-4 py-3 flex items-center justify-between">
                <Link to={communicationPath} onClick={() => setNotifOpen(false)} className="text-sm text-[#0B3954] hover:underline">Open Communication</Link>
                <button onClick={openCompose} className="px-3 py-1.5 rounded-md bg-[#0B3954] text-white text-sm hover:bg-[#0a2f46]">+ New</button>
              </div>
            </div>
          )}
          
          {/* Profile Button */}
          <button
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            className="flex items-center gap-2 hover:bg-white/10 rounded-lg p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]/60"
          >
            <img
              src={profilePic}
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-white/70 object-cover shadow"
            />
            <div className="hidden sm:block text-left">
              <div className="text-sm font-semibold">{userData?.name || "Guest User"}</div>
              <div className="text-xs text-gray-300">{role || "Client"}</div>
            </div>
            <svg 
              className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl z-50 border border-gray-200 overflow-hidden">
              {/* User Info Section */}
              <div className="p-4 bg-gradient-to-r from-[#0B3954] to-[#1a4c6b] text-white">
                <div className="flex items-center gap-3">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-12 h-12 rounded-full border-2 border-white/70 object-cover"
                  />
                  <div>
                    <div className="font-semibold text-lg">{userData?.name || "Guest User"}</div>
                    <div className="text-sm text-gray-200">{userData?.gmail || "guest@example.com"}</div>
                    <div className="text-xs text-gray-300">Role: {role || "Client"}</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  View Profile
                </Link>
                
                <Link
                  to="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </Link>

                <div className="border-t border-gray-200 my-2"></div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Burger Icon */}
        <div
          className="lg:hidden flex flex-col justify-between w-7 h-6 cursor-pointer ml-4"
          onClick={toggleMenu}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") toggleMenu();
          }}
        >
          <span
            className={`block w-full h-[3px] bg-white transition-transform ${
              menuOpen ? "rotate-[-45deg] translate-y-[9px]" : ""
            }`}
          ></span>
          <span
            className={`block w-full h-[3px] bg-white transition-opacity ${
              menuOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`block w-full h-[3px] bg-white transition-transform ${
              menuOpen ? "rotate-[45deg] -translate-y-[9px]" : ""
            }`}
          ></span>
        </div>
      </div>

      {/* Quick Compose Modal */}
      <MessageInsert
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={submitCompose}
        form={form}
        setForm={setForm}
        submitting={submitting}
        editingId={null}
        users={users}
      />
    </nav>
  );
}

export default Nav;
