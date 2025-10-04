import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

function Home() {
  return (
    <div className="min-h-[80vh] bg-gradient-to-b from-[#0B3954] via-[#0b3954]/90 to-[#092638] text-white">
      <section className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <img
              src={logo}
              alt="AD Construction"
              className="h-14 w-14 rounded-md shadow-md"
            />
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              AD Construction
            </h1>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Build faster. Manage smarter.
          </h2>
          <p className="mt-4 text-[#E3EAF2] text-lg md:text-xl max-w-2xl">
            A modern platform to plan, track, and deliver construction projects
            — all in one place.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/signin"
              className="inline-flex justify-center items-center px-6 py-3 bg-[#F5CB5C] text-[#0B3954] font-semibold rounded-lg shadow hover:bg-[#e5bb4f] transition"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex justify-center items-center px-6 py-3 border border-[#F5CB5C] text-[#F5CB5C] font-semibold rounded-lg hover:bg-[#F5CB5C]/10 transition"
            >
              Create an account
            </Link>
            <Link
              to="/apply"
              className="inline-flex justify-center items-center px-6 py-3 bg-white/10 text-white font-semibold rounded-lg border border-white/20 hover:bg-white/20 transition"
            >
              Apply for a Job
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-2xl font-bold">50+</p>
              <p className="text-sm text-[#E3EAF2]">Active Projects</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-2xl font-bold">15%</p>
              <p className="text-sm text-[#E3EAF2]">Faster Delivery</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-2xl font-bold">99.9%</p>
              <p className="text-sm text-[#E3EAF2]">Uptime</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-[#E3EAF2]">Support</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="aspect-[4/3] w-full rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <img
              src="/images/home.jpg" // put your image in public/images/
              alt="Dashboard Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
