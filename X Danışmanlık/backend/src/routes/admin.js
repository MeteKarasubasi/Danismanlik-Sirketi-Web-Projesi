const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Announcement = require('../models/Announcement');
const PageContent = require('../models/PageContent');
const { Op } = require('sequelize');
const { sendAnnouncementNotification } = require('../utils/emailService');

// Duyuru işlemleri
router.post('/announcements', adminAuth, async (req, res) => {
  try {
    const { baslik, icerik, durum, yayin_tarihi } = req.body;
    
    const duyuru = await Announcement.create({
      baslik,
      icerik,
      durum,
      yayin_tarihi: yayin_tarihi || null
    });

    // Eğer duyuru yayında ise ve yayın tarihi şu an veya geçmiş ise bildirim gönder
    if (durum === 'yayinda' && (!yayin_tarihi || new Date(yayin_tarihi) <= new Date())) {
      await sendAnnouncementNotification(duyuru);
    }

    res.status(201).json({
      message: 'Duyuru oluşturuldu',
      duyuru
    });
  } catch (error) {
    console.error('Duyuru oluşturma hatası:', error);
    res.status(500).json({ 
      message: 'Duyuru oluşturulurken bir hata oluştu',
      error: error.message 
    });
  }
});

router.get('/announcements', adminAuth, async (req, res) => {
  try {
    const duyurular = await Announcement.findAll({
      order: [['createdAt', 'DESC']]
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

router.put('/announcements/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { baslik, icerik, durum, yayin_tarihi } = req.body;

    const duyuru = await Announcement.findByPk(id);
    
    if (!duyuru) {
      return res.status(404).json({ message: 'Duyuru bulunamadı' });
    }

    const oldStatus = duyuru.durum;
    const oldPublishDate = duyuru.yayin_tarihi;

    await duyuru.update({
      baslik,
      icerik,
      durum,
      yayin_tarihi: yayin_tarihi || null
    });

    // Eğer duyuru yeni yayına alındıysa veya yayın tarihi güncellendiyse ve şu an aktifse bildirim gönder
    if (
      (oldStatus !== 'yayinda' && durum === 'yayinda') || 
      (durum === 'yayinda' && oldPublishDate !== yayin_tarihi && (!yayin_tarihi || new Date(yayin_tarihi) <= new Date()))
    ) {
      await sendAnnouncementNotification(duyuru);
    }

    res.json({
      message: 'Duyuru güncellendi',
      duyuru
    });
  } catch (error) {
    console.error('Duyuru güncelleme hatası:', error);
    res.status(500).json({ 
      message: 'Duyuru güncellenirken bir hata oluştu',
      error: error.message 
    });
  }
});

router.delete('/announcements/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const duyuru = await Announcement.findByPk(id);
    
    if (!duyuru) {
      return res.status(404).json({ message: 'Duyuru bulunamadı' });
    }

    await duyuru.destroy();
    res.json({ message: 'Duyuru silindi' });
  } catch (error) {
    console.error('Duyuru silme hatası:', error);
    res.status(500).json({ 
      message: 'Duyuru silinirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Sayfa içeriği işlemleri
router.get('/pages', adminAuth, async (req, res) => {
  try {
    const sayfalar = await PageContent.findAll({
      order: [['updatedAt', 'DESC']]
    });

    res.json(sayfalar);
  } catch (error) {
    console.error('Sayfa listesi hatası:', error);
    res.status(500).json({ 
      message: 'Sayfalar listelenirken bir hata oluştu',
      error: error.message 
    });
  }
});

module.exports = router; 