const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',      
    password: '',      
    database: 'library_db'
});

db.connect(err => {
    if(err) console.error('DB Connection Error:', err);
    else console.log('Database Connected');
});

module.exports = db;
