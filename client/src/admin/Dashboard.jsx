import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalConvs: 0, totalMsgs: 0, totalModels: 0 });
  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => setStats(r.data));
  }, []);

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-blue-500' },
    { label: 'Conversations', value: stats.totalConvs, icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z', color: 'bg-purple-500' },
    { label: 'Messages', value: stats.totalMsgs, icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z', color: 'bg-emerald-500' },
    { label: 'AI Models', value: stats.totalModels, icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', color: 'bg-amber-500' }
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-white mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="bg-[#2f2f2f] rounded-2xl p-6 border border-gray-700">
            <div className={`w-12 h-12 ${c.color} rounded-xl flex items-center justify-center mb-4`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={c.icon} />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{c.value}</p>
            <p className="text-sm text-gray-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button onClick={() => navigate('/admin/models')} className="p-4 bg-[#3f3f3f] rounded-xl hover:bg-[#4f4f4f] transition-all text-left">
            <p className="text-white font-medium">Manage AI Models</p>
            <p className="text-sm text-gray-400 mt-1">Add or configure AI providers</p>
          </button>
          <button onClick={() => navigate('/admin/users')} className="p-4 bg-[#3f3f3f] rounded-xl hover:bg-[#4f4f4f] transition-all text-left">
            <p className="text-white font-medium">Manage Users</p>
            <p className="text-sm text-gray-400 mt-1">View and manage user accounts</p>
          </button>
          <button onClick={() => navigate('/admin/settings')} className="p-4 bg-[#3f3f3f] rounded-xl hover:bg-[#4f4f4f] transition-all text-left">
            <p className="text-white font-medium">Site Settings</p>
            <p className="text-sm text-gray-400 mt-1">Customize your Loopix AI site</p>
          </button>
        </div>
      </div>
    </div>
  );
}
