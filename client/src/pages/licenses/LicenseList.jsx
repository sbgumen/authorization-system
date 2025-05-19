import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { motion } from 'framer-motion';
import { Link,useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  FiPlusCircle, 
  FiSearch, 
  FiFilter, 
  FiRefreshCw,
  FiCopy, 
  FiCheckCircle, 
  FiClock, 
  FiXCircle, 
  FiCalendar,
  FiTrash2,
  FiBox,
  FiInfo
} from 'react-icons/fi';
import { getAllLicenses, deleteLicense ,fetchApplications} from '../../services/licenseService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const LicenseList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  // 状态
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationId, setApplicationId] = useState(searchParams.get('applicationId') || '');

// 获取应用列表
const { data: applications } = useQuery('applications', fetchApplications);



const handleApplicationChange = (e) => {
  setApplicationId(e.target.value);
  setPage(1);
  
  // 更新URL参数但不重载页面
  const params = new URLSearchParams(location.search);
  if (e.target.value) {
    params.set('applicationId', e.target.value);
  } else {
    params.delete('applicationId');
  }
  
  // 使用history API更新URL而不重载页面
  window.history.replaceState(
    {},
    '',
    `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`
  );
  
  refetch();
};

  // 获取授权码列表
  const { 
  data, 
  isLoading, 
  error, 
  refetch 
} = useQuery(
  ['licenses', page, limit, status, search, applicationId],
  () => getAllLicenses(page, limit, status, search, applicationId),
  {
    keepPreviousData: true
  }
);

  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };

  // 清除搜索
  const clearSearch = () => {
    setSearch('');
    refetch();
  };

  // 处理状态筛选
  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
    refetch();
  };

  // 删除授权码
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteLicense(deleteId);
      toast.success('授权码删除成功');
      refetch();
      setShowDeleteModal(false);
      setDeleteId(null);
    } catch (error) {
      toast.error(error.message || '删除授权码失败');
    }
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
          <span className="px-2 py-1 text-xs rounded-full bg-green-500 bg-opacity-20 text-green-400 flex items-center">
            <FiCheckCircle className="mr-1" /> 已激活
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500 bg-opacity-20 text-yellow-400 flex items-center">
            <FiClock className="mr-1" /> 待授权
          </span>
        );
      case 'expired':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-500 bg-opacity-20 text-red-400 flex items-center">
            <FiXCircle className="mr-1" /> 已过期
          </span>
        );
      case 'revoked':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-500 bg-opacity-20 text-gray-400 flex items-center">
            <FiXCircle className="mr-1" /> 已撤销
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-500 bg-opacity-20 text-gray-400">
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
          <h1 className="text-2xl font-bold text-white">授权码管理</h1>
          <p className="text-gray-400 mt-1">管理所有授权码，查看状态和详情。</p>
        </div>
        <Button
          to="/licenses/create"
          variant="primary"
          icon={<FiPlusCircle />}
        >
          生成授权码
        </Button>
      </motion.div>

      {/* 搜索和筛选 */}
      <motion.div variants={itemVariants} className="bg-slate-800 rounded-xl p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索授权码..."
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
          </form>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-gray-400" />
              <select
                value={status}
                onChange={handleStatusChange}
                className="bg-slate-700 rounded-lg text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">全部状态</option>
                <option value="active">已激活</option>
                <option value="pending">待授权</option>
                <option value="expired">已过期</option>
                <option value="revoked">已撤销</option>
              </select>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
  <FiFilter className="text-gray-400" />
  <select
    value={applicationId}
    onChange={handleApplicationChange}
    className="bg-slate-700 rounded-lg text-white py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">所有应用</option>
    {applications?.map(app => (
      <option key={app.id} value={app.id}>{app.name}</option>
    ))}
  </select>
</div>
            
            

            <Button
              onClick={() => refetch()}
              variant="secondary"
              icon={<FiRefreshCw />}
              className="px-3"
            >
              刷新
            </Button>
          </div>
        </div>
      </motion.div>

      {/* 授权码列表 */}
      <motion.div variants={itemVariants} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader size={50} />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="text-red-500 text-lg mb-4">获取授权码列表失败</div>
            <Button onClick={() => refetch()} variant="primary">
              重试
            </Button>
          </div>
        ) : data?.licenses?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiInfo className="text-5xl mb-4" />
            <p className="text-xl">没有找到授权码</p>
            <p className="mt-2">尝试清除筛选条件或生成新授权码</p>
            <div className="mt-6 flex gap-4">
              <Button
                onClick={clearSearch}
                variant="secondary"
              >
                清除筛选
              </Button>
              <Button
                to="/licenses/create"
                variant="primary"
                icon={<FiPlusCircle />}
              >
                生成授权码
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-slate-700 text-gray-300">
  <tr>
    <th className="py-3 px-4 text-left">授权码</th>
    <th className="py-3 px-4 text-left">所属应用</th>
    <th className="py-3 px-4 text-left">状态</th>
    <th className="py-3 px-4 text-left">创建时间</th>
    <th className="py-3 px-4 text-left">激活时间</th>
    <th className="py-3 px-4 text-left">过期时间</th>
    <th className="py-3 px-4 text-right">操作</th>
  </tr>
</thead>
                <tbody className="divide-y divide-slate-700">
                  {data.licenses.map((license) => (
                    <motion.tr
                      key={license.id}
                      className="hover:bg-slate-700"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <td className="py-3 px-4">
  <div className="flex items-center gap-2">
    <span className="font-mono">{license.licenseKey}</span>
    <button
      onClick={() => copyToClipboard(license.licenseKey)}
      className="text-gray-400 hover:text-white"
      title="复制授权码"
    >
      <FiCopy size={16} />
    </button>
  </div>
</td>
<td className="py-3 px-4">
  {license.application ? (
    <Link 
      to={`/applications/${license.application.id}`}
      className="px-2 py-1 text-xs rounded-full bg-blue-500 bg-opacity-20 text-blue-400 flex items-center inline-flex hover:bg-opacity-30"
    >
      <FiBox className="mr-1" />
      {license.application.name}
    </Link>
  ) : (
    <span className="text-gray-500">未知应用</span>
  )}
</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(license.status)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-gray-300">
                          <FiCalendar size={14} />
                          <span>{formatDate(license.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {license.activatedAt ? (
                          <div className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            <span>{formatDate(license.activatedAt)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">未激活</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-300">
                        {license.expiresAt ? (
                          <div className="flex items-center gap-1">
                            <FiCalendar size={14} />
                            <span>{formatDate(license.expiresAt)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">永久有效</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/licenses/${license.id}`}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900 hover:bg-opacity-30 rounded-md transition-colors"
                            title="查看详情"
                          >
                            <FiInfo size={18} />
                          </Link>
                          <button
                            onClick={() => {
                              setDeleteId(license.id);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-30 rounded-md transition-colors"
                            title="删除授权码"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="p-4 flex justify-between items-center border-t border-slate-700">
              <div className="text-gray-400">
                总计 {data.totalItems} 个授权码，共 {data.totalPages} 页
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
          </>
        )}
      </motion.div>

      {/* 删除确认弹窗 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除授权码"
      >
        <div className="mb-6">
          <p className="text-gray-300">确定要删除这个授权码吗？此操作不可逆。</p>
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
          >
            删除
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default LicenseList;