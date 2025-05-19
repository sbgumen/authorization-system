import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiLock, FiUser, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 状态
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 如果已登录，重定向到首页或之前的页面
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);
  
  // 处理登录
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!username.trim() || !password.trim()) {
      setError('用户名和密码不能为空');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      
      if (success) {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError('登录失败，请检查用户名和密码');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 页面动画
  const pageVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };
  
  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-12"
    >
      <div className="relative z-10">
        {/* 背景装饰 */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500 rounded-full opacity-10 -z-10 blur-xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-500 rounded-full opacity-10 -z-10 blur-xl transform translate-x-1/2 translate-y-1/2"></div>
      
        <motion.div
          variants={itemVariants}
          className="w-full max-w-md bg-slate-800 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* 标题 */}
          <div className="p-8 border-b border-slate-700 text-center bg-gradient-to-r from-blue-900 to-indigo-900">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl font-bold text-white"
            >
              阿泽授权管理系统
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-2 text-blue-300"
            >
              登录管理员账户
            </motion.p>
          </div>
          
          {/* 登录表单 */}
          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-900 bg-opacity-30 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400"
              >
                <FiAlertCircle size={18} />
                <span>{error}</span>
              </motion.div>
            )}
            
            <form onSubmit={handleLogin}>
              <motion.div variants={itemVariants} className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  用户名
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiUser />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="输入用户名"
                    className="w-full py-3 px-10 bg-slate-700 rounded-lg text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="mb-8">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  密码
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiLock />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="输入密码"
                    className="w-full py-3 px-10 bg-slate-700 rounded-lg text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth={true}
                  disabled={isLoading}
                >
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </motion.div>
            </form>
            
            <motion.div
              variants={itemVariants}
              className="mt-6 text-center text-gray-400 text-sm"
            >
              还没有账户？ <Link to="/register" className="text-blue-400 hover:underline">注册新账户</Link>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="mt-8 text-center text-gray-500 text-sm"
        >
          ©阿泽 {new Date().getFullYear()} 授权管理系统 · 技术支持
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;