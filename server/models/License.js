module.exports = (sequelize, DataTypes) => {
  const License = sequelize.define('License', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    licenseKey: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'license_key'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'expired', 'revoked'),
      defaultValue: 'pending',
      allowNull: false
    },
    userInfo: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_info'
    },
    activatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'activated_at'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expires_at'
    },
    applicationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'application_id',
      references: {
        model: 'application',
        key: 'id'
      }
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'created_by',
      references: {
        model: 'admin',
        key: 'id'
      }
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
    tableName: 'license',
    timestamps: true,
    underscored: true
  });

  License.associate = (models) => {
    License.belongsTo(models.Admin, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    License.belongsTo(models.Application, {
      foreignKey: 'applicationId',
      as: 'application'
    });
  };

  return License;
};