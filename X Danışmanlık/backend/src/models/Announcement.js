const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Announcement = sequelize.define('Announcement', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  baslik: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { msg: 'Başlık zorunludur' },
      notEmpty: { msg: 'Başlık boş olamaz' }
    }
  },
  icerik: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: { msg: 'İçerik zorunludur' },
      notEmpty: { msg: 'İçerik boş olamaz' }
    }
  },
  durum: {
    type: DataTypes.ENUM('taslak', 'yayinda', 'arsivlendi'),
    defaultValue: 'taslak'
  },
  yayin_tarihi: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Announcements',
  timestamps: true
});

module.exports = Announcement; 