const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('danismanlik', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
  logging: console.log,
  define: {
    timestamps: true,
    freezeTableName: true
  }
});

module.exports = {
  sequelize
}; 