import React from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { 
  FiKey, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle,
  FiPlusCircle,
  FiCalendar
} from 'react-icons/fi';
import { getLicenseStats } from '../../services/licenseService';
import StatCard from '../../components/dashboard/StatCard';
import LicenseChart from '../../components/dashboard/LicenseChart';
import RecentActivities from '../../components/dashboard/RecentActivities';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

const Dashboard = () => {
  // 获取授权码统计数据
  const { data, isLoading, error } = useQuery('licenseStats', getLicenseStats);

  // 加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader size={60} />
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 text-xl mb-4">获取统计数据失败</div>
        <Button onClick={() => window.location.reload()}>重试</Button>
      </div>
    );
  }

  const stats = data?.stats || {};

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
          欢迎回来，查看授权系统的实时数据和统计信息。
        </motion.p>
      </div>

      {/* 快捷操作按钮 */}
      <motion.div 
        className="mb-6 flex flex-wrap gap-4"
        variants={itemVariants}
      >
        <Button 
          to="/licenses/create" 
          variant="primary" 
          icon={<FiPlusCircle />}
        >
          生成授权码
        </Button>
        <Button 
          to="/licenses" 
          variant="outline" 
          icon={<FiKey />}
        >
          管理授权码
        </Button>
      </motion.div>

      {/* 统计卡片 */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={itemVariants}
      >
        <StatCard 
          title="总授权码" 
          value={stats.total || 0} 
          icon={<FiKey />} 
          color="blue" 
        />
        <StatCard 
          title="已激活" 
          value={stats.active || 0} 
          icon={<FiCheckCircle />} 
          color="green" 
        />
        <StatCard 
          title="待审核" 
          value={stats.pending || 0} 
          icon={<FiClock />} 
          color="yellow" 
        />
        <StatCard 
          title="已过期" 
          value={(stats.expired || 0) + (stats.revoked || 0)} 
          icon={<FiXCircle />} 
          color="red" 
        />
      </motion.div>

      {/* 时间区间统计 */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        variants={itemVariants}
      >
        <StatCard 
          title="今日新增" 
          value={stats.today || 0} 
          icon={<FiCalendar />} 
          color="purple" 
          size="sm"
        />
        <StatCard 
          title="本周新增" 
          value={stats.week || 0} 
          icon={<FiCalendar />} 
          color="indigo" 
          size="sm"
        />
        <StatCard 
          title="本月新增" 
          value={stats.month || 0} 
          icon={<FiCalendar />} 
          color="cyan" 
          size="sm"
        />
      </motion.div>

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
          <RecentActivities />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;