const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findOne({ 
      where: { id: decoded.id },
      attributes: ['id', 'kullanici_adi', 'eposta', 'rol', 'profil_foto', 'email_bildirimleri'] 
    });

    if (!user) {
      return res.status(401).json({ message: 'Yetkilendirme hatası' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Yetkilendirme hatası:', error);
    res.status(401).json({ message: 'Yetkilendirme hatası' });
  }
};

module.exports = auth; 