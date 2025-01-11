const { sequelize } = require('./database');
const User = require('../models/User');

const testPasswords = async () => {
  try {
    // Tüm kullanıcıları getir
    const users = await User.findAll();
    
    console.log('\nKullanıcı Listesi:');
    for (const user of users) {
      console.log(`\nKullanıcı ID: ${user.id}`);
      console.log(`Email: ${user.eposta}`);
      console.log(`Şifre Hash: ${user.sifre}`);
      
      // Test şifresi ile kontrol
      const testPassword = '123456'; // Yaygın kullanılan test şifresi
      const isMatch = await user.checkPassword(testPassword);
      console.log(`Test şifresi (${testPassword}) eşleşmesi:`, isMatch);
    }

    process.exit(0);
  } catch (error) {
    console.error('Test hatası:', error);
    process.exit(1);
  }
};

testPasswords(); 