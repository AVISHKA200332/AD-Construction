import React, { useState, useRef, useEffect } from "react";
import "./Nav.css";
import logo from "../../assets/logo.png";
import profilePic from "../../assets/profile.jpg"; // Add your profile pic here

function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // Close dropdown if clicked outside
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
    <nav className="nav">
      <div className="nav-container">

        {/* Logo */}
        <div className="nav-logo">
          <img src={logo} alt="Company Logo" className="company-logo" />
        </div>

        {/* Navigation Links */}
        <ul className={`nav-links ${menuOpen ? "nav-active" : ""}`}>
          <li><a href="Home">Dashboard</a></li>
          <li><a href="#projects">Projects</a></li>
          <li><a href="#tasks">Tasks</a></li>
          <li><a href="#budget">Budget</a></li>
          <li><a href="#inventory">Inventory</a></li>
          <li><a href="#messages">Messages</a></li>
          <li><a href="#reports">Reports</a></li>
          <li><a href="#settings">Settings</a></li>
        </ul>

        {/* Profile Section */}
        <div className="profile-container" ref={dropdownRef}>
          <img src={profilePic} alt="Profile" className="profile-pic" />
          <button
            className="profile-name-btn"
            onClick={toggleDropdown}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
          >
            John Doe ▼
          </button>

          {dropdownOpen && (
            <ul className="profile-dropdown">
              <li><a href="#profile">Profile</a></li>
              <li><a href="#change-password">Change Password</a></li>
              <li><a href="#logout">Logout</a></li>
            </ul>
          )}
        </div>

        {/* Burger Menu for Mobile */}
        <div 
          className={`burger ${menuOpen ? "toggle" : ""}`} 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          role="button"
          tabIndex={0}
          onKeyPress={e => { if(e.key === 'Enter') toggleMenu(); }}
        >
          <div className="line1"></div>
          <div className="line2"></div>
          <div className="line3"></div>
        </div>

      </div>
    </nav>
  );
}

export default Nav;
