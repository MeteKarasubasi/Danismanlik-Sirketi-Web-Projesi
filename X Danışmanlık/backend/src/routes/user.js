const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Profil fotoğrafı yükleme için multer konfigürasyonu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads');
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Sadece resim dosyaları yüklenebilir!'));
  }
});

// Kullanıcı bilgilerini getir
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: { exclude: ['sifre'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı bilgilerini düzenle
    const userToSend = {
      ...user.toJSON(),
      profil_foto: user.profil_foto ? `http://localhost:5000/${user.profil_foto}` : null
    };

    res.json(userToSend);
  } catch (error) {
    console.error('Kullanıcı bilgileri getirme hatası:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası',
      error: error.message 
    });
  }
});

// Profil güncelleme
router.put('/profile', auth, upload.single('profil_foto'), async (req, res) => {
  try {
    const { kullanici_adi, email_bildirimleri } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcı adı değiştirilmek isteniyorsa ve başka bir kullanıcı tarafından kullanılıyorsa
    if (kullanici_adi && kullanici_adi !== user.kullanici_adi) {
      const existingUser = await User.findOne({ where: { kullanici_adi } });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanımda' });
      }
    }

    // Profil fotoğrafı yüklendiyse
    if (req.file) {
      // Eski fotoğrafı sil
      if (user.profil_foto) {
        const oldPhotoPath = path.join(__dirname, '../../', user.profil_foto);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      
      const relativePath = 'uploads/' + path.basename(req.file.path);
      user.profil_foto = relativePath;
    }

    // Diğer alanları güncelle
    if (kullanici_adi) user.kullanici_adi = kullanici_adi;
    if (email_bildirimleri !== undefined) user.email_bildirimleri = email_bildirimleri;

    await user.save();

    // Şifreyi çıkar ve profil fotoğrafı yolunu düzenle
    const userToSend = {
      ...user.toJSON(),
      sifre: undefined,
      profil_foto: user.profil_foto ? `http://localhost:5000/${user.profil_foto}` : null
    };

    res.json({
      message: 'Profil güncellendi',
      user: userToSend
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    if (req.file) {
      // Hata durumunda yüklenen dosyayı sil
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      message: 'Profil güncellenirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Şifre değiştirme
router.put('/change-password', auth, async (req, res) => {
  try {
    const { mevcut_sifre, yeni_sifre } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Mevcut şifreyi kontrol et
    const isMatch = await user.checkPassword(mevcut_sifre);
    if (!isMatch) {
      return res.status(400).json({ message: 'Mevcut şifre yanlış' });
    }

    // Yeni şifreyi kontrol et
    if (yeni_sifre.length < 6) {
      return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır' });
    }

    // Şifreyi güncelle
    user.sifre = yeni_sifre;
    await user.save();

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ 
      message: 'Şifre değiştirilirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Profil fotoğrafı yükleme
router.post('/profile/photo', auth, upload.single('profil_foto'), async (req, res) => {
  try {
    console.log('Dosya yükleme isteği alındı:', req.file);
    
    if (!req.file) {
      return res.status(400).json({ message: 'Lütfen bir fotoğraf seçin' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Eski fotoğrafı sil
    if (user.profil_foto) {
      const oldPhotoPath = path.join(__dirname, '../../', user.profil_foto);
      console.log('Eski fotoğraf yolu:', oldPhotoPath);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
        console.log('Eski fotoğraf silindi');
      }
    }

    // Yeni fotoğraf yolunu kaydet
    const relativePath = 'uploads/' + path.basename(req.file.path);
    console.log('Yeni fotoğraf yolu:', relativePath);

    user.profil_foto = relativePath;
    await user.save();

    console.log('Kullanıcı güncellendi:', user.toJSON());

    // Güncellenmiş kullanıcı bilgilerini gönder
    const userToSend = {
      ...user.toJSON(),
      sifre: undefined,
      profil_foto: `http://localhost:5000/${relativePath}`
    };

    res.json({
      message: 'Profil fotoğrafı güncellendi',
      user: userToSend
    });
  } catch (error) {
    console.error('Profil fotoğrafı yükleme hatası:', error);
    if (req.file) {
      // Hata durumunda yüklenen dosyayı sil
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ 
      message: 'Profil fotoğrafı yüklenirken bir hata oluştu',
      error: error.message 
    });
  }
});

// Bildirim tercihlerini güncelle
router.put('/profile/notifications', auth, async (req, res) => {
  try {
    const { email_bildirimleri } = req.body;
    
    if (typeof email_bildirimleri !== 'boolean') {
      return res.status(400).json({ message: 'Geçersiz bildirim tercihi' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    user.email_bildirimleri = email_bildirimleri;
    await user.save();

    res.json({
      message: 'Bildirim tercihleri güncellendi',
      email_bildirimleri: user.email_bildirimleri
    });
  } catch (error) {
    console.error('Bildirim tercihi güncelleme hatası:', error);
    res.status(500).json({ 
      message: 'Bildirim tercihleri güncellenirken bir hata oluştu',
      error: error.message 
    });
  }
});

module.exports = router; 