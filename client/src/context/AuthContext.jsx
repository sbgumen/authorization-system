// client/src/context/AuthContext.jsx - 修复jwt导入和使用
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jwt_decode from 'jwt-decode'; // 正确导入
import { toast } from 'react-hot-toast';

// 创建认证上下文
const AuthContext = createContext(null);

// 使用认证上下文的自定义Hook
export const useAuth = () => useContext(AuthContext);

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 设置axios默认请求头
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // 检查令牌是否有效
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // 检查令牌是否过期
        const decodedToken = jwt_decode(token); // 使用正确的导入名称
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // 令牌已过期
          logout();
          return;
        }

        // 验证令牌有效性
        const response = await axios.get('/api/auth/profile');
        setCurrentUser(response.data.admin);
      } catch (error) {
        console.error('令牌验证错误:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]); // 依赖项应该加入logout

  // 登录
  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token: newToken, admin } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(admin);
      toast.success('登录成功');
      
      return true;
    } catch (error) {
      console.error('登录错误:', error);
      const message = error.response?.data?.message || '登录失败';
      toast.error(message);
      
      return false;
    }
  };

  // 注册
  const register = async (username, password, email) => {
    try {
      const response = await axios.post('/api/auth/register', { username, password, email });
      const { token: newToken, admin } = response.data;

      localStorage.setItem('token', newToken);
      setToken(newToken);
      setCurrentUser(admin);
      toast.success('注册成功');
      
      return true;
    } catch (error) {
      console.error('注册错误:', error);
      const message = error.response?.data?.message || '注册失败';
      toast.error(message);
      
      return false;
    }
  };

  // 注销
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    navigate('/login');
  };

  // 修改密码
 const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await axios.put('/api/auth/password', { currentPassword, newPassword });
        
        // 处理成功的响应
        if (response.data.success) {
            toast.success('密码修改成功');
            return true;
        } else {
            // 如果响应的 format 并没有成功
            throw new Error('密码修改未成功，请重试');
        }
        
    } catch (error) {
        console.error('修改密码错误:', error);
        
        // 尝试获取服务器返回的错误信息
        const message = error.response?.data?.errors?.[0]?.message || '修改密码失败';
        toast.error(message);
        
        return false;
    }
};

  // 认证上下文值
  const value = {
    currentUser,
    loading,
    login,
    register,
    logout,
    changePassword,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};