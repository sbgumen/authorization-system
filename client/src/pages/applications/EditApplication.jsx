
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

// 获取应用详情
const fetchAppDetail = async (id) => {
  const response = await axios.get(`/api/applications/${id}`);
  return response.data.application;
};

// 更新应用
const updateApplication = async ({ id, data }) => {
  const response = await axios.put(`/api/applications/${id}`, data);
  return response.data;
};

const EditApplication = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 表单状态
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [licensePrefix, setLicensePrefix] = useState('LS-');
  const [licenseSegments, setLicenseSegments] = useState(4);
  const [licenseSegmentLength, setLicenseSegmentLength] = useState(5);
  const [licenseDelimiter, setLicenseDelimiter] = useState('-');
  
  // 获取应用详情
  const { data: application, isLoading, error } = useQuery(
    ['application', id],
    () => fetchAppDetail(id)
  );
  
  // 更新应用突变
  const updateMutation = useMutation(updateApplication, {
    onSuccess: () => {
      toast.success('应用更新成功');
      queryClient.invalidateQueries(['application', id]);
      navigate(`/applications/${id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '更新应用失败');
    }
  });
  
  // 初始化表单数据
  useEffect(() => {
    if (application) {
      setName(application.name || '');
      setDescription(application.description || '');
      setLicensePrefix(application.licensePrefix || 'LS-');
      setLicenseSegments(application.licenseSegments || 4);
      setLicenseSegmentLength(application.licenseSegmentLength || 5);
      setLicenseDelimiter(application.licenseDelimiter || '-');
    }
  }, [application]);
  
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
    
    updateMutation.mutate({ id, data: appData });
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
        <div className="text-red-500 text-xl mb-4">获取应用详情失败</div>
        <Button onClick={() => navigate('/applications')}>返回列表</Button>
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
      {/* 页面标题 */}
      <motion.div variants={itemVariants} className="flex items-center mb-6">
        <Button
          onClick={() => navigate(`/applications/${id}`)}
          variant="ghost"
          icon={<FiArrowLeft />}
          className="p-2 mr-4"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">编辑应用</h1>
          <p className="text-gray-400 mt-1">修改应用信息和授权码格式</p>
        </div>
      </motion.div>
      
      {/* 编辑表单 */}
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
            disabled={updateMutation.isLoading}
          >
            {updateMutation.isLoading ? '保存中...' : '保存更改'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default EditApplication;