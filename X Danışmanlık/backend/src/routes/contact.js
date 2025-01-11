const express = require('express');
const router = express.Router();

// İletişim formu gönderme
router.post('/', async (req, res) => {
  try {
    // Burada form verilerini işleyebilir veya e-posta gönderebilirsiniz
    console.log('İletişim formu verileri:', req.body);
    res.status(200).json({ message: 'Form başarıyla gönderildi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
});

module.exports = router; 