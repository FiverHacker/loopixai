import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useChatStore, useSiteStore } from '../store/authStore';
import toast from 'react-hot-toast';

function Sidebar({ onClose }) {
  const { conversations, currentConv, fetchConversations, createConversation, deleteConversation, renameConversation, setCurrentConv, fetchMessages } = useChatStore();
  const { settings } = useSiteStore();
  const { user, logout, updateProfile, uploadFile } = useAuthStore();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');

  useEffect(() => { fetchConversations(); }, []);

  const handleNew = async () => {
    const conv = await createConversation('New Chat', '');
    setCurrentConv(conv);
    fetchMessages(conv.id);
    if (onClose) onClose();
  };

  const handleSelect = (conv) => {
    setCurrentConv(conv);
    fetchMessages(conv.id);
    if (onClose) onClose();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteConversation(id);
    toast.success('Conversation deleted');
  };

  const startEdit = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEdit = async (id) => {
    if (editTitle.trim()) await renameConversation(id, editTitle.trim());
    setEditingId(null);
  };

  return (
    <div className="h-full flex flex-col bg-[#171717]">
      <div className="p-3">
        <button
          onClick={handleNew}
          className="w-full flex items-center gap-3 px-4 py-3 border border-gray-700 rounded-xl text-gray-300 hover:bg-[#2f2f2f] transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {conversations.map(conv => (
          <div key={conv.id} onClick={() => handleSelect(conv)} className={`group flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all ${
            currentConv?.id === conv.id ? 'bg-[#2f2f2f] text-white' : 'text-gray-400 hover:bg-[#2f2f2f] hover:text-gray-200'
          }`}>
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {editingId === conv.id ? (
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                onBlur={() => saveEdit(conv.id)} onKeyDown={e => e.key === 'Enter' && saveEdit(conv.id)}
                className="flex-1 bg-[#3f3f3f] text-sm px-2 py-0.5 rounded text-white outline-none" autoFocus onClick={e => e.stopPropagation()} />
            ) : (
              <span className="flex-1 text-sm truncate">{conv.title}</span>
            )}
            <div className="hidden group-hover:flex items-center gap-0.5">
              <button onClick={(e) => startEdit(e, conv)} className="p-1 hover:bg-[#3f3f3f] rounded">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button onClick={(e) => handleDelete(e, conv.id)} className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-gray-800 relative">
        <button onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#2f2f2f] transition-all">
          <div className="w-8 h-8 rounded-full bg-[#10a37f] flex items-center justify-center text-sm font-semibold text-white flex-shrink-0">
            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-sm font-medium text-gray-200 truncate">{user?.username}</div>
            <div className="text-xs text-gray-500 truncate">{user?.email}</div>
          </div>
        </button>
        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-[#2f2f2f] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-40">
            <button onClick={() => { setShowSettings(true); setShowUserMenu(false); }}
              className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-[#3f3f3f] flex items-center gap-3 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Settings
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => { navigate('/admin'); setShowUserMenu(false); }}
                className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-[#3f3f3f] flex items-center gap-3 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Panel
              </button>
            )}
            <button onClick={() => { logout(); navigate('/login'); }}
              className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-[#3f3f3f] flex items-center gap-3 transition-all border-t border-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}
      </div>
      {showSettings && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-[#2f2f2f] rounded-2xl w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700 flex-shrink-0">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-1.5 hover:bg-[#3f3f3f] rounded-lg text-gray-400 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-1 min-h-0">
              <div className="w-44 bg-[#262626] border-r border-gray-700 p-2 flex-shrink-0 overflow-y-auto">
                {[
                  { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                  { id: 'api', label: 'API Keys', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
                  { id: 'appearance', label: 'Appearance', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' },
                  { id: 'about', label: 'About', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setSettingsTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                      settingsTab === tab.id ? 'bg-[#10a37f]/20 text-[#10a37f]' : 'text-gray-400 hover:bg-[#3f3f3f] hover:text-gray-200'
                    }`}>
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-5">
                {settingsTab === 'profile' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">Profile</h3>
                      <p className="text-sm text-gray-400 mb-4">Manage your public profile information</p>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#10a37f] to-[#0e8c6a] flex items-center justify-center text-2xl font-bold text-white overflow-hidden ring-2 ring-gray-600 flex-shrink-0">
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user?.username}</p>
                        <p className="text-gray-400 text-sm">{user?.email}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Display Name</label>
                      <input type="text" defaultValue={user?.username}
                        className="w-full px-3.5 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#10a37f] text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                      <input type="email" value={user?.email || ''} disabled
                        className="w-full px-3.5 py-2.5 bg-[#3f3f3f] border border-gray-600 rounded-xl text-gray-500 text-sm cursor-not-allowed" />
                    </div>
                    {user?.role === 'admin' && (
                      <div className="pt-2">
                        <button onClick={() => window.location.href = '/admin'}
                          className="px-4 py-2.5 bg-[#3f3f3f] text-gray-200 rounded-xl hover:bg-[#4f4f4f] text-sm transition-all flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Open Admin Panel
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {settingsTab === 'api' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">API Keys</h3>
                      <p className="text-sm text-gray-400 mb-4">Available AI providers on this platform</p>
                    </div>
                    <div className="bg-[#3f3f3f] rounded-xl p-4 border border-gray-600">
                      <div className="space-y-2">
                        {['OpenAI', 'NVIDIA', 'OpenRouter', 'NaraRouter'].map(p => (
                          <div key={p} className="flex items-center justify-between py-2 px-3 bg-[#262626] rounded-lg">
                            <span className="text-sm text-gray-200">{p}</span>
                            <span className="text-xs text-green-400">Active</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {user?.role === 'admin' ? (
                      <button onClick={() => window.location.href = '/admin/models'}
                        className="px-4 py-2.5 bg-[#10a37f] text-white rounded-xl hover:bg-[#0e8c6a] text-sm transition-all">
                        Manage API Keys
                      </button>
                    ) : (
                      <p className="text-xs text-gray-500">API keys are configured by your administrator</p>
                    )}
                  </div>
                )}
                {settingsTab === 'appearance' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">Appearance</h3>
                      <p className="text-sm text-gray-400 mb-4">Customize your interface</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Theme</label>
                      <div className="flex gap-3">
                        {['Dark', 'Light', 'System'].map(t => (
                          <button key={t} className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all bg-[#3f3f3f] text-gray-300 hover:bg-[#4f4f4f]">
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1.5">Primary Color</label>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10a37f]"></div>
                        <span className="text-sm text-gray-500">{settings.site_name || 'Loopix AI'} theme</span>
                      </div>
                    </div>
                  </div>
                )}
                {settingsTab === 'about' && (
                  <div className="space-y-5">
                    <div>
                      <h3 className="text-base font-semibold text-white mb-1">About</h3>
                      <p className="text-sm text-gray-400 mb-4">Loopix AI platform information</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2.5 px-4 bg-[#3f3f3f] rounded-xl">
                        <span className="text-sm text-gray-400">Version</span>
                        <span className="text-sm text-gray-200 font-medium">1.0.0</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 px-4 bg-[#3f3f3f] rounded-xl">
                        <span className="text-sm text-gray-400">Platform</span>
                        <span className="text-sm text-gray-200 font-medium">{settings.site_name || 'Loopix AI'}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 px-4 bg-[#3f3f3f] rounded-xl">
                        <span className="text-sm text-gray-400">Your Role</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>{user?.role}</span>
                      </div>
                      <div className="flex items-center justify-between py-2.5 px-4 bg-[#3f3f3f] rounded-xl">
                        <span className="text-sm text-gray-400">AI Providers</span>
                        <span className="text-sm text-gray-200 font-medium">4 available</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-[#3f3f3f] rounded-lg text-gray-400 hover:text-white transition-all"
      title="Copy"
    >
      {copied ? (
        <svg className="w-4 h-4 text-[#10a37f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

function Message({ msg, settings, userAvatar }) {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="group w-full bg-transparent message-enter">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-start gap-4 flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-[#5436da] flex items-center justify-center flex-shrink-0 text-sm font-semibold text-white overflow-hidden">
            {userAvatar ? <img src={userAvatar} className="w-full h-full rounded-full object-cover" /> : 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>}
          </div>
          <div className="flex-1 min-w-0 pt-0.5 max-w-[80%]">
            <div className="bg-[#2f2f2f] rounded-2xl rounded-tr-sm px-4 py-3 text-gray-100 leading-7 whitespace-pre-wrap text-sm md:text-base shadow-sm border border-gray-700/50">
              {msg.content}
            </div>
            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
              <CopyButton text={msg.content} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group w-full bg-[#212121] message-enter">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
          <img src="/uploads/1782809780395-ChatGPT%20Image%20Jun%2030,%202026,%2008_43_25%20AM.png" alt="Site Logo" className="w-full h-full object-contain" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5 max-w-[80%]">
          <div className="bg-[#1e1e1e] rounded-xl px-4 py-3 text-gray-100 leading-7 whitespace-pre-wrap text-sm md:text-base border border-[#2a2a2a]">
            {msg.content}
          </div>
          <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={msg.content} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="w-full bg-[#212121]">
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
          <img src="/uploads/1782809780395-ChatGPT%20Image%20Jun%2030,%202026,%2008_43_25%20AM.png" alt="Site Logo" className="w-full h-full object-contain" />
        </div>
        <div className="bg-[#1e1e1e] rounded-xl px-4 py-3 border border-[#2a2a2a] message-enter">
          <div className="flex items-center gap-1.5">
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
            <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full inline-block"></span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { user, loading: authLoading } = useAuthStore();
  const { currentConv, messages, sending, setCurrentConv, fetchConversations, createConversation, fetchMessages, sendMessage } = useChatStore();
  const { models, settings } = useSiteStore();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading]);

  useEffect(() => {
    fetchConversations();
    if (models.length > 0 && !selectedModel) setSelectedModel(models[0]?.id || '');
  }, [models]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentConv]);

  const handleNewChat = async () => {
    const conv = await createConversation('New Chat', selectedModel);
    setCurrentConv(conv);
    fetchMessages(conv.id);
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    let conv = currentConv;
    if (!conv) {
      conv = await createConversation('New Chat', selectedModel);
      setCurrentConv(conv);
    }
    const msg = input;
    setInput('');
    if (textareaRef.current) { textareaRef.current.style.height = 'auto'; }
    try {
      await sendMessage(conv.id, msg, selectedModel);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedModelData = models.find(m => m.id === selectedModel);

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#212121]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#10a37f]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#212121] overflow-hidden">
      <div className={`${showSidebar ? 'w-72' : 'w-0'} transition-all duration-300 flex-shrink-0 overflow-hidden`}>
        <div className="w-72 h-full">
          <Sidebar onClose={() => setShowSidebar(false)} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 py-2 bg-[#212121]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 hover:bg-[#2f2f2f] rounded-lg text-gray-400 hover:text-white transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="" className="w-6 h-6 rounded" />
              ) : (
                <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#10a37f] to-[#0e8c6a] flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <span className="text-sm font-semibold text-gray-200 hidden sm:inline">{settings.site_name || 'Loopix AI'}</span>
            </div>
            {currentConv && (
              <span className="text-gray-500 hidden sm:inline">/</span>
            )}
            {currentConv && (
              <h2 className="text-sm font-medium text-gray-400 truncate max-w-xs hidden sm:block">{currentConv.title}</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#2f2f2f] border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-[#3f3f3f] transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">{selectedModelData ? selectedModelData.name : 'Select Model'}</span>
                <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showModelPicker && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#2f2f2f] border border-gray-700 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
                  <div className="p-3 border-b border-gray-700">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">AI Models</p>
                  </div>
                  <div className="py-1">
                    {models.map(m => (
                      <button key={m.id} onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-[#3f3f3f] transition-all ${
                          selectedModel === m.id ? 'bg-[#3f3f3f] text-white' : 'text-gray-300'
                        }`}>
                        <div className="font-medium">{m.name}</div>
                        <div className="text-xs text-gray-500 capitalize mt-0.5">{m.provider}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleNewChat} className="p-2 hover:bg-[#2f2f2f] rounded-lg text-gray-400 hover:text-white transition-all" title="New Chat">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {!currentConv ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="mb-6">
                {settings.logo_url ? (
                  <img src={settings.logo_url} alt="Logo" className="h-16 mx-auto" />
                ) : (
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#10a37f] to-[#0e8c6a] flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-semibold text-white mb-2">{settings.site_name || 'Loopix AI'}</h1>
              <p className="text-gray-400 mb-8 text-sm">How can I help you today?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full px-4">
                {[
                  { text: 'Explain quantum computing in simple terms', icon: '🔬' },
                  { text: 'Write a Python script to analyze CSV data', icon: '🐍' },
                  { text: 'Help me plan a weekly meal schedule', icon: '📋' },
                  { text: 'Create a workout routine for beginners', icon: '💪' }
                ].map((item, i) => (
                  <button key={i} onClick={async () => {
                    const conv = await createConversation(item.text, selectedModel);
                    setCurrentConv(conv);
                    fetchMessages(conv.id);
                    setTimeout(() => sendMessage(conv.id, item.text, selectedModel), 100);
                  }}
                    className="flex items-start gap-3 p-4 bg-[#2f2f2f] rounded-xl border border-gray-700 hover:border-gray-500 text-left text-sm text-gray-300 transition-all">
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    <span className="leading-relaxed">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-3 opacity-30">💬</div>
                    <p className="text-sm">Send a message to start the conversation</p>
                  </div>
                </div>
              ) : (
                messages.map(msg => <Message key={msg.id} msg={msg} settings={settings} userAvatar={user?.avatar} />)
              )}
              {sending && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="px-4 py-3 bg-[#212121] border-t border-gray-800">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-[#2f2f2f] rounded-xl border border-gray-700 px-4 py-3 focus-within:border-gray-500 transition-all shadow-lg shadow-black/20">
              <textarea
                ref={(el) => { inputRef.current = el; textareaRef.current = el; }}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Loopix AI..."
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none resize-none max-h-48 text-sm"
                style={{ minHeight: '20px' }}
                onInput={e => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 192) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                  input.trim() && !sending
                    ? 'bg-[#10a37f] text-white hover:bg-[#0e8c6a]'
                    : 'bg-[#3f3f3f] text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-600 text-center mt-2">
              {settings.site_name || 'Loopix AI'} can make mistakes. Verify important info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
