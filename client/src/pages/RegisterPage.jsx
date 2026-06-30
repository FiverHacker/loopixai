import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useSiteStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const { settings } = useSiteStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(username, email, password);
      toast.success('Account created!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#212121] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="mb-6 flex justify-center">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-14" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10a37f] to-[#0e8c6a] flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-white">{settings.site_name || 'Loopix AI'}</h1>
          <p className="text-gray-400 text-sm mt-2">Create your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-[#2f2f2f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent text-sm"
              placeholder="Username" required
            />
          </div>
          <div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#2f2f2f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent text-sm"
              placeholder="Email address" required
            />
          </div>
          <div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#2f2f2f] border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent text-sm"
              placeholder="Password" required
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-xl text-white font-medium transition-all hover:opacity-90 disabled:opacity-50 text-sm bg-[#10a37f]"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#10a37f] hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
