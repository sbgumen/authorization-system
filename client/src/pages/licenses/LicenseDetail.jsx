import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiCalendar,
  FiUser,
  FiInfo,
  FiEdit,
  FiTrash2,
  FiCopy,
  FiSave
} from 'react-icons/fi';
import { getLicenseById, updateLicense, deleteLicense } from '../../services/licenseService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const LicenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // 状态
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // 获取授权码详情
  const { data, isLoading, error } = useQuery(
    ['license', id],
    () => getLicenseById(id),
    {
      onSuccess: (data) => {
        setStatus(data.license.status);
        setExpiresAt(data.license.expiresAt ? new Date(data.license.expiresAt).toISOString().split('T')[0] : '');
      }
    }
  );
  
  // 更新授权码
  const updateMutation = useMutation(
    (updateData) => updateLicense(id, updateData),
    {
      onSuccess: () => {
        toast.success('授权码更新成功');
        setIsEditing(false);
        queryClient.invalidateQueries(['license', id]);
      },
      onError: (error) => {
        toast.error(error.message || '更新授权码失败');
      }
    }
  );
  
  // 删除授权码
  const deleteMutation = useMutation(
    () => deleteLicense(id),
    {
      onSuccess: () => {
        toast.success('授权码删除成功');
        navigate('/licenses');
      },
      onError: (error) => {
        toast.error(error.message || '删除授权码失败');
      }
    }
  );
  
  // 处理保存编辑
  const handleSaveEdit = () => {
    const updateData = {
      status,
      expiresAt: expiresAt || null
    };
    
    updateMutation.mutate(updateData);
  };
  
  // 处理删除
  const handleDelete = () => {
    deleteMutation.mutate();
  };
  
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

  // 复制授权码
  const copyToClipboard = (text) => {
    copytxt(text);
    toast.success('授权码已复制到剪贴板');
  };
  
  // 获取状态标签
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 text-sm rounded-full bg-green-500 bg-opacity-20 text-green-400 flex items-center">
            <FiCheckCircle className="mr-1" /> 已激活
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 text-sm rounded-full bg-yellow-500 bg-opacity-20 text-yellow-400 flex items-center">
            <FiClock className="mr-1" /> 待授权
          </span>
        );
      case 'expired':
        return (
          <span className="px-3 py-1 text-sm rounded-full bg-red-500 bg-opacity-20 text-red-400 flex items-center">
            <FiXCircle className="mr-1" /> 已过期
          </span>
        );
      case 'revoked':
        return (
          <span className="px-3 py-1 text-sm rounded-full bg-gray-500 bg-opacity-20 text-gray-400 flex items-center">
            <FiXCircle className="mr-1" /> 已撤销
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-sm rounded-full bg-gray-500 bg-opacity-20 text-gray-400">
            未知
          </span>
        );
    }
  };
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '无';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
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
      <div className="flex justify-center items-center h-full">
        <Loader size={60} />
      </div>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 text-xl mb-4">获取授权码详情失败</div>
        <Button onClick={() => navigate('/licenses')}>返回列表</Button>
      </div>
    );
  }
  
  const license = data?.license;
  
  if (!license) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-yellow-500 text-xl mb-4">授权码不存在</div>
        <Button onClick={() => navigate('/licenses')}>返回列表</Button>
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
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/licenses')}
            variant="ghost"
            icon={<FiArrowLeft />}
            className="p-2"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">授权码详情</h1>
            <p className="text-gray-400 mt-1">查看和管理授权码信息</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {!isEditing ? (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                variant="secondary"
                icon={<FiEdit />}
              >
                编辑
              </Button>
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="danger"
                icon={<FiTrash2 />}
              >
                删除
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(false)}
                variant="secondary"
              >
                取消
              </Button>
              <Button
                onClick={handleSaveEdit}
                variant="primary"
                icon={<FiSave />}
                disabled={updateMutation.isLoading}
              >
                {updateMutation.isLoading ? '保存中...' : '保存'}
              </Button>
            </>
          )}
        </div>
      </motion.div>
      
      {/* 授权码详情 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要信息 */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-slate-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <FiInfo className="mr-2" /> 基本信息
          </h2>
          
          {/* 授权码 */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">授权码</label>
            <div className="flex items-center">
              <div className="bg-slate-700 rounded-lg py-3 px-4 font-mono text-white flex-1">
                {license.licenseKey}
              </div>
              <Button
                onClick={() => copyToClipboard(license.licenseKey)}
                variant="secondary"
                icon={<FiCopy />}
                className="ml-2 px-3"
              >
                复制
              </Button>
            </div>
          </div>
          
          {/* 状态 */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">状态</label>
            {isEditing ? (
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">待授权</option>
                <option value="active">已激活</option>
                <option value="expired">已过期</option>
                <option value="revoked">已撤销</option>
              </select>
            ) : (
              <div className="py-2">
                {getStatusBadge(license.status)}
              </div>
            )}
          </div>
          
          {/* 过期时间 */}
          <div className="mb-6">
            <label className="block text-gray-400 text-sm mb-2">过期时间</label>
            {isEditing ? (
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="py-2 text-white flex items-center">
                <FiCalendar className="mr-2" />
                {license.expiresAt ? formatDate(license.expiresAt) : '永久有效'}
              </div>
            )}
          </div>
          
          {/* 时间信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">创建时间</label>
              <div className="py-2 text-white flex items-center">
                <FiCalendar className="mr-2" />
                {formatDate(license.createdAt)}
              </div>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-2">激活时间</label>
              <div className="py-2 text-white flex items-center">
                {license.activatedAt ? (
                  <>
                    <FiCalendar className="mr-2" />
                    {formatDate(license.activatedAt)}
                  </>
                ) : (
                  <span className="text-gray-500">未激活</span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* 用户信息 */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-800 rounded-xl shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
            <FiUser className="mr-2" /> 用户信息
          </h2>
          
          {license.userInfo ? (
            <div className="space-y-4">
              {Object.entries(license.userInfo).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-gray-400 text-sm mb-1 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </label>
                  <div className="bg-slate-700 rounded-lg py-2 px-3 text-white">
                    {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FiInfo className="text-4xl mb-3" />
              <p>暂无用户信息</p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* 删除确认弹窗 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除授权码"
      >
        <div className="mb-6">
          <p className="text-gray-300">确定要删除这个授权码吗？此操作不可逆。</p>
          <div className="mt-4 bg-slate-700 p-3 rounded-lg">
            <div className="font-mono text-white">{license.licenseKey}</div>
          </div>
        </div>
        <div className="flex justify-end gap-4">
          <Button
            onClick={() => setShowDeleteModal(false)}
            variant="secondary"
          >
            取消
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            icon={<FiTrash2 />}
            disabled={deleteMutation.isLoading}
          >
            {deleteMutation.isLoading ? '删除中...' : '删除'}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default LicenseDetail;