const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Administrativo = sequelize.define('Administrativo', {
  id_admin: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  usuario: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  contraseña: { type: DataTypes.STRING(255), allowNull: false },
  fecha_contratacion: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
}, {
  tableName: 'administrativos',
  timestamps: false,
});

module.exports = Administrativo;