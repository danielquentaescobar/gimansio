const Pago = require('../models/pago');
const RegistroMembresia = require('../models/registroMembresia');

exports.getAll = async (req, res) => {
  try {
    const pagos = await Pago.findAll({ include: RegistroMembresia });
    res.json(pagos);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.getOne = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id, { include: RegistroMembresia });
    if (!pago) return res.status(404).json({ error: "No encontrado" });
    res.json(pago);
  } catch (error) {
    res.status(500).json({ error });
  }
};

exports.create = async (req, res) => {
  try {
    const pago = await Pago.create(req.body);
    res.status(201).json(pago);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.update = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ error: "No encontrado" });
    await pago.update(req.body);
    res.json(pago);
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.delete = async (req, res) => {
  try {
    const pago = await Pago.findByPk(req.params.id);
    if (!pago) return res.status(404).json({ error: "No encontrado" });
    await pago.destroy();
    res.json({ message: "Eliminado" });
  } catch (error) {
    res.status(400).json({ error });
  }
};