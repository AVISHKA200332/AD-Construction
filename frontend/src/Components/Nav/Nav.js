import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import profilePic from "../../assets/profile.jpg";
import NotificationIcon from "./NotificationIcon";

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  return (
    <nav className="bg-[#0B3954] text-white px-6 py-3 shadow-md">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={logo}
            alt="Company Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Nav Links */}
        <ul
          className={`fixed top-[70px] right-0 h-[calc(100vh-70px)] w-full bg-[#0B3954] flex-col items-center gap-6 pt-8 transform transition-transform duration-300 lg:static lg:h-auto lg:w-auto lg:bg-transparent lg:flex lg:flex-row lg:gap-6 lg:pt-0 ${
            menuOpen ? "translate-x-0 flex" : "translate-x-full lg:translate-x-0 lg:flex"
          }`}
        >
          <li>
            <Link to="/" className="font-semibold hover:text-[#F5CB5C] transition">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/users" className="font-semibold hover:text-[#F5CB5C] transition">
              Users
            </Link>
          </li>
          <li>
            <Link to="/projects" className="font-semibold hover:text-[#F5CB5C] transition">
              Projects
            </Link>
          </li>
          <li>
            <a href="#inventory" className="font-semibold hover:text-[#F5CB5C] transition">
              Inventory
            </a>
          </li>
          <li>
            <a href="#Communication" className="font-semibold hover:text-[#F5CB5C] transition">
              Communication
            </a>
          </li>
          <li>
            <Link to="/financial" className="font-semibold hover:text-[#F5CB5C] transition">
              Financial
            </Link>
          </li>
          <li>
            <a href="#reports" className="font-semibold hover:text-[#F5CB5C] transition">
              Reports
            </a>
          </li>
          <li>
            <a href="#settings" className="font-semibold hover:text-[#F5CB5C] transition">
              Settings
            </a>
          </li>
        </ul>

        {/* Notification & Profile Section */}
        <div className="relative flex items-center ml-4 gap-4" ref={dropdownRef}>
          <NotificationIcon count={3} />
          <img
            src={profilePic}
            alt="Profile"
            className="w-14 h-14 rounded-full border-2 border-white object-cover mr-2"
          />
          <button
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            className="font-semibold flex items-center gap-1 hover:text-[#F5CB5C] focus:outline-none focus:ring-2 focus:ring-[#F5CB5C] rounded"
          >
            John Doe <span>▼</span>
          </button>

          {dropdownOpen && (
            <ul className="absolute top-full right-0 mt-2 w-44 bg-[#0B3954] border border-[#F5CB5C] rounded-md shadow-lg z-50">
              <li>
                <a
                  href="#profile"
                  className="block px-4 py-2 hover:bg-[#F5CB5C] hover:text-[#0B3954]"
                >
                  Profile
                </a>
              </li>
              <li>
                <a
                  href="#change-password"
                  className="block px-4 py-2 hover:bg-[#F5CB5C] hover:text-[#0B3954]"
                >
                  Change Password
                </a>
              </li>
              <li>
                <a
                  href="#logout"
                  className="block px-4 py-2 hover:bg-[#F5CB5C] hover:text-[#0B3954]"
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
