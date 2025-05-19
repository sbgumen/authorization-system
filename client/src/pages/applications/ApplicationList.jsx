import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiInfo,
  FiSettings,
  FiKey,
  FiList 
} from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

// 获取应用列表
const fetchApplications = async () => {
  const response = await axios.get('/api/applications');
  return response.data.applications;
};

// 删除应用
const deleteApplication = async (id) => {
  const response = await axios.delete(`/api/applications/${id}`);
  return response.data;
};

const ApplicationList = () => {
  const queryClient = useQueryClient();
  
  // 状态
  const [search, setSearch] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAppId, setDeleteAppId] = useState(null);
  
  // 查询应用列表
  const { data: applications, isLoading, error, refetch } = useQuery('applications', fetchApplications);
  
  // 删除应用突变
  const deleteMutation = useMutation(deleteApplication, {
    onSuccess: () => {
      toast.success('应用删除成功');
      queryClient.invalidateQueries('applications');
      setShowDeleteModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '删除应用失败');
    }
  });
  
  // 处理删除应用
  const handleDelete = () => {
    if (deleteAppId) {
      deleteMutation.mutate(deleteAppId);
    }
  };
  
  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    // 简单实现前端过滤
  };
  
  // 清除搜索
  const clearSearch = () => {
    setSearch('');
  };
  
  // 过滤应用
  const filteredApps = applications
    ? applications.filter(app => 
        app.name.toLowerCase().includes(search.toLowerCase()) ||
        app.description?.toLowerCase().includes(search.toLowerCase())
      )
    : [];
  
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
        <div className="text-red-500 text-xl mb-4">获取应用列表失败</div>
        <Button onClick={() => refetch()}>重试</Button>
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
      <motion.div variants={itemVariants} className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">我的应用</h1>
          <p className="text-gray-400 mt-1">管理您的应用和授权系统</p>
        </div>
        <Button
          to="/applications/create"
          variant="primary"
          icon={<FiPlus />}
        >
          创建应用
        </Button>
      </motion.div>
      
      {/* 搜索栏 */}
      <motion.div variants={itemVariants} className="bg-slate-800 rounded-xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索应用名称或描述..."
              className="w-full py-2 px-4 pl-10 bg-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                &times;
              </button>
            )}
          </div>
          
          <Button
            onClick={() => refetch()}
            variant="secondary"
            icon={<FiRefreshCw />}
            className="px-3"
          >
            刷新
          </Button>
        </form>
      </motion.div>
      
      {/* 应用列表 */}
      {filteredApps.length === 0 ? (
        <motion.div
          variants={itemVariants}
          className="bg-slate-800 rounded-xl shadow-lg p-10 text-center"
        >
          <div className="text-gray-400 mb-6">
            <FiInfo className="inline-block text-5xl mb-4" />
            <p className="text-xl">您还没有创建任何应用</p>
            <p className="mt-2">创建应用后，您可以为应用生成和管理授权码</p>
          </div>
          <Button
            to="/applications/create"
            variant="primary"
            icon={<FiPlus />}
          >
            创建第一个应用
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredApps.map(app => (
            <motion.div
  key={app.id}
  className="bg-slate-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
  whileHover={{ y: -5 }}
>
  <div className="p-6">
    <h2 className="text-xl font-semibold text-white mb-2">{app.name}</h2>
    <p className="text-gray-400 mb-4 line-clamp-2">{app.description || '无描述'}</p>
    
    <div className="text-sm text-gray-500 mb-4">
      应用ID: <span className="font-mono">{app.appId}</span>
    </div>
    

    <div className="mt-4 flex flex-col gap-2">
      <div className="flex gap-2 justify-between">

        <div className="flex-1">
          <Link
            to={`/applications/${app.id}`}
            className="flex items-center justify-center py-2 px-4 bg-blue-600 bg-opacity-20 text-blue-400 hover:bg-opacity-30 rounded-lg transition-colors w-full"
          >
            <FiInfo className="mr-2" size={16} />
            查看详情
          </Link>
        </div>
        <div className="flex-1">
          <Link
            to={`/licenses/create?applicationId=${app.id}`}
            className="flex items-center justify-center py-2 px-4 bg-green-600 bg-opacity-20 text-green-400 hover:bg-opacity-30 rounded-lg transition-colors w-full"
          >
            <FiKey className="mr-2" size={16} />
            生成授权码
          </Link>
        </div>
      </div>
      
      <div className="flex gap-2 justify-between">

        <div className="flex-1">
          <Link
            to={`/applications/${app.id}/edit`}
            className="flex items-center justify-center py-2 px-4 bg-yellow-600 bg-opacity-20 text-yellow-400 hover:bg-opacity-30 rounded-lg transition-colors w-full"
          >
            <FiEdit className="mr-2" size={16} />
            编辑应用
          </Link>
        </div>
        

        <div className="flex-1">
          <Link
            to={`/licenses?applicationId=${app.id}`}
            className="flex items-center justify-center py-2 px-4 bg-purple-600 bg-opacity-20 text-purple-400 hover:bg-opacity-30 rounded-lg transition-colors w-full"
          >
            <FiList className="mr-2" size={16} />
            授权列表
          </Link>
        </div>
      </div>
      

      <button
        onClick={() => {
          setDeleteAppId(app.id);
          setShowDeleteModal(true);
        }}
        className="flex items-center justify-center py-2 px-4 mt-2 bg-red-600 bg-opacity-20 text-red-400 hover:bg-opacity-30 rounded-lg transition-colors w-full"
      >
        <FiTrash2 className="mr-2" size={16} />
        删除应用
      </button>
    </div>
  </div>
</motion.div>
          ))}
        </motion.div>
      )}
      
      {/* 删除确认弹窗 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除应用"
      >
        <div className="mb-6">
          <p className="text-gray-300">确定要删除这个应用吗？此操作不可逆。</p>
          <p className="text-yellow-400 mt-4">
            <FiInfo className="inline-block mr-2" />
            删除应用将同时删除所有相关的授权码。
          </p>
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

export default ApplicationList;