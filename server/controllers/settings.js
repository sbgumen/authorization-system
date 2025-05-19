
const { Settings } = require('../models');

// 获取系统设置
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne({ where: { id: 1 } });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: '系统设置不存在'
      });
    }
    
    // 返回更新后的系统设置字段
    res.json({
      success: true,
      settings: {
        allowRegistration: settings.allowRegistration,
        systemTitle: settings.systemTitle,
        systemLogo: settings.systemLogo,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        appId: settings.appId
      }
    });
  } catch (error) {
    console.error('获取系统设置错误:', error);
    res.status(500).json({
      success: false,
      message: '获取系统设置失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 更新系统设置
const updateSettings = async (req, res) => {
  try {
    const {
      allowRegistration,
      systemTitle,
      systemLogo,
      primaryColor,
      secondaryColor
    } = req.body;
    
    const settings = await Settings.findOne({ where: { id: 1 } });
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: '系统设置不存在'
      });
    }
    
    // 检查当前用户是否是超级管理员
    if (req.admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '只有超级管理员可以修改系统设置'
      });
    }
    
    // 更新设置
    if (allowRegistration !== undefined) settings.allowRegistration = allowRegistration;
    if (systemTitle !== undefined) settings.systemTitle = systemTitle;
    if (systemLogo !== undefined) settings.systemLogo = systemLogo;
    if (primaryColor !== undefined) settings.primaryColor = primaryColor;
    if (secondaryColor !== undefined) settings.secondaryColor = secondaryColor;
    
    await settings.save();
    
    res.json({
      success: true,
      message: '系统设置更新成功',
      settings: {
        allowRegistration: settings.allowRegistration,
        systemTitle: settings.systemTitle,
        systemLogo: settings.systemLogo,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        appId: settings.appId
      }
    });
  } catch (error) {
    console.error('更新系统设置错误:', error);
    res.status(500).json({
      success: false,
      message: '更新系统设置失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getSettings,
  updateSettings
};