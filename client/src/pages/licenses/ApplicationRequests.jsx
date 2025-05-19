// client/src/pages/licenses/ApplicationRequests.jsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiUserCheck,
  FiUserX,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiInfo,
  FiUser,
  FiMail,
  FiMonitor,
  FiCalendar
} from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

// 获取待处理授权申请
const fetchPendingApplications = async () => {
  const response = await axios.get('/api/licenses/applications/pending');
  return response.data.pendingApplications;
};

// 处理授权申请
const processApplication = async ({ id, approved }) => {
  const response = await axios.post('/api/licenses/applications/process', {
    id,
    approved
  });
  return response.data;
};

const ApplicationRequests = () => {
  const queryClient = useQueryClient();
  
  // 状态
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // 获取待处理申请
  const { 
    data: applications,
    isLoading,
    error,
    refetch
  } = useQuery('pendingApplications', fetchPendingApplications);
  
  // 处理申请突变
  const processMutation = useMutation(processApplication, {
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries('pendingApplications');
        setShowApproveModal(false);
        setShowRejectModal(false);
      } else {
        toast.error(data.message || '处理申请失败');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '处理申请失败');
    }
  });
  
  // 批准申请
  const handleApprove = () => {
    if (selectedApplication) {
      processMutation.mutate({
        id: selectedApplication.id,
        approved: true
      });
    }
  };
  
  // 拒绝申请
  const handleReject = () => {
    if (selectedApplication) {
      processMutation.mutate({
        id: selectedApplication.id,
        approved: false
      });
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
  
  // 判断是否有申请
  const hasApplications = applications && applications.length > 0;
  
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
          <h1 className="text-2xl font-bold text-white">授权申请</h1>
          <p className="text-gray-400 mt-1">查看和处理用户的授权码激活申请</p>
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
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size={50} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-red-500 text-lg mb-4">获取授权申请失败</div>
            <Button onClick={() => refetch()} variant="primary">
              重试
            </Button>
          </div>
        ) : !hasApplications ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiInfo className="text-5xl mb-4" />
            <p className="text-xl">暂无待处理的授权申请</p>
            <p className="mt-2">当用户提交授权申请后，将显示在此处</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-700 text-gray-300">
                  <tr>
                    <th className="py-3 px-4 text-left">授权码</th>
                    <th className="py-3 px-4 text-left">应用</th>
                    <th className="py-3 px-4 text-left">申请时间</th>
                    <th className="py-3 px-4 text-left">申请用户</th>
                    <th className="py-3 px-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {applications.map((app) => (
                    <motion.tr
                      key={app.id}
                      className="hover:bg-slate-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="py-3 px-4 font-mono">
                        {app.licenseKey}
                      </td>
                      <td className="py-3 px-4">
                        {app.application ? app.application.name : '未知应用'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-300">
                          <FiCalendar size={14} />
                          <span>{formatDate(app.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {app.userInfo ? app.userInfo.name || '匿名用户' : '未提供信息'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowDetailsModal(true);
                            }}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900 hover:bg-opacity-30 rounded-md transition-colors"
                            title="查看详情"
                          >
                            <FiInfo size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowApproveModal(true);
                            }}
                            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-900 hover:bg-opacity-30 rounded-md transition-colors"
                            title="批准申请"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowRejectModal(true);
                            }}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-30 rounded-md transition-colors"
                            title="拒绝申请"
                          >
                            <FiX size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
      
      {/* 查看详情模态框 */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="申请详情"
      >
        {selectedApplication && (
          <div className="space-y-4">
            <div>
              <h3 className="text-gray-400 text-sm mb-1">授权码</h3>
              <div className="bg-slate-700 rounded-lg p-3 font-mono text-white">
                {selectedApplication.licenseKey}
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-400 text-sm mb-1">应用</h3>
              <div className="bg-slate-700 rounded-lg p-3 text-white">
                {selectedApplication.application ? (
                  <div>
                    <div className="font-medium">{selectedApplication.application.name}</div>
                    <div className="text-sm text-gray-400 mt-1">应用ID: {selectedApplication.application.appId}</div>
                  </div>
                ) : '未知应用'}
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-400 text-sm mb-1">申请时间</h3>
              <div className="bg-slate-700 rounded-lg p-3 text-white">
                {formatDate(selectedApplication.createdAt)}
              </div>
            </div>
            
            <div>
              <h3 className="text-gray-400 text-sm mb-1">用户信息</h3>
              <div className="bg-slate-700 rounded-lg p-3 text-white space-y-2">
                {selectedApplication.userInfo ? (
                  <>
                    <div className="flex items-center gap-2">
                      <FiUser className="text-gray-400" />
                      <span>姓名: {selectedApplication.userInfo.name || '未提供'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-400" />
                      <span>邮箱: {selectedApplication.userInfo.email || '未提供'}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <FiMonitor className="text-gray-400" />
                      <span>设备ID: {selectedApplication.userInfo.deviceId || '未提供'}</span>
                    </div>
                    
                    {/* 显示其他用户信息字段 */}
                    {Object.entries(selectedApplication.userInfo)
                      .filter(([key]) => !['name', 'email', 'deviceId'].includes(key))
                      .map(([key, value]) => (
                        <div key={key} className="flex items-start gap-2">
                          <FiInfo className="text-gray-400 mt-1" />
                          <div>
                            <span className="capitalize">{key}: </span>
                            <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                          </div>
                        </div>
                      ))}
                  </>
                ) : '未提供用户信息'}
              </div>
            </div>
            
            <div className="flex justify-end gap-4 pt-4">
              <Button
                onClick={() => setShowDetailsModal(false)}
                variant="secondary"
              >
                关闭
              </Button>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowApproveModal(true);
                }}
                variant="success"
                icon={<FiCheck />}
              >
                批准
              </Button>
              <Button
                onClick={() => {
                  setShowDetailsModal(false);
                  setShowRejectModal(true);
                }}
                variant="danger"
                icon={<FiX />}
              >
                拒绝
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* 批准确认模态框 */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="批准授权申请"
      >
        <div className="mb-6">
          <p className="text-gray-300">确定要批准此授权申请吗？批准后，授权码将变为激活状态，用户可以使用。</p>
          {selectedApplication && (
            <div className="mt-4 bg-slate-700 p-3 rounded-lg">
              <div className="font-mono text-white">{selectedApplication.licenseKey}</div>
              <div className="text-sm text-gray-400 mt-1">
                {selectedApplication.application?.name} - {selectedApplication.userInfo?.name || '匿名用户'}
              </div>
            </div>
          )}
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
            icon={<FiUserCheck />}
            disabled={processMutation.isLoading}
          >
            {processMutation.isLoading ? '处理中...' : '批准申请'}
          </Button>
        </div>
      </Modal>
      
      {/* 拒绝确认模态框 */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="拒绝授权申请"
      >
        <div className="mb-6">
          <p className="text-gray-300">确定要拒绝此授权申请吗？拒绝后，授权码将恢复为待授权状态，用户可以重新申请。</p>
          {selectedApplication && (
            <div className="mt-4 bg-slate-700 p-3 rounded-lg">
              <div className="font-mono text-white">{selectedApplication.licenseKey}</div>
              <div className="text-sm text-gray-400 mt-1">
                {selectedApplication.application?.name} - {selectedApplication.userInfo?.name || '匿名用户'}
              </div>
            </div>
          )}
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
            icon={<FiUserX />}
            disabled={processMutation.isLoading}
          >
            {processMutation.isLoading ? '处理中...' : '拒绝申请'}
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default ApplicationRequests;