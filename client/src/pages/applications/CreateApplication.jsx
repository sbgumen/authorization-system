import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';

// 创建应用
const createApplication = async (data) => {
  const response = await axios.post('/api/applications', data);
  return response.data;
};

const CreateApplication = () => {
  const navigate = useNavigate();
  
  // 表单状态
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [licensePrefix, setLicensePrefix] = useState('LS-');
  const [licenseSegments, setLicenseSegments] = useState(4);
  const [licenseSegmentLength, setLicenseSegmentLength] = useState(5);
  const [licenseDelimiter, setLicenseDelimiter] = useState('-');
  
  // 创建应用突变
  const createMutation = useMutation(createApplication, {
    onSuccess: (data) => {
      toast.success('应用创建成功');
      navigate('/applications');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '创建应用失败');
    }
  });
  
  // 提交表单
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('应用名称不能为空');
      return;
    }
    
    // 构建提交数据
    const appData = {
      name,
      description,
      licensePrefix,
      licenseSegments: parseInt(licenseSegments),
      licenseSegmentLength: parseInt(licenseSegmentLength),
      licenseDelimiter
    };
    
    createMutation.mutate(appData);
  };
  
  // 生成授权码预览
  const generatePreview = () => {
    let preview = licensePrefix;
    
    for (let i = 0; i < licenseSegments - 1; i++) {
      for (let j = 0; j < licenseSegmentLength; j++) {
        preview += 'X';
      }
      preview += licenseDelimiter;
    }
    
    preview += 'Y'; // 示例校验位
    
    return preview;
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
      <motion.div variants={itemVariants} className="flex items-center mb-6">
        <Button
          onClick={() => navigate('/applications')}
          variant="ghost"
          icon={<FiArrowLeft />}
          className="p-2 mr-4"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">创建应用</h1>
          <p className="text-gray-400 mt-1">为您的软件或服务创建一个新的授权应用</p>
        </div>
      </motion.div>
      
      {/* 创建表单 */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 基本信息 */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6">基本信息</h2>
            
            <div className="space-y-6">
              {/* 应用名称 */}
              <div>
                <label className="block text-gray-300 mb-2">应用名称 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入应用名称"
                  className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {/* 应用描述 */}
              <div>
                <label className="block text-gray-300 mb-2">应用描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="输入应用描述（可选）"
                  className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none"
                />
              </div>
            </div>
          </motion.div>
          
          {/* 授权码格式 */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6">授权码格式</h2>
            
            <div className="space-y-6">
              {/* 授权码前缀 */}
              <div>
                <label className="block text-gray-300 mb-2">授权码前缀</label>
                <input
                  type="text"
                  value={licensePrefix}
                  onChange={(e) => setLicensePrefix(e.target.value)}
                  className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={10}
                />
              </div>
              
              {/* 段数 */}
              <div>
                <label className="block text-gray-300 mb-2">段数</label>
                <input
                  type="number"
                  value={licenseSegments}
                  onChange={(e) => setLicenseSegments(e.target.value)}
                  min={2}
                  max={6}
                  className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* 每段长度 */}
              <div>
                <label className="block text-gray-300 mb-2">每段长度</label>
                <input
                  type="number"
                  value={licenseSegmentLength}
                  onChange={(e) => setLicenseSegmentLength(e.target.value)}
                  min={3}
                  max={10}
                  className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* 分隔符 */}
              <div>
                <label className="block text-gray-300 mb-2">分隔符</label>
                <input
                  type="text"
                  value={licenseDelimiter}
                  onChange={(e) => setLicenseDelimiter(e.target.value)}
                  maxLength={1}
                  className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* 授权码预览 */}
              <div>
                <label className="block text-gray-300 mb-2">预览</label>
                <div className="bg-slate-700 rounded-lg py-3 px-4 font-mono text-white border border-slate-600">
                  {generatePreview()}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* 提交按钮 */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex justify-end"
        >
          <Button
            type="submit"
            variant="primary"
            icon={<FiSave />}
            disabled={createMutation.isLoading}
          >
            {createMutation.isLoading ? '创建中...' : '创建应用'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default CreateApplication;