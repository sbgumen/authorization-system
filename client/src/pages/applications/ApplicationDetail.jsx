import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiArrowLeft,
  FiEdit,
  FiKey,
  FiInfo,
  FiCopy
} from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

// 获取应用详情
const fetchAppDetail = async (id) => {
  const response = await axios.get(`/api/applications/${id}`);
  return response.data.application;
};

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // 获取应用详情
  const { data: application, isLoading, error } = useQuery(
    ['application', id],
    () => fetchAppDetail(id)
  );
  
  
  const copytxt = (text) => {
    // 创建临时文本区域
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    
    // 选择文本区域中的文本
    textarea.select();
    textarea.setSelectionRange(0, 99999); // 对于手机，选择范围
    
    // 执行复制命令
    document.execCommand('copy');
    
    // 移除临时文本区域
    document.body.removeChild(textarea);
};
  // 复制应用ID
  const copyAppId = () => {
    if (application?.appId) {
      copytxt(application.appId);
      toast.success('应用ID已复制到剪贴板');
    }
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
  
  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-yellow-500 text-xl mb-4">应用不存在或已被删除</div>
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
          onClick={() => navigate('/applications')}
          variant="ghost"
          icon={<FiArrowLeft />}
          className="p-2 mr-4"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{application.name}</h1>
          <p className="text-gray-400 mt-1">应用详情和授权码管理</p>
        </div>
        <Button
          onClick={() => navigate(`/applications/${id}/edit`)}
          variant="secondary"
          icon={<FiEdit />}
        >
          编辑应用
        </Button>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 应用信息 */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-slate-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <FiInfo className="mr-2" /> 基本信息
          </h2>
          
          <div className="space-y-6">
            {/* 应用ID */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">应用ID</label>
              <div className="flex">
                <div className="flex-1 bg-slate-700 rounded-l-lg py-3 px-4 font-mono text-white">
                  {application.appId}
                </div>
                <Button
                  onClick={copyAppId}
                  variant="secondary"
                  icon={<FiCopy />}
                  className="rounded-l-none px-3"
                >
                  复制
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                在您的软件中验证授权码时需要提供此ID
              </p>
            </div>
            
            {/* 应用描述 */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">应用描述</label>
              <div className="bg-slate-700 rounded-lg py-3 px-4 text-white min-h-[100px]">
                {application.description || <span className="text-gray-500">暂无描述</span>}
              </div>
            </div>
            
            {/* 授权码格式 */}
            <div>
              <label className="block text-gray-400 text-sm mb-2">授权码格式</label>
              <div className="bg-slate-700 rounded-lg py-3 px-4 text-white font-mono">
                {application.licensePrefix}{'X'.repeat(application.licenseSegmentLength)}
                {application.licenseDelimiter}{'X'.repeat(application.licenseSegmentLength)}
                {application.licenseSegments > 3 ? application.licenseDelimiter + 'X'.repeat(application.licenseSegmentLength) : ''}
                {application.licenseDelimiter}Y
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* 统计信息 */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <FiKey className="mr-2" /> 授权统计
          </h2>
          
          <div className="space-y-4">
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">总授权码</div>
              <div className="text-white text-2xl font-bold mt-1">
                {application.stats?.totalLicenses || 0}
              </div>
            </div>
            
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">已激活</div>
              <div className="text-green-400 text-2xl font-bold mt-1">
                {application.stats?.activeLicenses || 0}
              </div>
            </div>
            
            <div className="bg-slate-700 bg-opacity-50 rounded-lg p-4">
              <div className="text-gray-400 text-sm">待授权</div>
              <div className="text-yellow-400 text-2xl font-bold mt-1">
                {application.stats?.pendingLicenses || 0}
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-3">
            <Button
              to={`/licenses/create?applicationId=${id}`}
              variant="primary"
              fullWidth={true}
              icon={<FiKey />}
            >
              生成授权码
            </Button>
            
            <Button
              to={`/licenses?applicationId=${id}`}
              variant="secondary"
              fullWidth={true}
            >
              查看授权码
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ApplicationDetail;