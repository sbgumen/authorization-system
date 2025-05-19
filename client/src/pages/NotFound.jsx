import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import Button from '../components/common/Button';

const NotFound = () => {
  const navigate = useNavigate();
  
  // 页面动画
  const containerVariants = {
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
    hidden: { opacity: 0, y: 50 },
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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 px-4 py-12"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          variants={itemVariants}
          className="text-6xl sm:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 mb-6"
        >
          404
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="text-yellow-400 flex justify-center mb-6"
        >
          <FiAlertTriangle size={50} />
        </motion.div>
        
        <motion.h1
          variants={itemVariants}
          className="text-2xl sm:text-3xl font-bold text-white mb-4"
        >
          页面未找到
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className="text-gray-400 mb-8"
        >
          抱歉，您访问的页面不存在或已被移除。
        </motion.p>
        
        <motion.div variants={itemVariants}>
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            icon={<FiArrowLeft />}
          >
            返回首页
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default NotFound;