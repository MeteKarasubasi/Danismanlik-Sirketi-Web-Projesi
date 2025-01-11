require('dotenv').config();
const { sequelize } = require('./database');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const PageContent = require('../models/PageContent');

const migrate = async () => {
  try {
    // Tabloları oluştur
    await User.sync({ alter: true });
    await Announcement.sync({ alter: true });
    await PageContent.sync({ alter: true });

    console.log('Veritabanı tabloları başarıyla oluşturuldu/güncellendi');

    // İlk admin kullanıcısını oluştur
    const adminUser = await User.findOne({
      where: { eposta: 'admin@nefdanismanlik.com' }
    });

    if (!adminUser) {
      await User.create({
        kullanici_adi: 'admin',
        eposta: 'admin@nefdanismanlik.com',
        sifre: 'admin123',
        rol: 'admin'
      });
      console.log('Admin kullanıcısı oluşturuldu');
    }

    process.exit(0);
  } catch (error) {
    console.error('Migration hatası:', error);
    process.exit(1);
  }
};

migrate(); 