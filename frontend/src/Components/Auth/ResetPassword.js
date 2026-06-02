import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../../assets/logo.png';

function ResetPassword() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
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
    if (!token) {
      setMessageType('error');
      return setMessage('Reset link is invalid or missing. Please request a new one.');
    }
    if (password.length < 6) {
      setMessageType('error');
      return setMessage('Password must be at least 6 characters.');
    }
    if (password !== confirm) {
      setMessageType('error');
      return setMessage('Passwords do not match.');
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/password/reset', { token, password });
      setMessageType('success');
      setMessage(res.data.message || 'Password reset successful');
      if (res.data.token) {
        localStorage.setItem('authToken', res.data.token);
      }
      setTimeout(() => navigate('/signin'), 1200);
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Unable to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-[#0B3954] to-[#092638]">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-2xl p-8 backdrop-blur-sm animate-fade-up">
        <div className="mb-6 flex items-center justify-center gap-3">
          <img src={logo} alt="AD Construction logo" className="h-11 w-11 rounded-xl object-cover shadow-md animate-gentle-pulse" />
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">AD Construction</p>
            <h1 className="text-lg font-bold text-[#0B3954] leading-tight">Reset Password</h1>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">Create a new password for your account.</p>
        </div>

        {message && (
          <div
            role="alert"
            aria-live={messageType === 'error' ? 'assertive' : 'polite'}
            className={`mb-4 p-3 rounded-lg border text-sm ${
              messageType === 'error'
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-blue-100 bg-blue-50 text-blue-700'
            }`}
          >
            {message}
          </div>
        )}

        {!token && (
          <div role="alert" className="mb-4 p-3 rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
            Open the reset link from your email to continue.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="reset-new-password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <div className="relative">
              <input
                id="reset-new-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                aria-invalid={messageType === 'error' && message.toLowerCase().includes('password')}
                className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="Enter a new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide new password' : 'Show new password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                id="reset-confirm-password"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                aria-invalid={messageType === 'error' && message.toLowerCase().includes('match')}
                className="w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
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
