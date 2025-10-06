const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Administrativo = require('./administrativo');

const Usuario = sequelize.define('Usuario', {
  id_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: { type: DataTypes.STRING(100), allowNull: false },
  apellido: { type: DataTypes.STRING(100), allowNull: false },
  fecha_nacimiento: { type: DataTypes.DATEONLY },
  telefono: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(100), unique: true },
  fecha_registro: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  registrado_por: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Administrativo, key: 'id_admin' }
  }
}, {
  tableName: 'usuarios',
  timestamps: false,
});

Usuario.belongsTo(Administrativo, { foreignKey: 'registrado_por' });

module.exports = Usuario;