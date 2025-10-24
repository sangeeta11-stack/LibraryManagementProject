const mysql = require('mysql2');
require('dotenv').config(); // Load environment variables

const db = mysql.createConnection({
  host: process.env.DB_HOST,       // Railway private domain
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,       // root
  password: process.env.DB_PASS,   // your password
  database: process.env.DB_NAME    // railway
});

db.connect((err) => {
  if (err) {
    console.error('DB Connection Error:', err);
  } else {
    console.log('Database Connected');
  }
});

module.exports = db;
