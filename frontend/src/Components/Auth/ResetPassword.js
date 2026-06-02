import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/logo.png';

function ResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const tokenFromLink = searchParams.get('token');
    if (tokenFromLink) {
      setToken(tokenFromLink);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password.length < 6) return setMessage('Password must be 6+ chars');
    if (password !== confirm) return setMessage('Passwords do not match');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/password/reset', { token, password });
      setMessage(res.data.message || 'Password reset successful');
      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
      }
      setTimeout(() => navigate('/signin'), 1200);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0B3954] to-[#092638]">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <img src={logo} alt="AD Construction" className="h-11 w-11 rounded-xl object-cover shadow-md" />
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">AD Construction</p>
            <h1 className="text-lg font-bold text-[#0B3954] leading-tight">Reset Password</h1>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">Create a new password for your account.</p>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-lg border border-blue-100 bg-blue-50 text-blue-700 text-sm">
            {message}
          </div>
        )}

        {!token && (
          <div className="mb-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
            Open the reset link from your email to continue.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="Enter a new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Link to="/signin" className="text-sm font-medium text-[#0B3954] hover:underline">
              Back to sign in
            </Link>
            <button
              type="submit"
              disabled={loading || !token}
              className="px-5 py-2.5 rounded-lg bg-[#F5CB5C] text-[#0B3954] font-semibold hover:bg-[#e5bb4f] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
