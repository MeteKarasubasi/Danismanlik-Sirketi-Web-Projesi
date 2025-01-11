const express = require('express');
const Service = require('../models/Service');

const router = express.Router();

// Tüm hizmetleri getir
router.get('/', async (req, res) => {
  try {
    const services = await Service.find().sort('order');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni hizmet ekle
router.post('/', async (req, res) => {
  const service = new Service({
    title: req.body.title,
    description: req.body.description,
    icon: req.body.icon,
    order: req.body.order
  });

  try {
    const newService = await service.save();
    res.status(201).json(newService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 