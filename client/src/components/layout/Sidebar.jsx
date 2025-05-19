// client/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHome, 
  FiKey, 
  FiUser, 
  FiSettings,
  FiUsers,
  FiChevronDown,
  FiGrid,
  FiClock,
  FiBookOpen,
  FiGithub
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { currentUser } = useAuth();
  
  // 侧边栏路由配置
  const routes = [
    {
      path: '/dashboard',
      name: '仪表盘',
      icon: <FiHome />
    },
    {
      path: '/applications',
      name: '我的应用',
      icon: <FiGrid />
    },
    {
      path: '/licenses',
      name: '授权管理',
      icon: <FiKey />,
      subRoutes: [
        {
          path: '/licenses',
          name: '授权列表'
        },
        {
          path: '/licenses/create',
          name: '生成授权码'
        },
        {
    path: '/licenses/applications', // 新增
    name: '授权申请',
    icon: <FiClock />
  },
      ]
    },
    {
      path: '/profile',
      name: '个人资料',
      icon: <FiUser />
    },
    {
  path: '/api-docs',
  name: '系统文档',
  icon: <FiBookOpen />
},
    // 系统设置 (仅管理员)
    {
      path: '/settings',
      name: '系统设置',
      icon: <FiSettings />,
      adminOnly: true
    },
    // 用户管理 (仅管理员)
    {
      path: '/users',
      name: '用户管理',
      icon: <FiUsers />,
      adminOnly: true
    },
    {
      path: 'https://github.com/sbgumen/authorization-system', // 替换为您的 GitHub 项目链接
      name: 'GitHub项目',
      icon: <FiGithub />,
      external: true // 标记为外部链接
    },
    
  ];

  // 侧边栏动画
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    closed: {
      x: '-100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  };

  // 检查路由是否活跃
  const isActive = (path) => {
    if (path === '/licenses' && location.pathname.startsWith('/licenses')) {
      return true;
    }
    return location.pathname === path;
  };

  // 渲染菜单项
  const SidebarMenuItem = ({ route, isOpen, setIsOpen }) => {
    const [isSubMenuOpen, setIsSubMenuOpen] = React.useState(
      route.subRoutes && route.subRoutes.some(subRoute => location.pathname === subRoute.path)
    );

    const toggleSubMenu = () => {
      if (route.subRoutes) {
        setIsSubMenuOpen(!isSubMenuOpen);
      }
    };

    return (
      <div className="mb-2">
        {route.subRoutes ? (
          <>
            <button
              onClick={toggleSubMenu}
              className={`flex items-center w-full py-2.5 px-4 rounded-lg transition-all duration-200 ${
                isActive(route.path)
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                  : 'text-gray-300 hover:bg-slate-700'
              }`}
            >
              <span className="text-lg mr-3">{route.icon}</span>
              <span className="flex-1 text-left">{route.name}</span>
              <motion.span
                animate={{ rotate: isSubMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <FiChevronDown />
              </motion.span>
            </button>

            <AnimatePresence>
              {isSubMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-10 mt-1 space-y-1"
                >
                  {route.subRoutes.map((subRoute, idx) => (
                    <Link
                      key={idx}
                      to={subRoute.path}
                      onClick={() => setIsOpen(false)}
                      className={`block py-2 px-3 rounded-md transition-all duration-200 ${
                        location.pathname === subRoute.path
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-slate-700'
                      }`}
                    >
                      {subRoute.name}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        ) : (
          <Link
            to={route.path}
            onClick={() => setIsOpen(false)}
            className={`flex items-center py-2.5 px-4 rounded-lg transition-all duration-200 ${
              isActive(route.path)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white'
                : 'text-gray-300 hover:bg-slate-700'
            }`}
          >
            <span className="text-lg mr-3">{route.icon}</span>
            <span>{route.name}</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <>
      {/* 桌面版侧边栏 */}
      <div className="hidden md:flex md:flex-col md:w-64 bg-slate-800 border-r border-slate-700 shadow-xl">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* 侧边栏标题 */}
          <div className="flex items-center justify-center h-16 border-b border-slate-700">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500"
            >
              授权系统
            </motion.div>
          </div>

          {/* 侧边栏菜单 */}
          <div className="px-4 py-6">
            {routes.map((route, index) => (
              (!route.adminOnly || currentUser?.role === 'admin') && (
                <SidebarMenuItem 
                  key={index} 
                  route={route} 
                  isOpen={isOpen} 
                  setIsOpen={setIsOpen} 
                />
              )
            ))}
          </div>
        </div>
      </div>

      {/* 移动版侧边栏 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed inset-y-0 left-0 z-20 w-64 bg-slate-800 border-r border-slate-700 shadow-xl"
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="flex flex-col flex-1 overflow-y-auto">
              {/* 侧边栏标题 */}
              <div className="flex items-center justify-center h-16 border-b border-slate-700">
                <div className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                  授权系统
                </div>
              </div>

              {/* 侧边栏菜单 */}
              <div className="px-4 py-6">
                {routes.map((route, index) => (
                  (!route.adminOnly || currentUser?.role === 'admin') && (
                    <SidebarMenuItem 
                      key={index} 
                      route={route} 
                      isOpen={isOpen} 
                      setIsOpen={setIsOpen} 
                    />
                  )
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;