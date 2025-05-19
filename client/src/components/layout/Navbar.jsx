import React from 'react';
import { motion } from 'framer-motion';
import { FiMenu, FiBell, FiUser, FiLogOut, FiGithub } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { currentUser, logout } = useAuth();
  const [profileOpen, setProfileOpen] = React.useState(false);

  // 切换用户资料菜单
  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
  };

  // 处理注销
  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 左侧菜单按钮和标题 */}
          <div className="flex items-center">
            <button
              type="button"
              className="text-gray-400 hover:text-white focus:outline-none md:hidden"
              onClick={onMenuClick}
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="ml-4 flex items-center">
              <motion.div
                className="text-white text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500 sqtitle"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                阿泽授权管理系统
              </motion.div>
            </div>
          </div>
          {/* 右侧用户菜单 */}
          <div className="flex items-center gap-4">
            {/* 通知图标 */}
            <motion.button
              className="p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-slate-700 relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiBell className="h-5 w-5" />
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-slate-800"></span>
            </motion.button>
            {/* 用户资料下拉菜单 */}
            <div className="relative ml-3">
              <motion.button
                className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-slate-700 hover:bg-slate-600 rounded-md"
                onClick={toggleProfile}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiUser className="h-4 w-4" />
                <span>{currentUser?.username}</span>
              </motion.button>
              {/* 下拉菜单 */}
              {profileOpen && (
                <motion.div
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5"
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-white hover:bg-slate-600"
                      onClick={() => setProfileOpen(false)}
                    >
                      <FiUser className="mr-2" />
                      个人资料
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center block w-full text-left px-4 py-2 text-sm text-white hover:bg-slate-600"
                    >
                      <FiLogOut className="mr-2" />
                      退出登录
                    </button>
                    
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;