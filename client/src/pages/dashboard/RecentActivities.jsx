import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiPlusCircle, 
  FiXCircle, 
  FiClock,
  FiRefreshCw,
  FiGrid
} from 'react-icons/fi';
import Loader from '../common/Loader';

// 格式化时间
const formatTime = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // 差异（秒）
  
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
  
  return date.toLocaleDateString();
};

// 获取活动图标和颜色
const getActivityMeta = (activity) => {
  if (activity.type === 'license') {
    switch (activity.action) {
      case 'active':
        return { icon: <FiCheckCircle />, color: 'text-green-500' };
      case 'pending':
        return { icon: <FiClock />, color: 'text-yellow-500' };
      case 'expired':
        return { icon: <FiXCircle />, color: 'text-red-500' };
      case 'revoked':
        return { icon: <FiXCircle />, color: 'text-red-500' };
      default:
        return { icon: <FiPlusCircle />, color: 'text-blue-500' };
    }
  }
  
  return { icon: <FiGrid />, color: 'text-blue-500' };
};

// 获取活动消息
const getActivityMessage = (activity) => {
  if (activity.type === 'license') {
    switch (activity.action) {
      case 'active':
        return `授权码 ${activity.licenseKey.slice(0, 10)}... 已激活`;
      case 'pending':
        return `生成了新授权码 ${activity.licenseKey.slice(0, 10)}...`;
      case 'expired':
        return `授权码 ${activity.licenseKey.slice(0, 10)}... 已过期`;
      case 'revoked':
        return `授权码 ${activity.licenseKey.slice(0, 10)}... 已撤销`;
      default:
        return `授权码 ${activity.licenseKey.slice(0, 10)}... 状态更新`;
    }
  }
  
  return '未知活动';
};

const RecentActivities = ({ isLoading, activities = [] }) => {
  // 动画配置
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
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={40} />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        暂无活动记录
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <div className="space-y-4 max-h-[calc(100%-2rem)] overflow-y-auto pr-2">
        {activities.map((activity, index) => {
          const { icon, color } = getActivityMeta(activity);
          const message = getActivityMessage(activity);
          
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200"
            >
              <div className={`p-2 rounded-full bg-slate-700 ${color}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200">{message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {activity.applicationName && (
                    <span className="inline-block bg-slate-600 text-gray-300 px-1.5 py-0.5 rounded text-xs mr-2">
                      {activity.applicationName}
                    </span>
                  )}
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default RecentActivities;