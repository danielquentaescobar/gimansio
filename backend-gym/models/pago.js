const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const RegistroMembresia = require('./registroMembresia');

const Pago = sequelize.define('Pago', {
  id_pago: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_registro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: RegistroMembresia, key: 'id_registro' }
  },
  fecha_pago: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
  monto_pagado: { type: DataTypes.DECIMAL(10,2), allowNull: false },
  estado_pago: {
    type: DataTypes.ENUM('Completo', 'Parcial', 'Pendiente'),
    allowNull: false
  }
}, {
  tableName: 'pagos',
  timestamps: false,
});

Pago.belongsTo(RegistroMembresia, { foreignKey: 'id_registro' });

module.exports = Pago;