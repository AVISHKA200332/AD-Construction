import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

function Footer() {
  return (
    <footer className="relative mt-12 text-white bg-[#0B3954] border-t border-white/10">
      {/* Top accent gradient */}
      <div className="absolute inset-x-0 -top-[2px] h-[2px] bg-gradient-to-r from-[#F5CB5C] via-transparent to-[#F5CB5C]/60" />

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              <img src={logo} alt="AD Construction" className="h-12 w-12 rounded shadow" />
              <h2 className="text-2xl font-extrabold tracking-wide">AD Construction</h2>
            </div>
            <p className="text-gray-300 mt-3 text-sm leading-relaxed max-w-sm">
              Build faster. Manage smarter. A modern platform to plan, track, and deliver construction projects.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.772-1.63 1.562v1.875h2.773l-.443 2.89h-2.33v6.987C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M19.633 7.997c.013.18.013.36.013.54 0 5.49-4.18 11.82-11.82 11.82-2.35 0-4.53-.69-6.36-1.88.33.04.64.05.98.05a8.36 8.36 0 0 0 5.18-1.78 4.18 4.18 0 0 1-3.9-2.9c.26.04.52.07.79.07.38 0 .76-.05 1.11-.15a4.17 4.17 0 0 1-3.34-4.1v-.05c.56.31 1.21.5 1.9.53a4.16 4.16 0 0 1-1.86-3.46c0-.77.21-1.5.58-2.13a11.84 11.84 0 0 0 8.59 4.36 4.7 4.7 0 0 1-.1-.95 4.17 4.17 0 0 1 7.21-2.85 8.22 8.22 0 0 0 2.64-1.01 4.2 4.2 0 0 1-1.83 2.3 8.34 8.34 0 0 0 2.4-.65 8.96 8.96 0 0 1-2.08 2.14z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zM8.5 8h3.8v2.2h.05c.53-1 1.84-2.2 3.8-2.2 4.06 0 4.8 2.67 4.8 6.15V24h-4v-7.1c0-1.7-.04-3.88-2.36-3.88-2.36 0-2.72 1.85-2.72 3.76V24h-4V8z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#F5CB5C] font-semibold mb-3 tracking-wide">Quick Links</h4>
            <nav className="grid grid-cols-1 gap-2 text-gray-200">
              <Link to="/dashboard" className="hover:text-[#F5CB5C] transition-colors">Dashboard</Link>
              <Link to="/projects" className="hover:text-[#F5CB5C] transition-colors">Projects</Link>
              <Link to="/inventory" className="hover:text-[#F5CB5C] transition-colors">Inventory</Link>
              <Link to="/reports" className="hover:text-[#F5CB5C] transition-colors">Reports</Link>
              <Link to="/settings" className="hover:text-[#F5CB5C] transition-colors">Settings</Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[#F5CB5C] font-semibold mb-3 tracking-wide">Contact</h4>
            <ul className="space-y-2 text-gray-200 text-sm">
              <li>Email: info@adconstruction.com</li>
              <li>Phone: +94 77 123 4567</li>
              <li>Address: Anuradhapura, Sri Lanka</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[#F5CB5C] font-semibold mb-3 tracking-wide">Stay Updated</h4>
            <p className="text-gray-300 text-sm mb-3">Subscribe to get product updates and best practices.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}
              className="flex w-full max-w-sm overflow-hidden rounded-lg border border-white/10 bg-white/5 backdrop-blur"
            >
              <input
                type="email"
                placeholder="Your email"
                required
                className="flex-1 bg-transparent px-3 py-2 text-sm placeholder:text-gray-300 focus:outline-none"
              />
              <button type="submit" className="px-3 py-2 text-sm font-semibold bg-[#F5CB5C] text-[#0B3954] hover:bg-[#e5bb4f] transition">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-gray-300 text-sm gap-3">
          <p>© {new Date().getFullYear()} AD Construction. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-[#F5CB5C]">Privacy</Link>
            <Link to="/terms" className="hover:text-[#F5CB5C]">Terms</Link>
            <Link to="/signin" className="hover:text-[#F5CB5C]">Sign In</Link>
            <Link to="/signup" className="hover:text-[#F5CB5C]">Sign Up</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
