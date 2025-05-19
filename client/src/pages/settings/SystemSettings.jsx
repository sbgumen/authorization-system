// client/src/pages/settings/SystemSettings.jsx
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  FiSettings,
  FiSave,
  FiShield,
  FiToggleLeft,
  FiToggleRight,
  FiImage,
  FiType,
  FiEdit,
  FiEye
} from 'react-icons/fi';
import axios from 'axios';

import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import ColorPicker from '../../components/settings/ColorPicker';

// 获取系统设置
const fetchSettings = async () => {
  const response = await axios.get('/api/settings');
  return response.data.settings;
};

// 更新系统设置
const updateSettings = async (data) => {
  const response = await axios.put('/api/settings', data);
  return response.data;
};

const SystemSettings = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  
  // 查询系统设置
  const { data: settings, isLoading, error } = useQuery('settings', fetchSettings);
  
  // 表单状态
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [systemTitle, setSystemTitle] = useState('授权码管理系统');
  const [systemLogo, setSystemLogo] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#3B82F6');
  const [secondaryColor, setSecondaryColor] = useState('#4F46E5');
  const [logoPreview, setLogoPreview] = useState('');
  
  // 更新设置突变
  const updateMutation = useMutation(updateSettings, {
    onSuccess: () => {
      toast.success('系统设置更新成功');
      queryClient.invalidateQueries('settings');
      
      // 更新全局样式
      document.documentElement.style.setProperty('--color-primary', primaryColor);
      document.documentElement.style.setProperty('--color-secondary', secondaryColor);
      
      // 更新标题
      document.title = systemTitle;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || '更新系统设置失败');
    }
  });
  
  // 当设置数据加载时，初始化表单
  React.useEffect(() => {
    if (settings) {
      setAllowRegistration(settings.allowRegistration);
      setSystemTitle(settings.systemTitle || '授权码管理系统');
      setSystemLogo(settings.systemLogo || '');
      setPrimaryColor(settings.primaryColor || '#3B82F6');
      setSecondaryColor(settings.secondaryColor || '#4F46E5');
      
      if (settings.systemLogo) {
        setLogoPreview(settings.systemLogo);
      }
    }
  }, [settings]);
  
  // 处理表单提交
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updatedSettings = {
      allowRegistration,
      systemTitle,
      systemLogo,
      primaryColor,
      secondaryColor
    };
    
    updateMutation.mutate(updatedSettings);
  };
  
  // 处理Logo上传
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件大小和类型
    if (file.size > 1024 * 1024) { // 1MB
      toast.error('图片大小不能超过1MB');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target.result;
      setSystemLogo(base64Data);
      setLogoPreview(base64Data);
    };
    reader.readAsDataURL(file);
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
        <div className="text-red-500 text-xl mb-4">获取系统设置失败</div>
        <Button onClick={() => queryClient.invalidateQueries('settings')}>重试</Button>
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
        <h1 className="text-2xl font-bold text-white">系统设置</h1>
        <p className="text-gray-400 mt-1">配置全局系统参数和外观</p>
      </motion.div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 全局设置 */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <FiSettings className="mr-2" /> 基本设置
            </h2>
            
            <div className="space-y-6">
              {/* 系统标题 */}
              <div>
                <label className="block text-gray-300 mb-2">系统标题</label>
                <div className="flex">
                  <input
                    type="text"
                    value={systemTitle}
                    onChange={(e) => setSystemTitle(e.target.value)}
                    placeholder="输入系统标题"
                    className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  显示在浏览器标签页和系统顶部的标题
                </p>
              </div>
              
              {/* 系统Logo 
              <div>
                <label className="block text-gray-300 mb-2">系统Logo</label>
                <div className="flex flex-col space-y-4">
                  {logoPreview && (
                    <div className="w-40 h-20 bg-slate-700 rounded-lg flex items-center justify-center p-2 relative">
                      <img 
                        src={logoPreview}
                        alt="系统Logo预览"
                        className="max-w-full max-h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSystemLogo('');
                          setLogoPreview('');
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white text-xs"
                        title="移除Logo"
                      >
                        ×
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      variant="secondary"
                      icon={<FiImage />}
                    >
                      上传Logo
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="info"
                        icon={<FiEye />}
                        onClick={() => window.open(logoPreview, '_blank')}
                      >
                        查看原图
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  建议使用透明背景的PNG图片，大小不超过1MB
                </p>
              </div>
              */}
              
              {/* 允许注册 */}
              <div>
                <label className="flex items-center justify-between text-gray-300 mb-2">
                  <span>允许新用户注册</span>
                  <button
                    type="button"
                    onClick={() => setAllowRegistration(!allowRegistration)}
                    className="focus:outline-none"
                  >
                    {allowRegistration ? (
                      <FiToggleRight className="text-blue-500 text-2xl" />
                    ) : (
                      <FiToggleLeft className="text-gray-500 text-2xl" />
                    )}
                  </button>
                </label>
                <p className="text-sm text-gray-400">
                  {allowRegistration 
                    ? '目前新用户可以自由注册账户'
                    : '目前禁止新用户注册，只有超级管理员可以创建账户'}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* 外观设置 */}
          <motion.div
            variants={itemVariants}
            className="bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <FiType className="mr-2" /> 外观设置
            </h2>
            
            <div className="space-y-8">
              {/* 主题颜色 */}
              <div>
                <label className="block text-gray-300 mb-4">主题颜色</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">主要颜色</p>
                    <ColorPicker 
                      color={primaryColor} 
                      onChange={setPrimaryColor} 
                      presetColors={[
                        '#3B82F6', // 蓝色
                        '#10B981', // 绿色
                        '#8B5CF6', // 紫色
                        '#F59E0B', // 黄色
                        '#EF4444', // 红色
                        '#EC4899', // 粉色
                      ]}
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-2">辅助颜色</p>
                    <ColorPicker 
                      color={secondaryColor} 
                      onChange={setSecondaryColor}
                      presetColors={[
                        '#4F46E5', // 靛蓝
                        '#059669', // 墨绿
                        '#6D28D9', // 深紫
                        '#D97706', // 深黄
                        '#DC2626', // 深红
                        '#BE185D', // 深粉
                      ]}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">效果预览</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="py-2 px-4 rounded-lg text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      主要按钮
                    </button>
                    <button
                      type="button"
                      className="py-2 px-4 rounded-lg text-white"
                      style={{ backgroundColor: secondaryColor }}
                    >
                      辅助按钮
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">
                  主题颜色设置会影响系统整体按钮、链接和强调色。修改后即时生效，但部分组件可能需要刷新页面才能完全应用新样式。
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* 安全设置 */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 bg-slate-800 rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center">
              <FiShield className="mr-2" /> 安全设置
            </h2>
            
            <div className="space-y-6">
              <p className="text-gray-400">
                系统使用多重安全机制保护数据安全：
              </p>
              
              <ul className="list-disc pl-5 space-y-2 text-gray-300">
                <li>所有授权码使用AES-256-CBC加密存储</li>
                <li>授权码与特定应用绑定，无法跨应用使用</li>
                <li>用户密码使用bcrypt加盐哈希保护</li>
                <li>API接口使用JWT令牌认证</li>
                <li>请求速率限制防护暴力破解</li>
              </ul>
              
              <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-800">
                <p className="text-blue-400 text-sm">
                  注意：系统安全性取决于服务器环境和管理员配置。请确保服务器安全并定期更改管理员密码。
                </p>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* 保存按钮 */}
        <motion.div
          variants={itemVariants}
          className="mt-6 flex justify-end"
        >
          <Button
            type="submit"
            variant="primary"
            icon={<FiSave />}
            disabled={updateMutation.isLoading}
            style={{ backgroundColor: primaryColor }}
          >
            {updateMutation.isLoading ? '保存中...' : '保存设置'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default SystemSettings;