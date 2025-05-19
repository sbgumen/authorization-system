import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiPlusCircle, 
  FiKey, 
  FiCopy,
  FiList,
  FiCheckSquare
} from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

// 获取应用列表函数
const fetchApplications = async () => {
  const response = await axios.get('/api/applications');
  return response.data.applications;
};

// 生成授权码函数
const generateLicenses = async (data) => {
  const response = await axios.post('/api/licenses/generate', data);
  return response.data;
};

const CreateLicense = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 获取URL参数中的应用ID
  const searchParams = new URLSearchParams(location.search);
  const applicationIdParam = searchParams.get('applicationId');
  
  // 状态
  const [count, setCount] = useState(1);
  const [selectedAppId, setSelectedAppId] = useState(applicationIdParam || '');
  const [generatedLicenses, setGeneratedLicenses] = useState([]);
  const [selectedLicenses, setSelectedLicenses] = useState([]);
  
  // 获取应用列表
  const { data: applications, isLoading: appsLoading } = useQuery(
    'applications',
    fetchApplications
  );
  
  // 生成授权码突变
  const generateMutation = useMutation(generateLicenses, {
    onSuccess: (data) => {
      setGeneratedLicenses(data.licenses);
      setSelectedLicenses(data.licenses.map(license => license.licenseKey));
      toast.success(`成功生成${data.licenses.length}个授权码`);
    },
    onError: (error) => {
      console.error('生成授权码错误:', error);
      toast.error(error.response?.data?.message || '生成授权码失败');
    }
  });
  
  // 处理生成
  const handleGenerate = () => {
    if (!selectedAppId) {
      toast.error('请选择应用');
      return;
    }
    
    if (count < 1 || count > 100) {
      toast.error('生成数量必须在1-100之间');
      return;
    }
    
    generateMutation.mutate({
      count,
      applicationId: parseInt(selectedAppId, 10)
    });
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
  
  // 复制选中的授权码
  const copySelectedLicenses = () => {
    const text = selectedLicenses.join('\n');
    copytxt(text);
    toast.success(`已复制${selectedLicenses.length}个授权码到剪贴板`);
  };
  
  // 选择或取消选择授权码
  const toggleSelectLicense = (licenseKey) => {
    if (selectedLicenses.includes(licenseKey)) {
      setSelectedLicenses(selectedLicenses.filter(key => key !== licenseKey));
    } else {
      setSelectedLicenses([...selectedLicenses, licenseKey]);
    }
  };
  
  // 全选或取消全选
  const toggleSelectAll = () => {
    if (selectedLicenses.length === generatedLicenses.length) {
      setSelectedLicenses([]);
    } else {
      setSelectedLicenses(generatedLicenses.map(license => license.licenseKey));
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
          onClick={() => navigate('/licenses')}
          variant="ghost"
          icon={<FiArrowLeft />}
          className="p-2 mr-4"
        />
        <div>
          <h1 className="text-2xl font-bold text-white">生成授权码</h1>
          <p className="text-gray-400 mt-1">批量生成新的授权码</p>
        </div>
      </motion.div>
      
      {/* 生成表单 */}
      <motion.div
        variants={itemVariants}
        className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6"
      >
        <div className="mb-6 space-y-5">
          {/* 应用选择 */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              选择应用 *
            </label>
            <select
              value={selectedAppId}
              onChange={(e) => setSelectedAppId(e.target.value)}
              className="w-full bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={appsLoading}
            >
              <option value="">-- 选择应用 --</option>
              {applications?.map(app => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* 生成数量 */}
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              生成数量 (1-100)
            </label>
            <div className="flex gap-4">
              <input
                type="number"
                min="1"
                max="100"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                className="flex-1 bg-slate-700 rounded-lg py-3 px-4 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                onClick={handleGenerate}
                variant="primary"
                icon={<FiPlusCircle />}
                disabled={generateMutation.isLoading || !selectedAppId}
              >
                {generateMutation.isLoading ? '生成中...' : '生成授权码'}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <div className="flex items-center">
            <FiKey className="mr-2" />
            <span>生成的授权码默认为待授权状态，需要在授权码管理页面进行激活</span>
          </div>
          <div className="flex items-center">
            <FiList className="mr-2" />
            <span>批量生成的授权码将显示在下方列表中</span>
          </div>
        </div>
      </motion.div>
      
      {/* 生成结果 */}
      {generateMutation.isLoading ? (
        <motion.div
          variants={itemVariants}
          className="bg-slate-800 rounded-xl shadow-lg p-6 flex items-center justify-center"
          style={{ minHeight: '300px' }}
        >
          <Loader size={50} />
        </motion.div>
      ) : generatedLicenses.length > 0 ? (
        <motion.div
          variants={itemVariants}
          className="bg-slate-800 rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <FiKey className="mr-2" /> 生成的授权码
            </h2>
            
            <div className="flex gap-3">
              <Button
                onClick={toggleSelectAll}
                variant="secondary"
                icon={<FiCheckSquare />}
                size="sm"
              >
                {selectedLicenses.length === generatedLicenses.length ? '取消全选' : '全选'}
              </Button>
              <Button
                onClick={copySelectedLicenses}
                variant="primary"
                icon={<FiCopy />}
                size="sm"
                disabled={selectedLicenses.length === 0}
              >
                复制选中 ({selectedLicenses.length})
              </Button>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {generatedLicenses.map((license) => (
              <motion.div
                key={license.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="flex items-center p-3 bg-slate-700 rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={selectedLicenses.includes(license.licenseKey)}
                  onChange={() => toggleSelectLicense(license.licenseKey)}
                  className="mr-3 w-5 h-5 rounded accent-blue-500"
                />
                <div className="flex-1 font-mono text-white overflow-x-auto">
                  {license.licenseKey}
                </div>
                <Button
                  onClick={() => copyToClipboard(license.licenseKey)}
                  variant="ghost"
                  icon={<FiCopy />}
                  className="p-1.5 text-gray-400 hover:text-white"
                />
              </motion.div>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-700">
            <span className="text-gray-400">
              共生成 {generatedLicenses.length} 个授权码
            </span>
            <Button
              onClick={() => navigate('/licenses')}
              variant="secondary"
            >
              返回授权码列表
            </Button>
          </div>
        </motion.div>
      ) : null}
    </motion.div>
  );
};

export default CreateLicense;