import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiRefreshCw,
  FiInfo,
  FiCalendar,
  FiBox
} from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

// 获取授权申请列表
const fetchLicenseApplications = async (page = 1, limit = 10) => {
  const response = await axios.get('/api/licenses/applications', {
    params: { page, limit }
  });
  return response.data;
};

// 处理授权申请
const processApplication = async ({ id, action, expiresAt }) => {
  const response = await axios.post(`/api/licenses/${id}/process`, {
    action,
    expiresAt
  });
  return response.data;
};

const LicenseApplications = () => {
  const queryClient = useQueryClient();
  
  // 状态
  const [page, setPage] = useState(1);
  const [selectedApp, setSelectedApp] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  
  // 获取授权申请列表
  const { data, isLoading, error, refetch } = useQuery(
    ['licenseApplications', page],
    () => fetchLicenseApplications(page),
    {
      keepPreviousData: true
    }
  );
  
  // 处理申请突变
  const processMutation = useMutation(processApplication, {
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries('licenseApplications');
      setShowApproveModal(false);
      setShowRejectModal(false);
      setSelectedApp(null);
      setExpiresAt('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '处理申请失败');
    }
  });
  
  // 批准申请
  const handleApprove = () => {
    processMutation.mutate({
      id: selectedApp.id,
      action: 'approve',
      expiresAt: expiresAt || null
    });
  };
  
  // 拒绝申请
  const handleReject = () => {
    processMutation.mutate({
      id: selectedApp.id,
      action: 'reject'
    });
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
      <div className="flex items-center justify-center h-full">
        <Loader size={60} />
      </div>
    );
  }
  
  // 错误状态
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-red-500 text-xl mb-4">获取授权申请列表失败</div>
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
          <h1 className="text-2xl font-bold text-white">授权申请管理</h1>
          <p className="text-gray-400 mt-1">处理用户的授权激活申请</p>
        </div>
        <Button
          onClick={() => refetch()}
          variant="secondary"
          icon={<FiRefreshCw />}
        >
          刷新
        </Button>
      </motion.div>
      
      {/* 申请列表 */}
      <motion.div variants={itemVariants} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        {data?.applications?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiClock className="text-5xl mb-4" />
            <p className="text-xl">暂无待处理的授权申请</p>
            <p className="mt-2">有新的申请时会显示在这里</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-700 text-gray-300">
                  <tr>
                    <th className="py-3 px-4 text-left">授权码</th>
                    <th className="py-3 px-4 text-left">所属应用</th>
                    <th className="py-3 px-4 text-left">申请用户</th>
                    <th className="py-3 px-4 text-left">申请时间</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {data.applications.map((app) => (
                    <motion.tr
                      key={app.id}
                      className="hover:bg-slate-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono">{app.licenseKey}</span>
                      </td>
                      <td className="py-3 px-4">
                        {app.application ? (
                          <div className="flex items-center">
                            <FiBox className="mr-2 text-blue-400" size={16} />
                            <span>{app.application.name}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">未知应用</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {app.userInfo ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <FiUser className="mr-2 text-green-400" size={16} />
                              <span>
                                {app.userInfo.name || app.userInfo.username || '未知用户'}
                              </span>
                            </div>
                            {app.userInfo.email && (
                              <div className="text-sm text-gray-400">
                                {app.userInfo.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-500">无用户信息</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-300">
                          <FiCalendar size={14} />
                          <span>{formatDate(app.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowApproveModal(true);
                            }}
                            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-900 hover:bg-opacity-30 rounded-md transition-colors"
                            title="批准申请"
                          >
                            <FiCheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setShowRejectModal(true);
                            }}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-30 rounded-md transition-colors"
                            title="拒绝申请"
                          >
                            <FiXCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* 分页 */}
            {data.totalPages > 1 && (
              <div className="p-4 flex justify-between items-center border-t border-slate-700">
                <div className="text-gray-400">
                  总计 {data.totalItems} 个申请，共 {data.totalPages} 页
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setPage(page > 1 ? page - 1 : 1)}
                    disabled={page <= 1}
                    variant="secondary"
                    size="sm"
                  >
                    上一页
                  </Button>
                  <span className="inline-flex items-center px-3 py-1 rounded bg-slate-700 text-white">
                    {page} / {data.totalPages || 1}
                  </span>
                  <Button
                    onClick={() => setPage(page < data.totalPages ? page + 1 : data.totalPages)}
                    disabled={page >= data.totalPages}
                    variant="secondary"
                    size="sm"
                  >
                    下一页
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
      
      {/* 批准申请弹窗 */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="批准授权申请"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">申请信息</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">授权码:</span> <span className="font-mono text-white">{selectedApp.licenseKey}</span></div>
                <div><span className="text-gray-400">应用:</span> <span className="text-white">{selectedApp.application?.name}</span></div>
                <div><span className="text-gray-400">申请用户:</span> <span className="text-white">{selectedApp.userInfo?.name || selectedApp.userInfo?.username || '未知'}</span></div>
                {selectedApp.userInfo?.email && (
                  <div><span className="text-gray-400">邮箱:</span> <span className="text-white">{selectedApp.userInfo.email}</span></div>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                过期时间（可选）
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                留空表示永久有效
              </p>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setShowApproveModal(false)}
                variant="secondary"
              >
                取消
              </Button>
              <Button
                onClick={handleApprove}
                variant="success"
                icon={<FiCheckCircle />}
                disabled={processMutation.isLoading}
              >
                {processMutation.isLoading ? '处理中...' : '批准申请'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* 拒绝申请弹窗 */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="拒绝授权申请"
      >
        {selectedApp && (
          <div className="space-y-6">
            <div className="bg-slate-700 p-4 rounded-lg">
              <h3 className="text-white font-medium mb-2">申请信息</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">授权码:</span> <span className="font-mono text-white">{selectedApp.licenseKey}</span></div>
                <div><span className="text-gray-400">应用:</span> <span className="text-white">{selectedApp.application?.name}</span></div>
                <div><span className="text-gray-400">申请用户:</span> <span className="text-white">{selectedApp.userInfo?.name || selectedApp.userInfo?.username || '未知'}</span></div>
              </div>
            </div>
            
            <div className="text-yellow-400 text-sm">
              <FiInfo className="inline-block mr-2" />
              拒绝后，授权码将被标记为已撤销状态，无法再次申请。
            </div>
            
            <div className="flex justify-end gap-4">
              <Button
                onClick={() => setShowRejectModal(false)}
                variant="secondary"
              >
                取消
              </Button>
              <Button
                onClick={handleReject}
                variant="danger"
                icon={<FiXCircle />}
                disabled={processMutation.isLoading}
              >
                {processMutation.isLoading ? '处理中...' : '拒绝申请'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};

export default LicenseApplications;