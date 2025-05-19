import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiUser, 
  FiMail, 
  FiLock, 
  FiEdit, 
  FiSave,
  FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';

const Profile = () => {
  const { currentUser, changePassword } = useAuth();
  
  // 状态
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 处理修改密码
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // 表单验证
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('所有密码字段不能为空');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('新密码长度不能少于6个字符');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const success = await changePassword(currentPassword, newPassword);
      
      if (success) {
        toast.success('密码修改成功');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setError('修改密码失败');
    } finally {
      setIsLoading(false);
    }
  };
  
  // 页面动画
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3
      }
    }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      {/* 页面标题 */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl font-bold text-white">个人资料</h1>
        <p className="text-gray-400 mt-1">查看和管理您的账户信息</p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 账户信息 */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-1 bg-slate-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <FiUser className="mr-2" /> 账户信息
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">用户名</label>
              <div className="flex items-center bg-slate-700 rounded-lg py-3 px-4 text-white">
                <FiUser className="mr-3 text-gray-400" />
                <span>{currentUser?.username}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">邮箱</label>
              <div className="flex items-center bg-slate-700 rounded-lg py-3 px-4 text-white">
                <FiMail className="mr-3 text-gray-400" />
                <span>{currentUser?.email || '未设置'}</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* 修改密码 */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 bg-slate-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <FiLock className="mr-2" /> 修改密码
          </h2>
          
          {error && (
            <div className="bg-red-900 bg-opacity-30 rounded-lg p-3 mb-6 flex items-center gap-3 text-red-400">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleChangePassword}>
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  当前密码
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiLock />
                  </span>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="输入当前密码"
                    className="w-full py-3 px-10 bg-slate-700 rounded-lg text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  新密码
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiLock />
                  </span>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="输入新密码 (至少6位)"
                    className="w-full py-3 px-10 bg-slate-700 rounded-lg text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  确认新密码
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiLock />
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入新密码"
                    className="w-full py-3 px-10 bg-slate-700 rounded-lg text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  icon={<FiSave />}
                  disabled={isLoading}
                >
                  {isLoading ? '保存中...' : '保存新密码'}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;