import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'danismanlik'
});

// Test connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası:', err);
  } else {
    console.log('Veritabanına başarıyla bağlandı');
    done();
  }
});

export default pool; 