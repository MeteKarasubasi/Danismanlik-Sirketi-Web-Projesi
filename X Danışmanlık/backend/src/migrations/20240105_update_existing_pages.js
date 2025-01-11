'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      UPDATE "PageContents"
      SET navbar_kategori = 'hizmetler'
      WHERE navbar_kategori IS NULL;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Bu migration'ın geri alınması gerekmiyor
  }
}; 