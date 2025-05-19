module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    appId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'app_id'
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'admin', // 仍使用原表名
        key: 'id'
      }
    },
    licensePrefix: {
      type: DataTypes.STRING(10),
      defaultValue: 'LS-',
      field: 'license_prefix'
    },
    licenseSegments: {
      type: DataTypes.INTEGER,
      defaultValue: 4,
      field: 'license_segments'
    },
    licenseSegmentLength: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'license_segment_length'
    },
    licenseDelimiter: {
      type: DataTypes.STRING(1),
      defaultValue: '-',
      field: 'license_delimiter'
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
    tableName: 'application',
    timestamps: true,
    underscored: true
  });

  Application.associate = (models) => {
    // 应用属于用户
    Application.belongsTo(models.Admin, {
      foreignKey: 'userId',
      as: 'owner'
    });
    
    // 应用有多个授权码
    Application.hasMany(models.License, {
      foreignKey: 'applicationId',
      as: 'licenses'
    });
  };

  return Application;
};