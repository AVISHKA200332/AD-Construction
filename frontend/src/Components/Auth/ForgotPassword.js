import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

function ForgotPassword() {
  const [gmail, setGmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!gmail.trim()) {
      setMessageType('error');
      setMessage('Please enter your gmail address.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/password/forgot', { gmail: gmail.trim() });
      setMessageType('success');
      setMessage(res.data.message || 'If an account exists, check your gmail for the reset link.');
    } catch (err) {
      setMessageType('error');
      setMessage(err.response?.data?.message || 'Unable to process request');
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
            <h1 className="text-lg font-bold text-[#0B3954] leading-tight">Forgot Password</h1>
          </div>
        </div>

        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">Enter your gmail to receive a password reset link.</p>
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="forgot-gmail" className="block text-sm font-medium text-gray-700 mb-1">Gmail</label>
            <input
              id="forgot-gmail"
              type="email"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              autoComplete="email"
              aria-label="Enter your account gmail"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F5CB5C]"
              placeholder="you@gmail.com"
            />
          </div>

          <div className="flex justify-between items-center">
            <Link to="/signin" className="text-sm font-medium text-[#0B3954] hover:underline">
              Back to sign in
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-lg bg-[#F5CB5C] text-[#0B3954] font-semibold hover:bg-[#e5bb4f] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default ForgotPassword;
