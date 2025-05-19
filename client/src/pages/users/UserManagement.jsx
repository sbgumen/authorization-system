import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiMail,
  FiCalendar,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiRefreshCw
} from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../context/AuthContext';

// 获取所有用户
const fetchUsers = async () => {
  const response = await axios.get('/api/users');
  return response.data.users;
};

// 删除用户
const deleteUser = async (userId) => {
  const response = await axios.delete(`/api/users/${userId}`);
  return response.data;
};

// 更新用户
const updateUser = async ({ userId, data }) => {
  const response = await axios.put(`/api/users/${userId}`, data);
  return response.data;
};

const UserManagement = () => {
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();
  
  // 状态
  const [search, setSearch] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('user');
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // 查询用户列表
  const { data: users, isLoading, error, refetch } = useQuery('users', fetchUsers);
  
  // 删除用户突变
  const deleteMutation = useMutation(deleteUser, {
    onSuccess: () => {
      toast.success('用户删除成功');
      queryClient.invalidateQueries('users');
      setShowDeleteModal(false);
      setDeleteUserId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '删除用户失败');
    }
  });
  
  // 更新用户突变
  const updateMutation = useMutation(updateUser, {
    onSuccess: () => {
      toast.success('用户更新成功');
      queryClient.invalidateQueries('users');
      setShowEditModal(false);
      setEditUserId(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '更新用户失败');
    }
  });
  
  // 处理搜索
  const handleSearch = (e) => {
    e.preventDefault();
    // 实际项目中可能需要调用搜索API
    // 这里简单实现，前端过滤
  };
  
  // 清除搜索
  const clearSearch = () => {
    setSearch('');
  };
  
  // 打开编辑模态框
  const openEditModal = (user) => {
    setEditUserId(user.id);
    setEditEmail(user.email || '');
    setEditRole(user.role);
    setShowEditModal(true);
  };
  
  // 打开删除确认模态框
  const openDeleteModal = (userId) => {
    setDeleteUserId(userId);
    setShowDeleteModal(true);
  };
  
  // 处理更新用户
  const handleUpdateUser = () => {
    updateMutation.mutate({
      userId: editUserId,
      data: {
        email: editEmail,
        role: editRole
      }
    });
  };
  
  // 处理删除用户
  const handleDeleteUser = () => {
    deleteMutation.mutate(deleteUserId);
  };
  
  // 过滤用户
  const filteredUsers = users
    ? users.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(search.toLowerCase()))
      )
    : [];
  
  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '无';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
  };
  
  // 获取角色标签
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-500 bg-opacity-20 text-blue-400 flex items-center">
            <FiUserCheck className="mr-1" /> 超级管理员
          </span>
        );
      case 'user':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-500 bg-opacity-20 text-green-400 flex items-center">
            <FiUsers className="mr-1" /> 普通用户
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
  
  // 检查当前用户是否为超级管理员
  const isAdmin = currentUser?.role === 'admin';
  
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
        <div className="text-red-500 text-xl mb-4">获取用户列表失败</div>
        <Button onClick={() => refetch()}>重试</Button>
      </div>
    );
  }
  
  // 非管理员提示
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="text-yellow-500 text-xl mb-4">
          <FiUserX className="inline-block mr-2 text-2xl" />
          无权访问
        </div>
        <p className="text-gray-400 mb-6">您没有管理员权限，无法访问用户管理功能</p>
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
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl font-bold text-white">用户管理</h1>
        <p className="text-gray-400 mt-1">管理系统用户账户和权限</p>
      </motion.div>
      
      {/* 搜索和筛选 */}
      <motion.div variants={itemVariants} className="bg-slate-800 rounded-xl p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索用户名或邮箱..."
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
      
      {/* 用户列表 */}
      <motion.div variants={itemVariants} className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <FiUsers className="text-5xl mb-4" />
            <p className="text-xl">没有找到用户</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-slate-700 text-gray-300">
                <tr>
                  <th className="py-3 px-4 text-left">用户名</th>
                  <th className="py-3 px-4 text-left">邮箱</th>
                  <th className="py-3 px-4 text-left">角色</th>
                  <th className="py-3 px-4 text-left">注册时间</th>
                  <th className="py-3 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    className="hover:bg-slate-700"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="py-3 px-4 font-medium text-white">
                      {user.username}
                      {user.id === currentUser?.id && (
                        <span className="ml-2 text-xs text-blue-400">(当前用户)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      {user.email || (
                        <span className="text-gray-500">未设置</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-gray-300">
                        <FiCalendar size={14} />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900 hover:bg-opacity-30 rounded-md transition-colors"
                          title="编辑用户"
                        >
                          <FiEdit size={18} />
                        </button>
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => openDeleteModal(user.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-30 rounded-md transition-colors"
                            title="删除用户"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
      
      {/* 编辑用户模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="编辑用户"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              邮箱
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="用户邮箱 (可选)"
              className="w-full py-3 px-4 bg-slate-700 rounded-lg text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              角色
            </label>
            <select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="w-full py-3 px-4 bg-slate-700 rounded-lg text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">普通用户</option>
              <option value="admin">超级管理员</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <Button
              onClick={() => setShowEditModal(false)}
              variant="secondary"
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateUser}
              variant="primary"
              icon={<FiEdit />}
              disabled={updateMutation.isLoading}
            >
              {updateMutation.isLoading ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </Modal>
      
      {/* 删除确认模态框 */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="删除用户"
      >
        <div className="mb-6">
          <p className="text-gray-300">确定要删除这个用户吗？此操作不可逆。</p>
          <p className="text-yellow-400 mt-4">
            <FiUserX className="inline-block mr-2" />
            用户创建的授权码将保留，但用户账户将被永久删除。
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
            onClick={handleDeleteUser}
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

export default UserManagement;