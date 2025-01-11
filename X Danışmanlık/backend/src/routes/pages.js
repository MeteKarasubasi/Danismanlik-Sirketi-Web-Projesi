const express = require('express');
const router = express.Router();
const PageContent = require('../models/PageContent');

// Tüm sayfaları getir
router.get('/all', async (req, res) => {
  try {
    const pages = await PageContent.findAll({
      order: [['updatedAt', 'DESC']]
    });

    res.json(pages);
  } catch (error) {
    console.error('Sayfa listesi hatası:', error);
    res.status(500).json({ 
      message: 'Sayfalar listelenirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Tekil sayfa getir
router.get('/:sayfa_adi', async (req, res) => {
  try {
    const { sayfa_adi } = req.params;
    const page = await PageContent.findOne({
      where: { sayfa_adi }
    });

    if (!page) {
      return res.status(404).json({ message: 'Sayfa bulunamadı' });
    }

    res.json(page);
  } catch (error) {
    console.error('Sayfa getirme hatası:', error);
    res.status(500).json({ 
      message: 'Sayfa getirilirken bir hata oluştu',
      error: error.message 
    });
  }
});

module.exports = router; 