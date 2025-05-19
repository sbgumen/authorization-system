import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import LicenseList from './pages/licenses/LicenseList';
import LicenseDetail from './pages/licenses/LicenseDetail';
import CreateLicense from './pages/licenses/CreateLicense';
import ApplicationList from './pages/applications/ApplicationList';
import CreateApplication from './pages/applications/CreateApplication';
import ApplicationDetail from './pages/applications/ApplicationDetail';
import EditApplication from './pages/applications/EditApplication';
import SystemSettings from './pages/settings/SystemSettings';
import UserManagement from './pages/users/UserManagement';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute'; // 这个需要创建
import { AuthProvider } from './context/AuthContext';
import ApiDocumentation from './pages/docs/ApiDocumentation';
import LicenseApplications from './pages/applications/LicenseApplications';
import ApplicationRequests from './pages/licenses/ApplicationRequests';

const App = () => {
  const location = useLocation();
  
  // 添加滚动效果
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900 text-white">
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 受保护路由 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/api-docs" element={<ApiDocumentation />} />
            
            {/* 应用路由 */}
            <Route path="/applications" element={<ApplicationList />} />
            <Route path="/applications/create" element={<CreateApplication />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/applications/:id/edit" element={<EditApplication />} />
            
            {/* 授权码路由 */}
            <Route path="/licenses/applications" element={<ApplicationRequests />} />
            <Route path="/licenses" element={<LicenseList />} />
            <Route path="/licenses/create" element={<CreateLicense />} />
            <Route path="/licenses/:id" element={<LicenseDetail />} />
            <Route path="/license-applications" element={<LicenseApplications />} />
            
            {/* 个人资料 */}
            <Route path="/profile" element={<Profile />} />
            
            {/* 仅管理员可访问的路由 */}
            <Route element={<AdminRoute />}>
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/users" element={<UserManagement />} />
            </Route>
          </Route>
          
          {/* 404页面 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;