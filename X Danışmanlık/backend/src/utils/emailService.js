const nodemailer = require('nodemailer');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'adamwarlock628@gmail.com',
    pass: 'gsau hase mken ahuq'
  }
});

const sendNotificationEmail = async (to, subject, text) => {
  try {
    const mailOptions = {
      from: 'adamwarlock628@gmail.com',
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    console.log('Email gönderildi:', to);
    return true;
  } catch (error) {
    console.error('Email gönderme hatası:', error);
    return false;
  }
};

const sendAnnouncementNotification = async (announcement) => {
  try {
    // Email bildirimleri aktif olan kullanıcıları bul
    const users = await User.findAll({
      where: {
        email_bildirimleri: true
      },
      attributes: ['eposta']
    });

    if (users.length === 0) {
      console.log('Bildirim alacak kullanıcı bulunamadı');
      return;
    }

    const emailList = users.map(user => user.eposta);
    const subject = 'Yeni Duyuru: ' + announcement.baslik;
    const text = `${announcement.baslik}\n\n${announcement.icerik}\n\nBu e-postayı almak istemiyorsanız, profil sayfanızdan bildirim tercihlerinizi güncelleyebilirsiniz.`;

    await sendNotificationEmail(emailList.join(','), subject, text);
    console.log('Duyuru bildirimi gönderildi');
  } catch (error) {
    console.error('Duyuru bildirimi gönderme hatası:', error);
  }
};

module.exports = {
  sendNotificationEmail,
  sendAnnouncementNotification
}; 