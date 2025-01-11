const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PageContent = sequelize.define('PageContent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sayfa_adi: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notNull: { msg: 'Sayfa adı zorunludur' },
      notEmpty: { msg: 'Sayfa adı boş olamaz' }
    }
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
  meta_aciklama: {
    type: DataTypes.STRING(160),
    allowNull: true
  },
  meta_anahtar_kelimeler: {
    type: DataTypes.STRING,
    allowNull: true
  },
  navbar_kategori: {
    type: DataTypes.ENUM('hizmetler', 'hakkimizda', 'iletisim'),
    allowNull: false,
    defaultValue: 'hizmetler',
    validate: {
      isIn: [['hizmetler', 'hakkimizda', 'iletisim']]
    }
  },
  son_guncelleyen_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'PageContents',
  timestamps: true
});

module.exports = PageContent; 