import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>AD Construction</h2>
          <p>Building the future, one brick at a time.</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <a href="#projects">Projects</a>
          <a href="#tasks">Tasks</a>
          <a href="#materials">Materials</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p>Email: info@adconstruction.com</p>
          <p>Phone: +94 77 123 4567</p>
          <p>Address: Anuradhapura, Sri Lanka</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} AD Construction | Built with ❤️ by our team</p>
      </div>
    </footer>
  );
}

export default Footer;
