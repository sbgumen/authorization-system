import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const AdminRoute = () => {
  const { currentUser, loading } = useAuth();

  // 如果正在加载，显示加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader />
      </div>
    );
  }

  // 如果用户不是管理员，重定向到首页
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-10">
        <div className="text-yellow-500 text-xl mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V5a3 3 0 00-6 0v6a2 2 0 00-2 2v3a6 6 0 0012 0v-3a2 2 0 00-2-2zm-6 0V5a1 1 0 012 0v6H9z" />
          </svg>
          权限不足
        </div>
        <p className="text-gray-400 mb-6 text-center px-4">该页面需要管理员权限</p>
      </div>
    );
  }

  // 如果是管理员，允许访问
  return <Outlet />;
};

export default AdminRoute;