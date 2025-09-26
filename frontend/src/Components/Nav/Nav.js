import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import profilePic from "../../assets/profile.jpg";
import NotificationIcon from "./NotificationIcon";

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState("");
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Try to read role from storage set during sign-in
    const storedRole = localStorage.getItem("ad_role");
    if (storedRole) setRole(storedRole);
  }, []);

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
          <NotificationIcon count={3} />
          <img
            src={profilePic}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-white/70 object-cover mr-2 shadow"
          />
          <button
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            className="font-semibold flex items-center gap-2 hover:text-[#F5CB5C] focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]/60 rounded"
          >
            <span className="hidden sm:inline">{role || "Guest"}</span>
            <span className="text-sm opacity-80">▼</span>
          </button>

          {dropdownOpen && (
            <ul className="absolute top-full right-0 mt-2 w-48 bg-[#0B3954]/95 backdrop-blur border border-white/10 rounded-md shadow-xl z-50">
              <li>
                <a
                  href="#profile"
                  className="block px-4 py-2 hover:bg-white/10"
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  href="#change-password"
                  className="block px-4 py-2 hover:bg-white/10"
                >
                  Change Password
                </a>
              </li>
              <li>
                <a
                  href="#logout"
                  className="block px-4 py-2 hover:bg-white/10"
                >
                  Logout
                </a>
              </li>
            </ul>
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
    </nav>
  );
}

export default Nav;
