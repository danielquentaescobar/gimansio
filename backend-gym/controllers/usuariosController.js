const Usuario = require('../models/usuario');
const Administrativo = require('../models/administrativo');

exports.getAll = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({ include: [{ model: Administrativo, as: 'Administrativo' }] });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOne = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, { include: [{ model: Administrativo, as: 'Administrativo' }] });
    if (!usuario) return res.status(404).json({ error: "No encontrado" });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.create = async (req, res) => {
  try {
    const usuario = await Usuario.create(req.body);
    res.status(201).json(usuario);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.update = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: "No encontrado" });
    await usuario.update(req.body);
    res.json(usuario);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.delete = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) return res.status(404).json({ error: "No encontrado" });
    await usuario.destroy();
    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(400).json({ error });
  }
};