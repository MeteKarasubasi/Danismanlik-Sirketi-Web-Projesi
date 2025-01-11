require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const servicesRoutes = require('./routes/services');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const announcementRoutes = require('./routes/announcements');
const pagesRoutes = require('./routes/pages');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Statik dosyalar için uploads klasörünü erişilebilir yap
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/pages', pagesRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
  });
});

const PORT = process.env.PORT || 5000;

// Veritabanı bağlantısını test et ve sunucuyu başlat
sequelize.authenticate()
  .then(() => {
    console.log('Veritabanı bağlantısı başarılı.');
    app.listen(PORT, () => {
      console.log(`Sunucu ${PORT} portunda çalışıyor`);
    });
  })
  .catch(err => {
    console.error('Veritabanı bağlantı hatası:', err);
  }); 