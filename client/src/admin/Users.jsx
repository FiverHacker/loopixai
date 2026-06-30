import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editing, setEditing] = useState(null);
  const { token } = useAuthStore();
  const [form, setForm] = useState({ username: '', email: '', role: 'user', password: '' });

  const api = axios.create({ baseURL: '/api', headers: { Authorization: `Bearer ${token}` } });

  const fetchUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data);
  };

  useEffect(() => { fetchUsers(); }, []);

  const openEdit = (u) => {
    setEditing(u.id);
    setForm({ username: u.username, email: u.email, role: u.role, password: '' });
  };

  const handleSave = async () => {
    try {
      const data = {};
      if (form.username) data.username = form.username;
      if (form.email) data.email = form.email;
      if (form.role) data.role = form.role;
      if (form.password) data.password = form.password;
      await api.put(`/admin/users/${editing}`, data);
      toast.success('User updated');
      setEditing(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user and all their data?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Users</h1>
        <span className="text-sm text-gray-400 bg-[#2f2f2f] px-3 py-1.5 rounded-lg border border-gray-700">{users.length} total</span>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-[#2f2f2f] rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">Edit User</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">New Password (leave blank to keep current)</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" placeholder="Leave blank to keep current" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 py-2.5 bg-[#10a37f] text-white rounded-xl hover:bg-[#0e8c6a] font-medium transition-all">Save</button>
                <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-[#3f3f3f] text-gray-300 rounded-xl hover:bg-[#4f4f4f] transition-all">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">User</th>
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">Email</th>
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">Role</th>
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">Joined</th>
                <th className="text-right px-5 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-700/50 hover:bg-[#3f3f3f]/30">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
                        {u.avatar ? <img src={u.avatar} className="w-full h-full rounded-full object-cover" /> : u.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white text-sm font-medium">{u.username}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-300 text-sm">{u.email}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(u)} className="px-3 py-1.5 text-xs bg-[#3f3f3f] text-gray-300 rounded-lg hover:bg-[#4f4f4f] mr-2 transition-all">Edit</button>
                    <button onClick={() => handleDelete(u.id)} className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">Delete</button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
