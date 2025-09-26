import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEmail } from "../../utils/validation";
import axios from "axios";

function SignIn() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", role: "Client" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    if (apiError) setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.email || !validateEmail(form.email)) e.email = "Enter a valid email";
    if (!form.password || form.password.length < 6) e.password = "Password must be 6+ chars";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      setLoading(true);
      setApiError("");

      const response = await axios.post("/login", {
        email: form.email,
        password: form.password
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("userData", JSON.stringify(response.data.user));
        localStorage.setItem("ad_role", response.data.user.role);

        // Check for role mismatch for all roles
        if (form.role !== response.data.user.role) {
          setApiError(`You selected ${form.role}, but the entered email is not a ${form.role} account.`);
          return;
        }

        // Role-based redirect
        let redirectPath = "/";
        switch (response.data.user.role) {
          case "Admin":
            redirectPath = "/admin/dashboard";
            break;
          case "Site Manager":
            redirectPath = "/site-manager/dashboard";
            break;
          case "Supervisor":
            redirectPath = "/supervisor/dashboard";
            break;
          case "Labor":
            redirectPath = "/labor/dashboard";
            break;
          case "Client":
            redirectPath = "/client/dashboard";
            break;
          default:
            redirectPath = "/";
        }
        setApiError("Sign in successful! Redirecting...");
        setTimeout(() => navigate(redirectPath), 1500);
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed. Please try again.";
      setApiError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0B3954] to-[#092638]">
      <div className="w-full max-w-md bg-white/95 rounded-xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-[#0B3954] mb-1">Welcome back</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to continue to AD Construction</p>

        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
            >
              <option value="Client">Client</option>
              <option value="Admin">Admin</option>
              <option value="Site Manager">Site Manager</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Labor">Labor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F5CB5C] text-[#0B3954] font-semibold py-2 rounded-lg hover:bg-[#e5bb4f] transition disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Don't have an account? {""}
          <Link to="/signup" className="text-[#0B3954] font-semibold hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;