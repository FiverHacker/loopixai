import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useSiteStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateProfile, uploadFile } = useAuthStore();
  const { settings } = useSiteStore();
  const navigate = useNavigate();

  const [username, setUsername] = useState(user?.username || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const fileInputRef = useRef(null);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result);
    reader.readAsDataURL(file);
    try {
      const url = await uploadFile(file);
      setAvatar(url);
      setAvatarPreview(url);
      toast.success('Avatar uploaded');
    } catch {
      toast.error('Failed to upload avatar');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ username, avatar });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-[#212121]">
      <header className="border-b border-gray-800 bg-[#171717] px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-[#2f2f2f] rounded-lg text-gray-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-white">Settings</h1>
        </div>
        <button
          onClick={handleSave} disabled={saving}
          className="px-5 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0e8c6a] text-sm font-medium disabled:opacity-50 transition-all"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </header>

      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-2">
        <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-700">
            <h2 className="text-base font-semibold text-white">Profile</h2>
            <p className="text-sm text-gray-400 mt-0.5">Manage your public profile information</p>
          </div>
          <div className="px-6 py-5">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10a37f] to-[#0e8c6a] flex items-center justify-center text-2xl font-bold text-white overflow-hidden ring-2 ring-gray-600">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.username?.charAt(0).toUpperCase()
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div>
                <p className="text-white font-medium">{user?.username}</p>
                <p className="text-gray-400 text-sm">{user?.email}</p>
              </div>
            </div>
          </div>
          <div className="px-6 pb-5 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name</label>
              <input
                type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:border-transparent placeholder-gray-500 text-sm"
                placeholder="Your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email" value={user?.email || ''} disabled
                className="w-full px-3.5 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-gray-500 cursor-not-allowed text-sm"
              />
              <p className="text-xs text-gray-500 mt-1.5">Email address is read-only</p>
            </div>
          </div>
        </div>

        {user?.role === 'admin' && (
          <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-700">
              <h2 className="text-base font-semibold text-white">Administration</h2>
              <p className="text-sm text-gray-400 mt-0.5">Manage users, models, and site settings</p>
            </div>
            <div className="px-6 py-4">
              <button
                onClick={() => navigate('/admin')}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#3f3f3f] rounded-xl hover:bg-[#4f4f4f] transition-all group"
              >
                <span className="text-sm text-gray-200">Open Admin Panel</span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="bg-[#2f2f2f] rounded-2xl border border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-700">
            <h2 className="text-base font-semibold text-white">About</h2>
          </div>
          <div className="px-6 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Version</span>
              <span className="text-sm text-gray-200">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Platform</span>
              <span className="text-sm text-gray-200">{settings.site_name || 'Loopix AI'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Role</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
