const jwt = require('jsonwebtoken');
const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    // Token'ı al
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı bul
    const user = await User.findOne({ 
      where: { id: decoded.id },
      attributes: ['id', 'kullanici_adi', 'eposta', 'rol'] 
    });

    if (!user) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    // Admin rolünü kontrol et
    if (user.rol !== 'admin') {
      return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
    }

    // Kullanıcı bilgisini request'e ekle
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin yetkilendirme hatası:', error);
    res.status(401).json({ message: 'Yetkilendirme hatası' });
  }
};

module.exports = adminAuth; 