import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AdminModels() {
  const [models, setModels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const { token } = useAuthStore();
  const [form, setForm] = useState({ name: '', provider: 'openai', api_url: '', api_key: '', model_id: '', is_active: 1, is_default: 0 });

  const api = axios.create({ baseURL: '/api', headers: { Authorization: `Bearer ${token}` } });

  const fetchModels = async () => {
    const res = await api.get('/admin/models');
    setModels(res.data);
  };

  useEffect(() => { fetchModels(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', provider: 'openai', api_url: 'https://api.openai.com/v1/chat/completions', api_key: '', model_id: '', is_active: 1, is_default: 0 });
    setShowForm(true);
  };

  const openEdit = (m) => {
    setEditing(m.id);
    setForm({ name: m.name, provider: m.provider, api_url: m.api_url, api_key: '', model_id: m.model_id, is_active: m.is_active, is_default: m.is_default });
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const data = { ...form };
      if (editing && !data.api_key) delete data.api_key;
      if (editing) {
        await api.put(`/admin/models/${editing}`, data);
        toast.success('Model updated');
      } else {
        await api.post('/admin/models', data);
        toast.success('Model created');
      }
      setShowForm(false);
      fetchModels();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this model?')) return;
    await api.delete(`/admin/models/${id}`);
    toast.success('Model deleted');
    fetchModels();
  };

  const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'nvidia', label: 'NVIDIA' },
    { value: 'openrouter', label: 'OpenRouter' },
    { value: 'nararouter', label: 'NaraRouter' },
    { value: 'custom', label: 'Custom API' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">AI Models</h1>
        <button onClick={openNew} className="px-4 py-2 bg-[#10a37f] text-white rounded-xl hover:bg-[#0e8c6a] text-sm font-medium transition-all">
          + Add Model
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-[#2f2f2f] rounded-2xl p-6 w-full max-w-lg border border-gray-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-4">{editing ? 'Edit Model' : 'Add Model'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Model Name</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" placeholder="GPT-4 Turbo" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Provider</label>
                  <select value={form.provider} onChange={e => setForm({...form, provider: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm">
                    {providers.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">API URL</label>
                <input type="text" value={form.api_url} onChange={e => setForm({...form, api_url: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" placeholder="https://api.openai.com/v1/chat/completions" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">API Key {editing && '(leave blank to keep current)'}</label>
                <input type="password" value={form.api_key} onChange={e => setForm({...form, api_key: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" placeholder={editing ? 'Leave blank to keep current' : 'sk-...'} />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Model ID</label>
                <input type="text" value={form.model_id} onChange={e => setForm({...form, model_id: e.target.value})}
                  className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" placeholder="gpt-4-turbo" />
              </div>
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.is_active === 1} onChange={e => setForm({...form, is_active: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 rounded bg-[#3f3f3f] border-gray-600 text-[#10a37f] focus:ring-[#10a37f]" />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                  <input type="checkbox" checked={form.is_default === 1} onChange={e => setForm({...form, is_default: e.target.checked ? 1 : 0})}
                    className="w-4 h-4 rounded bg-[#3f3f3f] border-gray-600 text-[#10a37f] focus:ring-[#10a37f]" />
                  Default Model
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} className="flex-1 py-2.5 bg-[#10a37f] text-white rounded-xl hover:bg-[#0e8c6a] font-medium transition-all">
                  {editing ? 'Update' : 'Create'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-2.5 bg-[#3f3f3f] text-gray-300 rounded-xl hover:bg-[#4f4f4f] transition-all">Cancel</button>
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
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">Name</th>
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">Provider</th>
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">Model ID</th>
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">Status</th>
                <th className="text-left px-5 py-4 text-sm font-medium text-gray-400">Default</th>
                <th className="text-right px-5 py-4 text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {models.map(m => (
                <tr key={m.id} className="border-b border-gray-700/50 hover:bg-[#3f3f3f]/30">
                  <td className="px-5 py-4 text-white text-sm font-medium">{m.name}</td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-300 capitalize">{m.provider}</span>
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-sm">{m.model_id}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${m.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {m.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {m.is_default ? <span className="text-[#10a37f] text-sm font-medium">Default</span> : <span className="text-gray-500 text-sm">-</span>}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => openEdit(m)} className="px-3 py-1.5 text-xs bg-[#3f3f3f] text-gray-300 rounded-lg hover:bg-[#4f4f4f] mr-2 transition-all">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="px-3 py-1.5 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">Delete</button>
                  </td>
                </tr>
              ))}
              {models.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-500 text-sm">No AI models configured yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
