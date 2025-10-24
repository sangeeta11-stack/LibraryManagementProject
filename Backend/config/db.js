const mysql = require('mysql2');
require('dotenv').config(); // Load .env variables

const db = mysql.createConnection({
    host: process.env.DB_HOST,      // e.g., Railway private domain
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,      // e.g., root
    password: process.env.DB_PASS,  // from Railway
    database: process.env.DB_NAME   // e.g., railway
});

db.connect(err => {
    if (err) {
        console.error('DB Connection Error:', err);
    } else {
        console.log('Database Connected');
    }
});

module.exports = db;
