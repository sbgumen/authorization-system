import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { FiCode, FiCheckCircle, FiCopy, FiSend, FiServer, FiBookOpen, FiInfo } from 'react-icons/fi';
import axios from 'axios';
import Button from '../../components/common/Button';
import CodeBlock from '../../components/docs/CodeBlock';

const ApiDocumentation = () => {
  // 测试区域状态
  const [licenseKey, setLicenseKey] = useState('');
  const [appId, setAppId] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // 验证授权码
  const handleVerifyLicense = async () => {
    if (!licenseKey || !appId) {
      toast.error('授权码和应用ID不能为空');
      return;
    }

    setVerifyLoading(true);
    setVerifyResult(null);

    try {
      const response = await axios.post('/api/licenses/verify', {
        licenseKey,
        appId
      });

      setVerifyResult(response.data);
      if (response.data.valid) {
        toast.success('授权码验证成功');
      } else {
          if(response.data.success){
              toast.success('该授权码未被授权')
          }else {
        toast.error('授权码验证失败: ' + response.data.message);
          }
      }
    } catch (error) {
      setVerifyResult({
        success: false,
        message: error.response?.data?.message || '验证过程中发生错误',
        valid: false
      });
      toast.error('验证请求失败');
    } finally {
      setVerifyLoading(false);
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

  // 复制代码到剪贴板
  const copyToClipboard = (text) => {
    copytxt(text);
    toast.success('代码已复制到剪贴板');
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

  // 验证授权码API示例代码
  const verifyLicenseCode = `// 使用fetch API验证授权码
const verifyLicense = async (licenseKey, appId) => {
  try {
    const response = await fetch('${window.location.origin}/api/licenses/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        licenseKey,  // 授权码
        appId        // 应用ID
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('验证授权码失败:', error);
    throw error;
  }
};

// 示例调用
verifyLicense('YOUR-LICENSE-KEY', 'YOUR-APP-ID')
  .then(result => {
    if (result.valid) {
      console.log('授权有效!');
    } else {
      console.log('授权无效:', result.message);
    }
  })
  .catch(error => {
    console.error('验证请求失败:', error);
  });`;

  // 申请授权码API示例代码
  const applyLicenseCode = `// 使用fetch API申请激活授权码
const applyLicense = async (licenseKey, appId, userInfo) => {
  try {
    const response = await fetch('${window.location.origin}/api/licenses/apply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        licenseKey,  // 授权码
        appId,       // 应用ID
        userInfo     // 用户信息，如: { name: '用户名', email: '用户邮箱', deviceId: '设备ID' }
      })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('申请授权码失败:', error);
    throw error;
  }
};

// 示例调用
const userInfo = {
  name: '示例用户',
  email: 'user@example.com',
  deviceId: 'DEVICE-ID-123456'
};

applyLicense('YOUR-LICENSE-KEY', 'YOUR-APP-ID', userInfo)
  .then(result => {
    if (result.success) {
      console.log('申请成功:', result.message);
    } else {
      console.log('申请失败:', result.message);
    }
  })
  .catch(error => {
    console.error('申请请求失败:', error);
  });`;
  
  
  // 获取未授权授权码API示例代码
const getPendingLicensesCode = `// 使用fetch API获取应用的所有未授权授权码
const getPendingLicenses = async (appId) => {
  try {
    const response = await fetch('${window.location.origin}/api/licenses/pending/' + appId);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取未授权授权码失败:', error);
    throw error;
  }
};

// 示例调用
getPendingLicenses('YOUR-APP-ID')
  .then(result => {
    if (result.success) {
      console.log('未授权授权码列表:', result.pendingLicenses);
    } else {
      console.log('获取失败:', result.message);
    }
  })
  .catch(error => {
    console.error('请求失败:', error);
  });`;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="h-full"
    >
      {/* 页面标题 */}
      <motion.div variants={itemVariants} className="mb-6">
        <h1 className="text-2xl font-bold text-white">系统文档</h1>
        <p className="text-gray-400 mt-1">授权系统API接口说明及测试</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* API文档区域 */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          {/* 验证授权码API */}
          <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiServer className="mr-2" /> 验证授权码API
            </h2>
            <p className="text-gray-300 mb-4">
              此API用于验证授权码是否有效。您的应用应该在启动时或需要验证授权时调用此接口。
            </p>

            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">请求地址</h3>
              <div className="bg-slate-700 rounded-lg p-3 font-mono text-blue-400">
                POST {window.location.origin}/api/licenses/verify
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">请求参数</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="bg-slate-700 text-gray-300">
                    <tr>
                      <th className="py-2 px-4 text-left">参数名</th>
                      <th className="py-2 px-4 text-left">类型</th>
                      <th className="py-2 px-4 text-left">必填</th>
                      <th className="py-2 px-4 text-left">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr className="bg-slate-700 bg-opacity-50">
                      <td className="py-2 px-4 font-mono">licenseKey</td>
                      <td className="py-2 px-4">String</td>
                      <td className="py-2 px-4">是</td>
                      <td className="py-2 px-4">授权码</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-30">
                      <td className="py-2 px-4 font-mono">appId</td>
                      <td className="py-2 px-4">String</td>
                      <td className="py-2 px-4">是</td>
                      <td className="py-2 px-4">应用ID，在应用详情页获取</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">响应结果</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="bg-slate-700 text-gray-300">
                    <tr>
                      <th className="py-2 px-4 text-left">字段名</th>
                      <th className="py-2 px-4 text-left">类型</th>
                      <th className="py-2 px-4 text-left">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr className="bg-slate-700 bg-opacity-50">
                      <td className="py-2 px-4 font-mono">success</td>
                      <td className="py-2 px-4">Boolean</td>
                      <td className="py-2 px-4">请求是否成功</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-30">
                      <td className="py-2 px-4 font-mono">valid</td>
                      <td className="py-2 px-4">Boolean</td>
                      <td className="py-2 px-4">授权码是否有效</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-50">
                      <td className="py-2 px-4 font-mono">status</td>
                      <td className="py-2 px-4">String</td>
                      <td className="py-2 px-4">授权码状态，可能值: active, pending, expired, revoked</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-30">
                      <td className="py-2 px-4 font-mono">expiresAt</td>
                      <td className="py-2 px-4">String</td>
                      <td className="py-2 px-4">过期时间，仅当有过期时间时返回</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-50">
                      <td className="py-2 px-4 font-mono">message</td>
                      <td className="py-2 px-4">String</td>
                      <td className="py-2 px-4">错误信息，仅当请求失败时返回</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">代码示例</h3>
                <Button
                  onClick={() => copyToClipboard(verifyLicenseCode)}
                  variant="secondary"
                  size="sm"
                  icon={<FiCopy size={14} />}
                >
                  复制代码
                </Button>
              </div>
              <CodeBlock code={verifyLicenseCode} language="javascript" />
            </div>
          </div>
          
          
          
          {/* 获取未授权授权码API */}
<div className="bg-slate-800 rounded-xl shadow-lg p-6">
  <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
    <FiServer className="mr-2" /> 获取未授权授权码API
  </h2>
  <p className="text-gray-300 mb-4">
    此API用于获取应用的所有未授权（待授权）状态的授权码，无需认证即可访问。
  </p>

  <div className="mb-4">
    <h3 className="text-white font-medium mb-2">请求地址</h3>
    <div className="bg-slate-700 rounded-lg p-3 font-mono text-blue-400">
      GET {window.location.origin}/api/licenses/pending/:appId
    </div>
  </div>

  <div className="mb-4">
    <h3 className="text-white font-medium mb-2">请求参数</h3>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] text-sm">
        <thead className="bg-slate-700 text-gray-300">
          <tr>
            <th className="py-2 px-4 text-left">参数名</th>
            <th className="py-2 px-4 text-left">类型</th>
            <th className="py-2 px-4 text-left">必填</th>
            <th className="py-2 px-4 text-left">说明</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          <tr className="bg-slate-700 bg-opacity-50">
            <td className="py-2 px-4 font-mono">appId</td>
            <td className="py-2 px-4">String</td>
            <td className="py-2 px-4">是</td>
            <td className="py-2 px-4">应用ID，作为URL参数</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div className="mb-4">
    <h3 className="text-white font-medium mb-2">响应结果</h3>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[500px] text-sm">
        <thead className="bg-slate-700 text-gray-300">
          <tr>
            <th className="py-2 px-4 text-left">字段名</th>
            <th className="py-2 px-4 text-left">类型</th>
            <th className="py-2 px-4 text-left">说明</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          <tr className="bg-slate-700 bg-opacity-50">
            <td className="py-2 px-4 font-mono">success</td>
            <td className="py-2 px-4">Boolean</td>
            <td className="py-2 px-4">请求是否成功</td>
          </tr>
          <tr className="bg-slate-700 bg-opacity-30">
            <td className="py-2 px-4 font-mono">pendingLicenses</td>
            <td className="py-2 px-4">Array</td>
            <td className="py-2 px-4">未授权授权码列表，包含licenseKey和createdAt</td>
          </tr>
          <tr className="bg-slate-700 bg-opacity-50">
            <td className="py-2 px-4 font-mono">message</td>
            <td className="py-2 px-4">String</td>
            <td className="py-2 px-4">错误信息，仅当请求失败时返回</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <div className="mb-4">
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-white font-medium">代码示例</h3>
      <Button
        onClick={() => copyToClipboard(getPendingLicensesCode)}
        variant="secondary"
        size="sm"
        icon={<FiCopy size={14} />}
      >
        复制代码
      </Button>
    </div>
    <CodeBlock code={getPendingLicensesCode} language="javascript" />
  </div>

  <div className="bg-green-900 bg-opacity-20 p-4 rounded-lg border border-green-800 mt-4">
    <p className="text-green-400 text-sm">
      <FiInfo className="inline-block mr-2" />
      此API无需认证即可访问，便于您的客户端软件获取可用的授权码列表。您可以使用此API来实现授权码选择功能，让用户从可用授权码列表中选择一个进行激活。
    </p>
  </div>
</div>

          {/* 申请激活授权码API */}
          <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiServer className="mr-2" /> 申请激活授权码API
            </h2>
            <p className="text-gray-300 mb-4">
              此API用于申请激活授权码。用户输入授权码后，您的应用可以调用此接口提交激活申请。
            </p>

            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">请求地址</h3>
              <div className="bg-slate-700 rounded-lg p-3 font-mono text-blue-400">
                POST {window.location.origin}/api/licenses/apply
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">请求参数</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="bg-slate-700 text-gray-300">
                    <tr>
                      <th className="py-2 px-4 text-left">参数名</th>
                      <th className="py-2 px-4 text-left">类型</th>
                      <th className="py-2 px-4 text-left">必填</th>
                      <th className="py-2 px-4 text-left">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr className="bg-slate-700 bg-opacity-50">
                      <td className="py-2 px-4 font-mono">licenseKey</td>
                      <td className="py-2 px-4">String</td>
                      <td className="py-2 px-4">是</td>
                      <td className="py-2 px-4">授权码</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-30">
                      <td className="py-2 px-4 font-mono">appId</td>
                      <td className="py-2 px-4">String</td>
                      <td className="py-2 px-4">是</td>
                      <td className="py-2 px-4">应用ID，在应用详情页获取</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-50">
                      <td className="py-2 px-4 font-mono">userInfo</td>
                      <td className="py-2 px-4">Object</td>
                      <td className="py-2 px-4">是</td>
                      <td className="py-2 px-4">用户信息，如姓名、邮箱、设备ID等</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-white font-medium mb-2">响应结果</h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px] text-sm">
                  <thead className="bg-slate-700 text-gray-300">
                    <tr>
                      <th className="py-2 px-4 text-left">字段名</th>
                      <th className="py-2 px-4 text-left">类型</th>
                      <th className="py-2 px-4 text-left">说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    <tr className="bg-slate-700 bg-opacity-50">
                      <td className="py-2 px-4 font-mono">success</td>
                      <td className="py-2 px-4">Boolean</td>
                      <td className="py-2 px-4">请求是否成功</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-30">
                      <td className="py-2 px-4 font-mono">message</td>
                      <td className="py-2 px-4">String</td>
                      <td className="py-2 px-4">操作结果信息</td>
                    </tr>
                    <tr className="bg-slate-700 bg-opacity-50">
                      <td className="py-2 px-4 font-mono">license</td>
                      <td className="py-2 px-4">Object</td>
                      <td className="py-2 px-4">授权码信息，包含licenseKey和status</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-white font-medium">代码示例</h3>
                <Button
                  onClick={() => copyToClipboard(applyLicenseCode)}
                  variant="secondary"
                  size="sm"
                  icon={<FiCopy size={14} />}
                >
                  复制代码
                </Button>
              </div>
              <CodeBlock code={applyLicenseCode} language="javascript" />
            </div>
          </div>

          {/* 错误码说明 */}
          <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiInfo className="mr-2" /> 错误码说明
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead className="bg-slate-700 text-gray-300">
                  <tr>
                    <th className="py-2 px-4 text-left">HTTP状态码</th>
                    <th className="py-2 px-4 text-left">说明</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  <tr className="bg-slate-700 bg-opacity-50">
                    <td className="py-2 px-4">200</td>
                    <td className="py-2 px-4">请求成功，详情参考响应中的success字段</td>
                  </tr>
                  <tr className="bg-slate-700 bg-opacity-30">
                    <td className="py-2 px-4">400</td>
                    <td className="py-2 px-4">请求参数错误，如授权码格式不正确、参数不完整等</td>
                  </tr>
                  <tr className="bg-slate-700 bg-opacity-50">
                    <td className="py-2 px-4">401</td>
                    <td className="py-2 px-4">身份验证失败，仅用于管理员API</td>
                  </tr>
                  <tr className="bg-slate-700 bg-opacity-30">
                    <td className="py-2 px-4">404</td>
                    <td className="py-2 px-4">资源不存在，如授权码或应用ID不存在</td>
                  </tr>
                  <tr className="bg-slate-700 bg-opacity-50">
                    <td className="py-2 px-4">500</td>
                    <td className="py-2 px-4">服务器内部错误</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* 测试区域 */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiCode className="mr-2" /> 测试授权码
            </h2>
            <p className="text-gray-300 mb-4">
              在此区域测试您的授权码是否有效。
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  授权码
                </label>
                <input
                  type="text"
                  value={licenseKey}
                  onChange={(e) => setLicenseKey(e.target.value)}
                  placeholder="输入授权码"
                  className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  应用ID
                </label>
                <input
                  type="text"
                  value={appId}
                  onChange={(e) => setAppId(e.target.value)}
                  placeholder="输入应用ID"
                  className="w-full bg-slate-700 rounded-lg py-2 px-3 text-white border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button
                onClick={handleVerifyLicense}
                variant="primary"
                fullWidth={true}
                icon={<FiSend />}
                disabled={verifyLoading}
              >
                {verifyLoading ? '验证中...' : '验证授权码'}
              </Button>
            </div>

            {verifyResult && (
              <div className="mt-6 p-4 rounded-lg bg-slate-700">
                <div className="flex items-center mb-2">
                  <h3 className="text-white font-medium">验证结果</h3>
                  {verifyResult.valid && (
                    <span className="ml-2 text-green-400">
                      <FiCheckCircle />
                    </span>
                  )}
                </div>
                <pre className="overflow-x-auto text-sm text-gray-300 font-mono p-2">
                  {JSON.stringify(verifyResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-slate-800 rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FiBookOpen className="mr-2" /> 集成指南
            </h2>
            <div className="space-y-4">
              <p className="text-gray-300">
                要在您的应用中集成授权验证功能，请按照以下步骤操作：
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>在应用启动时，调用验证授权码API检查授权状态</li>
                <li>如果授权码有效，正常启动应用</li>
                <li>如果授权码无效或未提供，显示授权输入界面</li>
                <li>用户输入授权码后，再次调用验证API</li>
                <li>可选：使用申请API提交用户信息以激活授权码</li>
              </ol>
              <div className="bg-blue-900 bg-opacity-20 p-4 rounded-lg border border-blue-800">
                <p className="text-blue-400 text-sm">
                  提示：对于付费应用，建议将授权状态保存在本地数据库中，并定期（如每次启动和每隔一段时间）验证授权码的有效性，以便在离线状态下也能使用应用。
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ApiDocumentation;