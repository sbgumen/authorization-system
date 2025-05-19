// client/src/components/dashboard/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  size = 'md' 
}) => {
  // 颜色配置
  const colorVariants = {
    blue: 'from-blue-500 to-indigo-600',
    green: 'from-green-500 to-emerald-600',
    red: 'from-red-500 to-rose-600',
    yellow: 'from-yellow-500 to-amber-600',
    purple: 'from-purple-500 to-pink-600',
    indigo: 'from-indigo-500 to-violet-600',
    cyan: 'from-cyan-500 to-blue-500'
  };

  // 尺寸配置
  const sizeVariants = {
    sm: 'py-3 px-4',
    md: 'py-5 px-6'
  };

  // 进入动画配置
  const cardVariants = {
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
      variants={cardVariants}
      className={`bg-slate-800 rounded-xl ${sizeVariants[size]} relative overflow-hidden shadow-lg`}
    >
      {/* 背景装饰 */}
      <div className={`absolute top-0 right-0 w-16 h-16 md:w-20 md:h-20 rounded-bl-full bg-gradient-to-br opacity-10 transform rotate-180 ${colorVariants[color]}`} />
      <div className={`absolute bottom-0 left-0 w-16 h-16 md:w-20 md:h-20 rounded-tr-full bg-gradient-to-br opacity-10 ${colorVariants[color]}`} />
      
      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-gray-400 text-sm mb-1">{title}</h3>
          <div className="text-white text-xl md:text-2xl font-bold">
            <CountUp start={0} end={value} duration={2} separator="," />
          </div>
        </div>
        
        <div className={`text-2xl p-2 rounded-lg bg-gradient-to-br ${colorVariants[color]} bg-opacity-20`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;