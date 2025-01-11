const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  kullanici_adi: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Bu kullanıcı adı zaten kullanımda'
    },
    validate: {
      notNull: {
        msg: 'Kullanıcı adı zorunludur'
      },
      notEmpty: {
        msg: 'Kullanıcı adı boş olamaz'
      },
      len: {
        args: [3, 50],
        msg: 'Kullanıcı adı 3-50 karakter arasında olmalıdır'
      }
    }
  },
  eposta: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Bu email adresi zaten kullanımda'
    },
    validate: {
      notNull: {
        msg: 'Email adresi zorunludur'
      },
      notEmpty: {
        msg: 'Email adresi boş olamaz'
      },
      isEmail: {
        msg: 'Geçerli bir email adresi giriniz'
      }
    }
  },
  sifre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'Şifre zorunludur'
      },
      notEmpty: {
        msg: 'Şifre boş olamaz'
      },
      len: {
        args: [6, 100],
        msg: 'Şifre en az 6 karakter olmalıdır'
      }
    }
  },
  rol: {
    type: DataTypes.ENUM('kullanici', 'admin'),
    defaultValue: 'kullanici',
    allowNull: false
  },
  profil_foto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email_bildirimleri: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'Users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.sifre) {
        const salt = await bcrypt.genSalt(10);
        user.sifre = await bcrypt.hash(user.sifre, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('sifre')) {
        const salt = await bcrypt.genSalt(10);
        user.sifre = await bcrypt.hash(user.sifre, salt);
      }
    }
  }
});

// Şifre kontrolü için instance method
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.sifre);
};

module.exports = User; 