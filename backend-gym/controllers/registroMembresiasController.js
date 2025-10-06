const RegistroMembresia = require('../models/registroMembresia');
const Usuario = require('../models/usuario');
const Membresia = require('../models/membresia');

exports.getAll = async (req, res) => {
  try {
    const registros = await RegistroMembresia.findAll({ include: [Usuario, Membresia] });
    res.json(registros);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOne = async (req, res) => {
  try {
    const registro = await RegistroMembresia.findByPk(req.params.id, { include: [Usuario, Membresia] });
    if (!registro) return res.status(404).json({ error: "No encontrado" });
    res.json(registro);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.create = async (req, res) => {
  try {
    // Se puede calcular fecha_fin aquí si lo deseas en vez de trigger
    const registro = await RegistroMembresia.create(req.body);
    res.status(201).json(registro);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.update = async (req, res) => {
  try {
    const registro = await RegistroMembresia.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ error: "No encontrado" });
    await registro.update(req.body);
    res.json(registro);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.delete = async (req, res) => {
  try {
    const registro = await RegistroMembresia.findByPk(req.params.id);
    if (!registro) return res.status(404).json({ error: "No encontrado" });
    await registro.destroy();
    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(400).json({ error });
  }
};