'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('PageContents', 'navbar_kategori', {
      type: Sequelize.ENUM('hizmetler', 'hakkimizda', 'iletisim'),
      allowNull: false,
      defaultValue: 'hizmetler'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('PageContents', 'navbar_kategori');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_PageContents_navbar_kategori";');
  }
}; 