const { Op } = require('sequelize');
const { License, Application, Admin } = require('../models');

// 获取用户的仪表板数据
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.admin.id;
    const isAdmin = req.admin.role === 'admin';
    
    // 获取用户的应用
    const userApps = await Application.findAll({
      where: { userId },
      attributes: ['id']
    });
    
    const userAppIds = userApps.map(app => app.id);
    
    // 如果没有应用，返回空数据
    if (userAppIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalLicenses: 0,
          activeLicenses: 0,
          pendingLicenses: 0,
          expiredLicenses: 0,
          revokedLicenses: 0,
          todayLicenses: 0,
          weekLicenses: 0,
          monthLicenses: 0,
          applications: 0
        }
      });
    }
    
    // 构建授权码查询条件
    const licenseWhereClause = {
      applicationId: {
        [Op.in]: userAppIds
      }
    };
    
    // 查询统计数据
    // 总授权码数
    const totalLicenses = await License.count({
      where: licenseWhereClause
    });
    
    // 各状态授权码数
    const activeLicenses = await License.count({
      where: {
        ...licenseWhereClause,
        status: 'active'
      }
    });
    
    const pendingLicenses = await License.count({
      where: {
        ...licenseWhereClause,
        status: 'pending'
      }
    });
    
    const expiredLicenses = await License.count({
      where: {
        ...licenseWhereClause,
        status: 'expired'
      }
    });
    
    const revokedLicenses = await License.count({
      where: {
        ...licenseWhereClause,
        status: 'revoked'
      }
    });
    
    // 时间段统计
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLicenses = await License.count({
      where: {
        ...licenseWhereClause,
        createdAt: {
          [Op.gte]: today
        }
      }
    });
    
    const week = new Date();
    week.setDate(week.getDate() - 7);
    
    const weekLicenses = await License.count({
      where: {
        ...licenseWhereClause,
        createdAt: {
          [Op.gte]: week
        }
      }
    });
    
    const month = new Date();
    month.setDate(month.getDate() - 30);
    
    const monthLicenses = await License.count({
      where: {
        ...licenseWhereClause,
        createdAt: {
          [Op.gte]: month
        }
      }
    });
    
    // 应用数量
    const applications = await Application.count({
      where: { userId }
    });
    
    // 获取系统级统计数据（仅管理员可见）
    let systemStats = null;
    
    if (isAdmin) {
      const totalUsers = await Admin.count();
      const totalApplications = await Application.count();
      const totalSystemLicenses = await License.count();
      
      systemStats = {
        totalUsers,
        totalApplications,
        totalLicenses: totalSystemLicenses
      };
    }
    
    res.json({
      success: true,
      stats: {
        totalLicenses,
        activeLicenses,
        pendingLicenses,
        expiredLicenses,
        revokedLicenses,
        todayLicenses,
        weekLicenses,
        monthLicenses,
        applications
      },
      systemStats
    });
  } catch (error) {
    console.error('获取仪表板统计数据错误:', error);
    res.status(500).json({
      success: false,
      message: '获取仪表板统计数据失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 获取最近活动
const getRecentActivities = async (req, res) => {
  try {
    const userId = req.admin.id;
    const isAdmin = req.admin.role === 'admin';
    
    // 获取用户的应用
    const userApps = await Application.findAll({
      where: { userId },
      attributes: ['id']
    });
    
    const userAppIds = userApps.map(app => app.id);
    
    // 查询最近的授权码
    const recentLicenses = await License.findAll({
      where: isAdmin ? {} : {
        applicationId: {
          [Op.in]: userAppIds
        }
      },
      include: [
        {
          model: Application,
          as: 'application',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // 格式化活动数据
    const activities = recentLicenses.map(license => {
      const appName = license.application ? license.application.name : '未知应用';
      
      return {
        id: license.id,
        type: 'license',
        action: license.status,
        licenseKey: license.licenseKey,
        applicationName: appName,
        timestamp: license.createdAt
      };
    });
    
    res.json({
      success: true,
      activities
    });
  } catch (error) {
    console.error('获取最近活动错误:', error);
    res.status(500).json({
      success: false,
      message: '获取最近活动失败',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDashboardStats,
  getRecentActivities
};