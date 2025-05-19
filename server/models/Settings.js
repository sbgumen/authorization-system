// server/models/Settings.js - 更新模型添加新字段
module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    allowRegistration: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'allow_registration'
    },
    systemTitle: {
      type: DataTypes.STRING(100),
      defaultValue: '授权码管理系统',
      field: 'system_title'
    },
    systemLogo: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'system_logo'
    },
    primaryColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#3B82F6', // 默认蓝色
      field: 'primary_color'
    },
    secondaryColor: {
      type: DataTypes.STRING(20),
      defaultValue: '#4F46E5', // 默认靛蓝色
      field: 'secondary_color'
    },
    appId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'default',
      field: 'app_id'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  }, {
    tableName: 'settings',
    timestamps: true,
    underscored: true
  });

  return Settings;
};