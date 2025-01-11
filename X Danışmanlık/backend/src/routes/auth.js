const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Op } = require('sequelize');

// Kayıt ol
router.post('/register', async (req, res) => {
  try {
    const { kullanici_adi, eposta, sifre } = req.body;
    console.log('Kayıt denemesi için gelen veriler:', { 
      kullanici_adi, 
      eposta, 
      sifreUzunluk: sifre?.length 
    });

    // Validasyonlar
    if (!kullanici_adi || !eposta || !sifre) {
      console.log('Eksik bilgi:', { 
        kullanici_adi: !!kullanici_adi, 
        eposta: !!eposta, 
        sifre: !!sifre 
      });
      return res.status(400).json({ 
        message: 'Tüm alanlar zorunludur',
        fields: {
          kullanici_adi: !kullanici_adi ? 'Kullanıcı adı zorunludur' : null,
          eposta: !eposta ? 'Email zorunludur' : null,
          sifre: !sifre ? 'Şifre zorunludur' : null
        }
      });
    }

    if (sifre.length < 6) {
      return res.status(400).json({ 
        message: 'Şifre en az 6 karakter olmalıdır' 
      });
    }

    // Email formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(eposta)) {
      return res.status(400).json({ 
        message: 'Geçerli bir email adresi giriniz' 
      });
    }

    // Kullanıcı adı veya email zaten kullanılıyor mu kontrol et
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ kullanici_adi }, { eposta }]
      }
    });

    if (existingUser) {
      console.log('Kullanıcı zaten var:', { 
        kullanici_adi: existingUser.kullanici_adi === kullanici_adi,
        eposta: existingUser.eposta === eposta 
      });
      
      return res.status(400).json({ 
        message: 'Bu kullanıcı adı veya email zaten kullanımda',
        fields: {
          kullanici_adi: existingUser.kullanici_adi === kullanici_adi ? 'Bu kullanıcı adı zaten kullanımda' : null,
          eposta: existingUser.eposta === eposta ? 'Bu email adresi zaten kullanımda' : null
        }
      });
    }

    console.log('Yeni kullanıcı oluşturuluyor...');

    // Yeni kullanıcı oluştur
    const user = await User.create({
      kullanici_adi,
      eposta: eposta.toLowerCase(), // Email'i küçük harfe çevir
      sifre
    });

    console.log('Yeni kullanıcı oluşturuldu:', { 
      userId: user.id,
      kullanici_adi: user.kullanici_adi,
      eposta: user.eposta
    });

    // JWT token oluştur
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Hassas bilgileri çıkar
    const userToSend = {
      id: user.id,
      kullanici_adi: user.kullanici_adi,
      eposta: user.eposta,
      rol: user.rol,
      profil_foto: user.profil_foto ? `/${user.profil_foto}` : null,
      email_bildirimleri: user.email_bildirimleri,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({
      message: 'Kayıt başarılı',
      token,
      user: userToSend
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    
    // Sequelize validasyon hatalarını kontrol et
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = error.errors.reduce((acc, err) => {
        acc[err.path] = err.message;
        return acc;
      }, {});
      
      return res.status(400).json({ 
        message: 'Validasyon hatası',
        errors: validationErrors
      });
    }
    
    // Sequelize unique constraint hatalarını kontrol et
    if (error.name === 'SequelizeUniqueConstraintError') {
      const fields = {};
      error.errors.forEach(err => {
        fields[err.path] = `Bu ${err.path} zaten kullanımda`;
      });
      
      return res.status(400).json({ 
        message: 'Bu bilgiler zaten kullanımda',
        fields
      });
    }

    res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Giriş yap
router.post('/login', async (req, res) => {
  try {
    const { eposta, sifre } = req.body;
    console.log('Giriş denemesi için gelen veriler:', { eposta, sifreUzunluk: sifre?.length });

    if (!eposta || !sifre) {
      console.log('Eksik bilgi:', { eposta: !!eposta, sifre: !!sifre });
      return res.status(400).json({ message: 'Email ve şifre zorunludur' });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({
      where: { eposta }
    });

    if (!user) {
      console.log('Kullanıcı bulunamadı:', eposta);
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    console.log('Kullanıcı bulundu:', {
      id: user.id,
      eposta: user.eposta,
      sifreHash: user.sifre?.substring(0, 10) + '...'
    });

    // Model'in checkPassword metodunu kullan
    const isMatch = await user.checkPassword(sifre);
    console.log('Şifre kontrolü sonucu:', { isMatch });

    if (!isMatch) {
      console.log('Şifre eşleşmedi');
      return res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Hassas bilgileri çıkar
    const userToSend = {
      id: user.id,
      kullanici_adi: user.kullanici_adi,
      eposta: user.eposta,
      rol: user.rol,
      profil_foto: user.profil_foto ? `/${user.profil_foto}` : null,
      email_bildirimleri: user.email_bildirimleri,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    console.log('Giriş başarılı:', { userId: user.id });

    res.json({
      message: 'Giriş başarılı',
      token,
      user: userToSend
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ 
      message: 'Sunucu hatası', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 