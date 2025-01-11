const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { Op } = require('sequelize');

// Yayındaki duyuruları getir
router.get('/', async (req, res) => {
  try {
    const duyurular = await Announcement.findAll({
      where: {
        durum: 'yayinda',
        yayin_tarihi: {
          [Op.or]: [
            { [Op.lte]: new Date() }, // Yayın tarihi şu andan önce olanlar
            { [Op.eq]: null } // Yayın tarihi belirlenmemiş olanlar
          ]
        }
      },
      order: [['yayin_tarihi', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(duyurular);
  } catch (error) {
    console.error('Duyuru listesi hatası:', error);
    res.status(500).json({ 
      message: 'Duyurular listelenirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Tekil duyuru getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const duyuru = await Announcement.findOne({
      where: {
        id,
        durum: 'yayinda',
        yayin_tarihi: {
          [Op.or]: [
            { [Op.lte]: new Date() },
            { [Op.eq]: null }
          ]
        }
      }
    });

    if (!duyuru) {
      return res.status(404).json({ message: 'Duyuru bulunamadı' });
    }

    res.json(duyuru);
  } catch (error) {
    console.error('Duyuru getirme hatası:', error);
    res.status(500).json({ 
      message: 'Duyuru getirilirken bir hata oluştu',
      error: error.message 
    });
  }
});

module.exports = router; 