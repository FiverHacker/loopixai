import { create } from 'zustand';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  loading: true,

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) { set({ loading: false }); return; }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, token, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, token: res.data.token });
    return res.data;
  },

  register: async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('token', res.data.token);
    set({ user: res.data.user, token: res.data.token });
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },

  updateProfile: async (data) => {
    await api.put('/auth/profile', data);
    if (data.username) set(state => ({ user: { ...state.user, username: data.username } }));
    if (data.avatar !== undefined) set(state => ({ user: { ...state.user, avatar: data.avatar } }));
  },

  uploadFile: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post('/auth/upload', form);
    return res.data.url;
  }
}));

export const useSiteStore = create((set) => ({
  settings: {},
  models: [],
  loading: true,

  fetchSettings: async () => {
    try {
      const res = await api.get('/settings/public');
      set({ settings: res.data });
    } catch {}
  },

  fetchModels: async () => {
    try {
      const res = await api.get('/models/active');
      set({ models: res.data });
    } catch {}
  },

  fetchAll: async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        api.get('/settings/public'),
        api.get('/models/active')
      ]);
      set({ settings: sRes.data, models: mRes.data, loading: false });
    } catch { set({ loading: false }); }
  }
}));

export const useChatStore = create((set, get) => ({
  conversations: [],
  currentConv: null,
  messages: [],
  loading: false,
  sending: false,

  fetchConversations: async () => {
    try {
      const res = await api.get('/conversations');
      set({ conversations: res.data });
    } catch {}
  },

  createConversation: async (title, model) => {
    const res = await api.post('/conversations', { title, model });
    set(state => ({ conversations: [res.data, ...state.conversations], currentConv: res.data }));
    return res.data;
  },

  deleteConversation: async (id) => {
    await api.delete(`/conversations/${id}`);
    set(state => ({
      conversations: state.conversations.filter(c => c.id !== id),
      currentConv: state.currentConv?.id === id ? null : state.currentConv,
      messages: state.currentConv?.id === id ? [] : state.messages
    }));
  },

  renameConversation: async (id, title) => {
    await api.put(`/conversations/${id}`, { title });
    set(state => ({
      conversations: state.conversations.map(c => c.id === id ? { ...c, title } : c),
      currentConv: state.currentConv?.id === id ? { ...state.currentConv, title } : state.currentConv
    }));
  },

  setCurrentConv: (conv) => set({ currentConv: conv }),

  fetchMessages: async (convId) => {
    try {
      const res = await api.get(`/conversations/${convId}/messages`);
      set({ messages: res.data });
    } catch {}
  },

  sendMessage: async (convId, content, model) => {
    const tempId = 'temp-' + Date.now();
    const userMsg = { id: tempId, role: 'user', content };
    set(state => ({
      messages: [...state.messages, userMsg],
      sending: true
    }));
    try {
      const res = await api.post(`/conversations/${convId}/messages`, { content, model });
      set(state => ({
        messages: [...state.messages.filter(m => m.id !== tempId), res.data.userMessage, res.data.aiMessage],
        sending: false
      }));
      return res.data;
    } catch (err) {
      set(state => ({
        messages: state.messages.filter(m => m.id !== tempId),
        sending: false
      }));
      throw err;
    }
  }
}));
