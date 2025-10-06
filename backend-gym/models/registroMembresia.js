const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./usuario');
const Membresia = require('./membresia');

const RegistroMembresia = sequelize.define('RegistroMembresia', {
  id_registro: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Usuario, key: 'id_usuario' }
  },
  id_membresia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: Membresia, key: 'id_membresia' }
  },
  fecha_inicio: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  fecha_fin: { type: DataTypes.DATEONLY },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'registro_membresias',
  timestamps: false,
});

RegistroMembresia.belongsTo(Usuario, { foreignKey: 'id_usuario' });
RegistroMembresia.belongsTo(Membresia, { foreignKey: 'id_membresia' });

module.exports = RegistroMembresia;