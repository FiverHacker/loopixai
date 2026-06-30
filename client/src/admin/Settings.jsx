import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const { token } = useAuthStore();
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');

  const api = axios.create({ baseURL: '/api', headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    api.get('/admin/settings').then(r => {
      setSettings(r.data);
      setLogoPreview(r.data.logo_url || '');
      setFaviconPreview(r.data.favicon_url || '');
    });
  }, []);

  const handleFileUpload = async (field, file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/auth/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    const url = res.data.url;
    setSettings(s => ({ ...s, [field]: url }));
    if (field === 'logo_url') setLogoPreview(url);
    if (field === 'favicon_url') setFaviconPreview(url);
    toast.success('File uploaded');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/admin/settings', settings);
      toast.success('Settings saved! Refresh to see changes.');
      if (settings.site_name) document.title = settings.site_name;
      if (settings.favicon_url) {
        const link = document.getElementById('favicon');
        if (link) link.href = settings.favicon_url;
      }
    } catch {
      toast.error('Failed to save settings');
    } finally { setSaving(false); }
  };

  const update = (key, value) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Site Settings</h1>
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-[#10a37f] text-white rounded-xl hover:bg-[#0e8c6a] text-sm font-medium disabled:opacity-50 transition-all">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Site Name</label>
              <input type="text" value={settings.site_name || ''} onChange={e => update('site_name', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" placeholder="Loopix AI" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Site Description</label>
              <textarea value={settings.site_description || ''} onChange={e => update('site_description', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" rows={2} placeholder="Your Intelligent AI Assistant" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">System Prompt</label>
              <textarea value={settings.system_prompt || ''} onChange={e => update('system_prompt', e.target.value)}
                className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" rows={3} placeholder="You are a helpful AI assistant." />
              <p className="text-xs text-gray-500 mt-1">This prompt is sent to the AI before every conversation</p>
            </div>
          </div>
        </div>

        <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Branding</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Logo</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input type="text" value={settings.logo_url || ''} onChange={e => update('logo_url', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" placeholder="https://example.com/logo.png" />
                </div>
                <label className="px-4 py-2.5 bg-[#3f3f3f] text-gray-300 rounded-xl hover:bg-[#4f4f4f] cursor-pointer text-sm transition-all flex-shrink-0">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleFileUpload('logo_url', e.target.files[0])} />
                </label>
              </div>
              {logoPreview && (
                <div className="mt-3 p-4 bg-[#3f3f3f] rounded-xl inline-block border border-gray-600">
                  <img src={logoPreview} alt="Logo preview" className="h-12" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Favicon</label>
              <div className="flex gap-3 items-start">
                <div className="flex-1">
                  <input type="text" value={settings.favicon_url || ''} onChange={e => update('favicon_url', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" placeholder="https://example.com/favicon.ico" />
                </div>
                <label className="px-4 py-2.5 bg-[#3f3f3f] text-gray-300 rounded-xl hover:bg-[#4f4f4f] cursor-pointer text-sm transition-all flex-shrink-0">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files[0] && handleFileUpload('favicon_url', e.target.files[0])} />
                </label>
              </div>
              {faviconPreview && (
                <div className="mt-3 p-3 bg-[#3f3f3f] rounded-xl inline-block border border-gray-600">
                  <img src={faviconPreview} alt="Favicon preview" className="h-8 w-8" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Theme Colors</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Primary Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={settings.primary_color || '#10a37f'} onChange={e => update('primary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg bg-transparent border border-gray-600 cursor-pointer flex-shrink-0" />
                <input type="text" value={settings.primary_color || '#10a37f'} onChange={e => update('primary_color', e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Secondary Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={settings.secondary_color || '#1a1a2e'} onChange={e => update('secondary_color', e.target.value)}
                  className="w-10 h-10 rounded-lg bg-transparent border border-gray-600 cursor-pointer flex-shrink-0" />
                <input type="text" value={settings.secondary_color || '#1a1a2e'} onChange={e => update('secondary_color', e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Accent Color</label>
              <div className="flex gap-3 items-center">
                <input type="color" value={settings.accent_color || '#7c3aed'} onChange={e => update('accent_color', e.target.value)}
                  className="w-10 h-10 rounded-lg bg-transparent border border-gray-600 cursor-pointer flex-shrink-0" />
                <input type="text" value={settings.accent_color || '#7c3aed'} onChange={e => update('accent_color', e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm font-mono" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Features</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 text-sm text-gray-300 cursor-pointer">
              <input type="checkbox" checked={settings.allow_registration === 'true'} onChange={e => update('allow_registration', e.target.checked ? 'true' : 'false')}
                className="w-4 h-4 rounded bg-[#3f3f3f] border-gray-600 text-[#10a37f] focus:ring-[#10a37f]" />
              Allow new user registration
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
