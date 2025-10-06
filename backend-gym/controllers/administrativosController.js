const Administrativo = require('../models/administrativo');

exports.getAll = async (req, res) => {
  try {
    const admins = await Administrativo.findAll();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOne = async (req, res) => {
  try {
    const admin = await Administrativo.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ error: "No encontrado" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.create = async (req, res) => {
  try {
    const admin = await Administrativo.create(req.body);
    res.status(201).json(admin);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.update = async (req, res) => {
  try {
    const admin = await Administrativo.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ error: "No encontrado" });
    await admin.update(req.body);
    res.json(admin);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.delete = async (req, res) => {
  try {
    const admin = await Administrativo.findByPk(req.params.id);
    if (!admin) return res.status(404).json({ error: "No encontrado" });
    await admin.destroy();
    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(400).json({ error });
  }
};