const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Membresia = sequelize.define('Membresia', {
  id_membresia: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  tipo: { type: DataTypes.STRING(50), allowNull: false },
  duracion_dias: { type: DataTypes.INTEGER, allowNull: false },
  precio: { type: DataTypes.DECIMAL(10,2), allowNull: false },
}, {
  tableName: 'membresias',
  timestamps: false,
});

module.exports = Membresia;