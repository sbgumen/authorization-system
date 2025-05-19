const crypto = require('crypto');
const { Application, License } = require('../models');

// 获取用户的所有应用
const getUserApps = async (req, res) => {
  try {
    const userId = req.admin.id;
    
    const applications = await Application.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      applications
    });
  } catch (error) {
    console.error('获取应用列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取应用列表失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取应用详情
const getAppById = async (req, res) => {
  try {
    const appId = req.params.id;
    const userId = req.admin.id;
    
    const application = await Application.findOne({
      where: { 
        id: appId,
        userId  // 确保只能查看自己的应用
      }
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: '应用不存在或您无权访问'
      });
    }
    
    // 获取授权码统计
    const totalLicenses = await License.count({ 
      where: { applicationId: application.id } 
    });
    
    const activeLicenses = await License.count({ 
      where: { 
        applicationId: application.id,
        status: 'active'
      } 
    });
    
    const pendingLicenses = await License.count({ 
      where: { 
        applicationId: application.id,
        status: 'pending'
      } 
    });
    
    res.json({
      success: true,
      application: {
        ...application.toJSON(),
        stats: {
          totalLicenses,
          activeLicenses,
          pendingLicenses
        }
      }
    });
  } catch (error) {
    console.error('获取应用详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取应用详情失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 创建新应用
const createApp = async (req, res) => {
  try {
    const { name, description, licensePrefix, licenseSegments, licenseSegmentLength, licenseDelimiter } = req.body;
    const userId = req.admin.id;
    
    // 生成唯一应用ID
    const appId = crypto.randomBytes(16).toString('hex');
    
    // 创建应用
    const application = await Application.create({
      name,
      description,
      appId,
      userId,
      licensePrefix: licensePrefix || 'LS-',
      licenseSegments: licenseSegments || 4,
      licenseSegmentLength: licenseSegmentLength || 5,
      licenseDelimiter: licenseDelimiter || '-'
    });
    
    res.status(201).json({
      success: true,
      message: '应用创建成功',
      application
    });
  } catch (error) {
    console.error('创建应用错误:', error);
    res.status(500).json({
      success: false,
      message: '创建应用失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新应用
const updateApp = async (req, res) => {
  try {
    const appId = req.params.id;
    const userId = req.admin.id;
    const { name, description, licensePrefix, licenseSegments, licenseSegmentLength, licenseDelimiter } = req.body;
    
    // 查找应用
    const application = await Application.findOne({
      where: { 
        id: appId,
        userId  // 确保只能更新自己的应用
      }
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: '应用不存在或您无权修改'
      });
    }
    
    // 更新应用
    if (name) application.name = name;
    if (description !== undefined) application.description = description;
    if (licensePrefix) application.licensePrefix = licensePrefix;
    if (licenseSegments) application.licenseSegments = licenseSegments;
    if (licenseSegmentLength) application.licenseSegmentLength = licenseSegmentLength;
    if (licenseDelimiter) application.licenseDelimiter = licenseDelimiter;
    
    await application.save();
    
    res.json({
      success: true,
      message: '应用更新成功',
      application
    });
  } catch (error) {
    console.error('更新应用错误:', error);
    res.status(500).json({
      success: false,
      message: '更新应用失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 删除应用
const deleteApp = async (req, res) => {
  try {
    const appId = req.params.id;
    const userId = req.admin.id;
    
    // 查找应用
    const application = await Application.findOne({
      where: { 
        id: appId,
        userId  // 确保只能删除自己的应用
      }
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: '应用不存在或您无权删除'
      });
    }
    
    // 检查应用是否有授权码
    const licenseCount = await License.count({
      where: { applicationId: application.id }
    });
    
    if (licenseCount > 0) {
      return res.status(400).json({
        success: false,
        message: '应用下存在授权码，无法删除。请先删除所有授权码或将它们转移到其他应用。'
      });
    }
    
    // 删除应用
    await application.destroy();
    
    res.json({
      success: true,
      message: '应用删除成功'
    });
  } catch (error) {
    console.error('删除应用错误:', error);
    res.status(500).json({
      success: false,
      message: '删除应用失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserApps,
  getAppById,
  createApp,
  updateApp,
  deleteApp
};