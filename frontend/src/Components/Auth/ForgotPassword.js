import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function ForgotPassword() {
  const [gmail, setGmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post('http://localhost:5000/password/forgot', { gmail: gmail.trim() });
      setMessage(res.data.message || 'If an account exists, check your gmail for the reset link.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Unable to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-lg font-semibold mb-3">Forgot Password</h2>
        <p className="text-sm text-gray-600 mb-4">Enter your gmail to receive a password reset link.</p>

        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg">{message}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Gmail</label>
            <input
              type="email"
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="you@gmail.com"
            />
          </div>

          <div className="flex justify-between items-center">
            <Link to="/signin" className="text-sm text-gray-600 hover:underline">Back to sign in</Link>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? 'Sending...' : 'Send Reset Token'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default ForgotPassword;
