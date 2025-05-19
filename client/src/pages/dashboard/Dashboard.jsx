import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FiKey, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle,
  FiPlusCircle,
  FiCalendar,
  FiGrid,
  FiActivity,
  FiPackage
} from 'react-icons/fi';
import axios from 'axios';
import StatCard from '../../components/dashboard/StatCard';
import LicenseChart from '../../components/dashboard/LicenseChart';
import RecentActivities from '../../components/dashboard/RecentActivities';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

// 获取仪表板统计数据
const fetchDashboardStats = async () => {
  const response = await axios.get('/api/dashboard/stats');
  return response.data;
};

// 获取最近活动
const fetchRecentActivities = async () => {
  const response = await axios.get('/api/dashboard/activities');
  return response.data;
};

const Dashboard = () => {
  // 获取统计数据
  const { 
    data: statsData, 
    isLoading: statsLoading, 
    error: statsError 
  } = useQuery('dashboardStats', fetchDashboardStats);
  
  // 获取活动数据
  const { 
    data: activitiesData, 
    isLoading: activitiesLoading 
  } = useQuery('recentActivities', fetchRecentActivities);
  
  // 解构统计数据
  const stats = statsData?.stats || {};
  const systemStats = statsData?.systemStats;
  const activities = activitiesData?.activities || [];
  
  // 加载状态
  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size={60} />
      </div>
    );
  }
  
  // 错误状态
  if (statsError) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 text-xl mb-4">获取统计数据失败</div>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    );
  }
  
  // 页面入场动画
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 页面标题 */}
      <div className="mb-6">
        <motion.h1 
          className="text-2xl font-bold text-white"
          variants={itemVariants}
        >
          仪表盘
        </motion.h1>
        <motion.p 
          className="text-gray-400 mt-1"
          variants={itemVariants}
        >
          查看您的授权系统实时数据和统计信息
        </motion.p>
      </div>

      {/* 快捷操作按钮 */}
      <motion.div 
        className="mb-6 flex flex-wrap gap-4"
        variants={itemVariants}
      >
        <Button 
          to="/applications/create" 
          variant="primary" 
          icon={<FiGrid />}
        >
          创建应用
        </Button>
        <Button 
          to="/licenses/create" 
          variant="outline" 
          icon={<FiKey />}
        >
          生成授权码
        </Button>
      </motion.div>

      {/* 统计卡片 */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={itemVariants}
      >
        <StatCard 
          title="总授权码" 
          value={stats.totalLicenses || 0} 
          icon={<FiKey />} 
          color="blue" 
        />
        <StatCard 
          title="已激活" 
          value={stats.activeLicenses || 0} 
          icon={<FiCheckCircle />} 
          color="green" 
        />
        <StatCard 
          title="待审核" 
          value={stats.pendingLicenses || 0} 
          icon={<FiClock />} 
          color="yellow" 
        />
        <StatCard 
          title="已失效" 
          value={(stats.expiredLicenses || 0) + (stats.revokedLicenses || 0)} 
          icon={<FiXCircle />} 
          color="red" 
        />
      </motion.div>

      {/* 应用数量 */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={itemVariants}
      >
        <StatCard 
          title="我的应用" 
          value={stats.applications || 0} 
          icon={<FiPackage />} 
          color="purple" 
          size="sm"
        />
        <StatCard 
          title="本周新增" 
          value={stats.weekLicenses || 0} 
          icon={<FiCalendar />} 
          color="indigo" 
          size="sm"
        />
        <StatCard 
          title="本月新增" 
          value={stats.monthLicenses || 0} 
          icon={<FiActivity />} 
          color="cyan" 
          size="sm"
        />
      </motion.div>
      
      {/* 管理员系统统计 */}
      {systemStats && (
        <motion.div 
          className="mb-8 bg-slate-800 rounded-xl p-4 shadow-lg"
          variants={itemVariants}
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
            <FiActivity className="mr-2" /> 系统统计 (管理员专用)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">系统用户</div>
              <div className="text-white text-2xl font-bold mt-1">
                {systemStats.totalUsers || 0}
              </div>
            </div>
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">总应用数</div>
              <div className="text-white text-2xl font-bold mt-1">
                {systemStats.totalApplications || 0}
              </div>
            </div>
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">系统授权码</div>
              <div className="text-white text-2xl font-bold mt-1">
                {systemStats.totalLicenses || 0}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 图表和活动记录 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-2 bg-slate-800 rounded-xl p-4 shadow-lg"
          variants={itemVariants}
        >
          <h2 className="text-lg font-semibold text-white mb-4">授权码状态分布</h2>
          <div className="h-72">
            <LicenseChart stats={stats} />
          </div>
        </motion.div>

        <motion.div 
          className="bg-slate-800 rounded-xl p-4 shadow-lg"
          variants={itemVariants}
        >
          <h2 className="text-lg font-semibold text-white mb-4">最近活动</h2>
          <RecentActivities 
            isLoading={activitiesLoading} 
            activities={activities} 
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;