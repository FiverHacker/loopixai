import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, useSiteStore } from './store/authStore';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/Dashboard';
import AdminModels from './admin/Models';
import AdminUsers from './admin/Users';
import AdminSettings from './admin/Settings';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#212121]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#10a37f]"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) return <div className="h-screen flex items-center justify-center bg-[#212121]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#10a37f]"></div></div>;
  if (!user || user.role !== 'admin') return <Navigate to="/" />;
  return children;
}

export default function App() {
  const { checkAuth } = useAuthStore();
  const { fetchAll, settings, loading: siteLoading } = useSiteStore();

  useEffect(() => { checkAuth(); fetchAll(); }, []);

  useEffect(() => {
    if (settings.primary_color) document.documentElement.style.setProperty('--primary', settings.primary_color);
    if (settings.site_name) document.title = settings.site_name;
    if (settings.favicon_url) {
      const link = document.getElementById('favicon');
      if (link) link.href = settings.favicon_url;
    }
  }, [settings]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="models" element={<AdminModels />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
