import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail, sanitizeInput } from "../../utils/validation";
import axios from "axios";
function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: "", 
    gmail: "", 
    password: "", 
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ 
      ...prev, 
      [name]: name === 'name' ? sanitizeInput(value) : value 
    }));
    // Clear errors when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = "Name must be at least 2 characters";
    if (!form.gmail || !validateEmail(form.gmail)) e.gmail = "Enter a valid gmail"; // Changed from email to gmail
    if (!form.password || form.password.length < 6) e.password = "Password must be 6+ chars";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setLoading(true);
      setApiError("");

      // Call backend signup API. Expecting { name, gmail, password }
      const response = await axios.post("http://localhost:5000/signup", {
        name: form.name,
        gmail: form.gmail, // Changed from email to gmail
        password: form.password
      });

      if (response.data.success) {
        // Redirect to login page after signup
        navigate("/signin");
      }
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0B3954] to-[#092638]">
      <div className="w-full max-w-md bg-white/95 rounded-xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-[#0B3954] mb-1">Create your account</h1>
        <p className="text-sm text-gray-500 mb-6">Join AD Construction to get started with your projects.</p>

        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="Jane Doe"
            />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gmail</label>
            <input
              type="email"
              name="gmail" 
              value={form.gmail}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="you@gmail.com"
            />
            {errors.gmail && <p className="text-sm text-red-600 mt-1">{errors.gmail}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L15 15M21 3l-6.878 6.878" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L15 15M21 3l-6.878 6.878" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F5CB5C] text-[#0B3954] font-semibold py-2 rounded-lg hover:bg-[#e5bb4f] transition disabled:opacity-70"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Already have an account? {""}
          <Link to="/signin" className="text-[#0B3954] font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;