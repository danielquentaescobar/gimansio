const Membresia = require('../models/membresia');

exports.getAll = async (req, res) => {
  try {
    const membresias = await Membresia.findAll();
    res.json(membresias);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOne = async (req, res) => {
  try {
    const membresia = await Membresia.findByPk(req.params.id);
    if (!membresia) return res.status(404).json({ error: "No encontrado" });
    res.json(membresia);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.create = async (req, res) => {
  try {
    const membresia = await Membresia.create(req.body);
    res.status(201).json(membresia);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.update = async (req, res) => {
  try {
    const membresia = await Membresia.findByPk(req.params.id);
    if (!membresia) return res.status(404).json({ error: "No encontrado" });
    await membresia.update(req.body);
    res.json(membresia);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.delete = async (req, res) => {
  try {
    const membresia = await Membresia.findByPk(req.params.id);
    if (!membresia) return res.status(404).json({ error: "No encontrado" });
    await membresia.destroy();
    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(400).json({ error });
  }
};
