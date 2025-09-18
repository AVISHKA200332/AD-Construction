import React from "react";

function Footer() {
  return (
    <footer className="bg-[#0B3954] text-white mt-8 pt-8 border-t-4 border-[#F5CB5C]">
      <div className="flex flex-wrap justify-around gap-8 px-8">
        {/* Logo & tagline */}
        <div className="max-w-xs">
          <h2 className="text-[#F5CB5C] font-extrabold text-2xl">
            AD Construction
          </h2>
          <p className="text-gray-300 text-sm mt-2">
            Building the future, one brick at a time.
          </p>
        </div>

        {/* Quick Links */}
        <div className="min-w-[150px]">
          <h4 className="text-[#F5CB5C] font-semibold mb-3">Quick Links</h4>
          <nav className="flex flex-col space-y-2">
            <a
              href="#projects"
              className="hover:text-[#F5CB5C] transition-colors"
            >
              Projects
            </a>
            <a href="#tasks" className="hover:text-[#F5CB5C] transition-colors">
              Tasks
            </a>
            <a
              href="#materials"
              className="hover:text-[#F5CB5C] transition-colors"
            >
              Materials
            </a>
            <a
              href="#contact"
              className="hover:text-[#F5CB5C] transition-colors"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Contact Info */}
        <div className="min-w-[150px]">
          <h4 className="text-[#F5CB5C] font-semibold mb-3">Contact Us</h4>
          <p className="text-gray-300 text-sm">Email: info@adconstruction.com</p>
          <p className="text-gray-300 text-sm">Phone: +94 77 123 4567</p>
          <p className="text-gray-300 text-sm">
            Address: Anuradhapura, Sri Lanka
          </p>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="text-center mt-6 py-4 border-t border-white/20 text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} AD Construction | Built with ❤️ by our
          team
        </p>
      </div>
    </footer>
  );
}

export default Footer;
