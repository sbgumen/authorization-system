const { Op } = require('sequelize');
const { 
  generateLicenseKey, 
  validateLicenseKeyFormat,
  encrypt,
  decrypt
} = require('../utils/crypto');
const config = require('../config/auth');
const { License, Admin, Application } = require('../models');



const getPendingLicensesByAppId = async (req, res) => {
  try {
    const { appId } = req.params;
    
    // 查找应用
    const application = await Application.findOne({
      where: { appId }
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    // 获取该应用所有未授权的授权码
    const pendingLicenses = await License.findAll({
      where: { 
        applicationId: application.id,
        status: 'pending'
      },
      attributes: ['licenseKey', 'createdAt']
    });
    
    res.json({
      success: true,
      pendingLicenses: pendingLicenses.map(license => ({
        licenseKey: license.licenseKey,
        createdAt: license.createdAt
      }))
    });
  } catch (error) {
    console.error('获取未授权授权码错误:', error);
    res.status(500).json({
      success: false,
      message: '获取未授权授权码失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 生成授权码的辅助函数
const generateLicenseKeyForApp = (application) => {
  const format = {
    prefix: application.licensePrefix,
    segments: application.licenseSegments,
    segmentLength: application.licenseSegmentLength,
    delimiter: application.licenseDelimiter
  };
  
  // 实现类似之前的生成逻辑，但根据应用的格式设置
  let licenseKey = format.prefix;
  
  // 生成随机字符
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  // 生成指定数量的段
  for (let i = 0; i < format.segments - 1; i++) {
    for (let j = 0; j < format.segmentLength; j++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      licenseKey += chars.charAt(randomIndex);
    }
    if (i < format.segments - 2) {
      licenseKey += format.delimiter;
    }
  }
  
  // 添加校验位
  let sum = 0;
  for (let i = 0; i < licenseKey.length; i++) {
    sum += licenseKey.charCodeAt(i);
  }
  const checkDigit = sum % 10;
  
  licenseKey += format.delimiter + checkDigit;
  
  return licenseKey;
};
// 生成新授权码
const generateLicenses = async (req, res) => {
  try {
    // 获取要生成的授权码数量，默认为1
    const count = parseInt(req.body.count || 1, 10);
    const adminId = req.admin.id;
    const applicationId = parseInt(req.body.applicationId, 10);
    
    console.log('生成授权码参数:', { count, adminId, applicationId });
    
    if (!applicationId || isNaN(applicationId)) {
      return res.status(400).json({
        success: false,
        message: '请提供有效的应用ID'
      });
    }
    
    // 验证应用存在且属于当前用户
    const application = await Application.findOne({
      where: { 
        id: applicationId,
        userId: adminId 
      }
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: '应用不存在或您无权访问'
      });
    }
    
    // 批量生成授权码
    const licenses = [];
    
    for (let i = 0; i < count; i++) {
      // 生成唯一授权码
      let licenseKey;
      let isUnique = false;
      
      // 确保生成的授权码是唯一的
      while (!isUnique) {
        licenseKey = generateLicenseKeyForApp(application);
        
        // 检查数据库中是否已存在该授权码
        const existingLicense = await License.findOne({
          where: { licenseKey }
        });
        
        if (!existingLicense) {
          isUnique = true;
        }
      }
      
      // 创建授权码记录
      const license = await License.create({
        licenseKey,
        status: 'pending',
        createdBy: adminId,
        applicationId
      });
      
      licenses.push({
        id: license.id,
        licenseKey: license.licenseKey,
        status: license.status,
        createdAt: license.createdAt
      });
    }
    
    res.status(201).json({
      success: true,
      message: `成功生成${count}个授权码`,
      licenses
    });
  } catch (error) {
    console.error('生成授权码错误:', error);
    res.status(500).json({
      success: false,
      message: '生成授权码过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取所有授权码
const getAllLicenses = async (req, res) => {
  try {
    // 分页参数
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 10, 10);
    const offset = (page - 1) * limit;
    
    // 应用ID过滤（可选）
    const applicationId = req.query.applicationId;
    const userId = req.admin.id;
    
    // 构建查询条件
    const whereClause = {};
    
    // 状态过滤
    const status = req.query.status;
    if (status && ['pending', 'active', 'expired', 'revoked'].includes(status)) {
      whereClause.status = status;
    }
    
    // 搜索关键字
    const searchQuery = req.query.search;
    if (searchQuery) {
      whereClause.licenseKey = {
        [Op.like]: `%${searchQuery}%`
      };
    }
    
    // 首先获取用户的所有应用
    const userApps = await Application.findAll({
      where: { userId },
      attributes: ['id']
    });
    
    const userAppIds = userApps.map(app => app.id);
    
    // 如果指定了应用ID，并且该应用属于当前用户，则过滤该应用的授权码
    if (applicationId && userAppIds.includes(parseInt(applicationId))) {
      whereClause.applicationId = applicationId;
    } else {
      // 否则获取该用户所有应用的授权码
      whereClause.applicationId = {
        [Op.in]: userAppIds
      };
    }
    
    // 查询授权码
    const { count, rows } = await License.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'username']
        },
        {
          model: Application,
          as: 'application',
          attributes: ['id', 'name', 'appId']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    
    // 处理敏感数据
    const licenses = rows.map(license => {
      const licenseData = {
        id: license.id,
        licenseKey: license.licenseKey,
        status: license.status,
        createdAt: license.createdAt,
        activatedAt: license.activatedAt,
        expiresAt: license.expiresAt,
        creator: license.creator ? {
          id: license.creator.id,
          username: license.creator.username
        } : null,
        application: license.application ? {
          id: license.application.id,
          name: license.application.name,
          appId: license.application.appId
        } : null
      };
      
      // 仅在授权码已激活时解密并返回用户信息
      if (license.userInfo && license.status === 'active') {
        try {
          licenseData.userInfo = JSON.parse(decrypt(license.userInfo));
        } catch (error) {
          licenseData.userInfo = { error: '无法解密用户信息' };
        }
      }
      
      return licenseData;
    });
    
    res.json({
      success: true,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
      licenses
    });
  } catch (error) {
    console.error('获取授权码列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取授权码列表过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取单个授权码
const getLicenseById = async (req, res) => {
  try {
    const licenseId = req.params.id;
    
    // 查找授权码
    const license = await License.findByPk(licenseId, {
      include: [
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ]
    });
    
    if (!license) {
      return res.status(404).json({
        success: false,
        message: '授权码不存在'
      });
    }
    
    // 处理敏感数据
    const licenseData = {
      id: license.id,
      licenseKey: license.licenseKey,
      status: license.status,
      createdAt: license.createdAt,
      activatedAt: license.activatedAt,
      expiresAt: license.expiresAt,
      creator: license.creator ? {
        id: license.creator.id,
        username: license.creator.username
      } : null
    };
    
    // 仅在授权码已激活时解密并返回用户信息
    if (license.userInfo && license.status === 'active') {
      try {
        licenseData.userInfo = JSON.parse(decrypt(license.userInfo));
      } catch (error) {
        licenseData.userInfo = { error: '无法解密用户信息' };
      }
    }
    
    res.json({
      success: true,
      license: licenseData
    });
  } catch (error) {
    console.error('获取授权码详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取授权码详情过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新授权码状态
const updateLicense = async (req, res) => {
  try {
    const licenseId = req.params.id;
    const { status, expiresAt } = req.body;
    
    // 查找授权码
    const license = await License.findByPk(licenseId);
    
    if (!license) {
      return res.status(404).json({
        success: false,
        message: '授权码不存在'
      });
    }
    
    // 更新状态
    if (status) {
      license.status = status;
      
      // 如果状态变为激活，记录激活时间
      if (status === 'active' && !license.activatedAt) {
        license.activatedAt = new Date();
      }
    }
    
    // 更新过期时间
    if (expiresAt) {
      license.expiresAt = new Date(expiresAt);
    }
    
    // 保存更改
    await license.save();
    
    res.json({
      success: true,
      message: '授权码更新成功',
      license: {
        id: license.id,
        licenseKey: license.licenseKey,
        status: license.status,
        activatedAt: license.activatedAt,
        expiresAt: license.expiresAt
      }
    });
  } catch (error) {
    console.error('更新授权码错误:', error);
    res.status(500).json({
      success: false,
      message: '更新授权码过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 删除授权码
const deleteLicense = async (req, res) => {
  try {
    const licenseId = req.params.id;
    
    // 查找授权码
    const license = await License.findByPk(licenseId);
    
    if (!license) {
      return res.status(404).json({
        success: false,
        message: '授权码不存在'
      });
    }
    
    // 删除授权码
    await license.destroy();
    
    res.json({
      success: true,
      message: '授权码删除成功'
    });
  } catch (error) {
    console.error('删除授权码错误:', error);
    res.status(500).json({
      success: false,
      message: '删除授权码过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 验证授权码

const verifyLicense = async (req, res) => {
  try {
    const { licenseKey, appId } = req.body;
    
    // 添加详细日志，帮助调试
    console.log('验证授权码请求参数:', { licenseKey, appId });
    
    // 验证必要参数
    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        message: '授权码不能为空',
        valid: false
      });
    }
    
    if (!appId) {
      return res.status(400).json({
        success: false,
        message: '应用ID不能为空',
        valid: false
      });
    }
    
    // 查找应用
    const application = await Application.findOne({
      where: { appId }
    });
    
    if (!application) {
      console.log('应用不存在:', appId);
      return res.status(404).json({
        success: false,
        message: '应用不存在',
        valid: false
      });
    }
    
    // 查找授权码
    const license = await License.findOne({
      where: { 
        licenseKey,
        applicationId: application.id
      }
    });
    
    if (!license) {
      console.log('授权码不存在或不适用于此应用');
      return res.status(404).json({
        success: false,
        message: '授权码不存在或不适用于此应用',
        valid: false
      });
    }
    
    console.log('找到授权码:', { 
      id: license.id, 
      status: license.status, 
      applicationId: license.applicationId 
    });
    
    // 检查授权码状态
    const isValid = license.status === 'active';
    
    // 检查是否过期
    const isExpired = license.expiresAt && new Date() > new Date(license.expiresAt);
    
    // 如果已过期但状态未更新，则更新状态
    if (isExpired && license.status === 'active') {
      license.status = 'expired';
      await license.save();
    }
    
    // 返回结果
    return res.json({
      success: true,
      valid: isValid && !isExpired,
      status: isExpired ? 'expired' : license.status,
      expiresAt: license.expiresAt
    });
    
  } catch (error) {
    console.error('验证授权码错误详情:', error);
    
    // 返回更详细的错误信息，便于调试
    return res.status(500).json({
      success: false,
      message: '验证授权码时发生错误: ' + (process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'),
      valid: false,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// 申请授权码激活
const applyLicense = async (req, res) => {
  try {
    const { licenseKey, appId, userInfo } = req.body;
    
    // 验证必要参数
    if (!licenseKey) {
      return res.status(400).json({
        success: false,
        message: '授权码不能为空'
      });
    }
    
    if (!appId) {
      return res.status(400).json({
        success: false,
        message: '应用ID不能为空'
      });
    }
    
    if (!userInfo || typeof userInfo !== 'object') {
      return res.status(400).json({
        success: false,
        message: '用户信息不能为空且必须是对象'
      });
    }
    
    // 查找应用
    const application = await Application.findOne({
      where: { appId }
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    // 查找授权码
    const license = await License.findOne({
      where: { 
        licenseKey,
        applicationId: application.id 
      }
    });
    
    if (!license) {
      return res.status(404).json({
        success: false,
        message: '授权码不存在或不适用于此应用'
      });
    }
    
    // 检查授权码状态
    if (license.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `授权码当前状态为${license.status}，无法申请激活`
      });
    }
    
    // 加密并保存用户信息
    if (userInfo) {
      const encryptedUserInfo = encrypt(JSON.stringify(userInfo));
      license.userInfo = encryptedUserInfo;
    }
    
    await license.save();
    
    res.json({
      success: true,
      message: '授权申请已提交，等待管理员审核',
      license: {
        licenseKey: license.licenseKey,
        status: license.status,
        appId: application.appId
      }
    });
  } catch (error) {
    console.error('申请授权码错误:', error);
    res.status(500).json({
      success: false,
      message: '申请授权码过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// 获取待处理授权申请列表
const getPendingApplications = async (req, res) => {
  try {
    const userId = req.admin.id;
    const isAdmin = req.admin.role === 'admin';
    
    // 构建查询条件 - 管理员可以看到所有申请，普通用户只能看到自己的应用申请
    let whereClause = {
      status: 'pending',
      userInfo: {
        [Op.ne]: null  // 非空用户信息表示已提交申请
      }
    };
    
    // 如果不是管理员，只能查看自己的应用
    if (!isAdmin) {
      // 获取用户拥有的应用
      const userApps = await Application.findAll({
        where: { userId },
        attributes: ['id']
      });
      
      const userAppIds = userApps.map(app => app.id);
      
      // 仅显示用户应用的申请
      whereClause.applicationId = {
        [Op.in]: userAppIds
      };
    }
    
    // 查询待处理的授权申请
    const applications = await License.findAll({
      where: whereClause,
      include: [
        {
          model: Application,
          as: 'application',
          attributes: ['id', 'name', 'appId']
        },
        {
          model: Admin,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // 处理和格式化申请数据
    const pendingApplications = applications.map(license => {
      const data = {
        id: license.id,
        licenseKey: license.licenseKey,
        status: license.status,
        createdAt: license.createdAt,
        application: license.application ? {
          id: license.application.id,
          name: license.application.name,
          appId: license.application.appId
        } : null,
        creator: license.creator ? {
          id: license.creator.id,
          username: license.creator.username
        } : null
      };
      
      // 解密用户信息
      if (license.userInfo) {
        try {
          data.userInfo = JSON.parse(decrypt(license.userInfo));
        } catch (error) {
          data.userInfo = { error: '无法解密用户信息' };
        }
      }
      
      return data;
    });
    
    res.json({
      success: true,
      pendingApplications
    });
  } catch (error) {
    console.error('获取待处理授权申请错误:', error);
    res.status(500).json({
      success: false,
      message: '获取待处理授权申请失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 处理授权申请
const processApplication = async (req, res) => {
  try {
    const { id, approved } = req.body;
    const adminId = req.admin.id;
    
    // 查找授权申请
    const license = await License.findByPk(id);
    
    if (!license) {
      return res.status(404).json({
        success: false,
        message: '授权申请不存在'
      });
    }
    
    // 确保授权码状态是待处理
    if (license.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `授权码当前状态为${license.status}，无法处理申请`
      });
    }
    
    // 确保用户有权限处理此应用的授权
    const application = await Application.findByPk(license.applicationId);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: '应用不存在'
      });
    }
    
    // 检查权限 - 管理员或应用所有者可以处理
    const isAdmin = req.admin.role === 'admin';
    const isOwner = application.userId === adminId;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: '您没有权限处理此授权申请'
      });
    }
    
    // 处理申请
    if (approved) {
      // 批准申请，更新授权码状态为已激活
      license.status = 'active';
      license.activatedAt = new Date();
      await license.save();
      
      res.json({
        success: true,
        message: '授权申请已批准',
        license: {
          id: license.id,
          licenseKey: license.licenseKey,
          status: license.status,
          activatedAt: license.activatedAt
        }
      });
    } else {
      // 拒绝申请，保持状态为待处理，但可以选择清除用户信息
      // 或者可以将状态更改为一个新的状态，如'rejected'
      // 这里我们保持为待处理，但清除用户信息
      license.userInfo = null;
      await license.save();
      
      res.json({
        success: true,
        message: '授权申请已拒绝',
        license: {
          id: license.id,
          licenseKey: license.licenseKey,
          status: license.status
        }
      });
    }
  } catch (error) {
    console.error('处理授权申请错误:', error);
    res.status(500).json({
      success: false,
      message: '处理授权申请失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取授权统计信息
const getLicenseStats = async (req, res) => {
  try {
    // 获取各状态的授权码数量
    const totalCount = await License.count();
    const pendingCount = await License.count({ where: { status: 'pending' } });
    const activeCount = await License.count({ where: { status: 'active' } });
    const expiredCount = await License.count({ where: { status: 'expired' } });
    const revokedCount = await License.count({ where: { status: 'revoked' } });
    
    // 获取今日生成的授权码数量
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayCount = await License.count({
      where: {
        createdAt: {
          [Op.gte]: today
        }
      }
    });
    
    // 获取本周生成的授权码数量
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const weekCount = await License.count({
      where: {
        createdAt: {
          [Op.gte]: startOfWeek
        }
      }
    });
    
    // 获取本月生成的授权码数量
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthCount = await License.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });
    
    res.json({
      success: true,
      stats: {
        total: totalCount,
        pending: pendingCount,
        active: activeCount,
        expired: expiredCount,
        revoked: revokedCount,
        today: todayCount,
        week: weekCount,
        month: monthCount
      }
    });
  } catch (error) {
    console.error('获取授权统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取授权统计过程中发生错误',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getPendingLicensesByAppId,
  generateLicenses,
  getAllLicenses,
  getLicenseById,
  updateLicense,
  deleteLicense,
  verifyLicense,
  applyLicense,
  getLicenseStats,
  getPendingApplications,  
  processApplication        
};