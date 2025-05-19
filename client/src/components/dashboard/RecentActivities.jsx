// client/src/components/dashboard/RecentActivities.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiCheckCircle, 
  FiPlusCircle, 
  FiXCircle, 
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';

// 模拟活动数据
const activities = [
  {
    type: 'create',
    message: '生成了10个新授权码',
    time: '10分钟前',
    icon: <FiPlusCircle />,
    color: 'text-blue-500'
  },
  {
    type: 'activate',
    message: '激活了授权码 LS-AB123-XYZ98',
    time: '30分钟前',
    icon: <FiCheckCircle />,
    color: 'text-green-500'
  },
  {
    type: 'apply',
    message: '有新的授权申请待处理',
    time: '1小时前',
    icon: <FiClock />,
    color: 'text-yellow-500'
  },
  {
    type: 'revoke',
    message: '撤销了授权码 LS-CD456-UVW32',
    time: '3小时前',
    icon: <FiXCircle />,
    color: 'text-red-500'
  },
  {
    type: 'update',
    message: '更新了系统配置',
    time: '5小时前',
    icon: <FiRefreshCw />,
    color: 'text-purple-500'
  }
];

const RecentActivities = () => {
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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      <div className="space-y-4 max-h-[calc(100%-2rem)] overflow-y-auto pr-2">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex items-start gap-3 bg-slate-700 bg-opacity-30 p-3 rounded-lg hover:bg-opacity-50 transition-all duration-200"
          >
            <div className={`p-2 rounded-full bg-slate-700 ${activity.color}`}>
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200">{activity.message}</p>
              <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.button
        variants={itemVariants}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="w-full mt-4 py-2 text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
      >
        查看所有活动
      </motion.button>
    </motion.div>
  );
};

export default RecentActivities;