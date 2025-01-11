'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      kullanici_adi: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      eposta: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      sifre: {
        type: Sequelize.STRING,
        allowNull: false
      },
      profil_foto: {
        type: Sequelize.STRING,
        allowNull: true
      },
      email_bildirimleri: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
}; 