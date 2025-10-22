const db = require('../config/db');

class User {
    static create({ name, email, password, role }, callback) {
        db.query('INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)', [name, email, password, role], callback);
    }

    static findByEmail(email, callback) {
        db.query('SELECT * FROM users WHERE email=?', [email], callback);
    }

    static findById(id, callback) {
        db.query('SELECT * FROM users WHERE id=?', [id], callback);
    }
}

module.exports = User;
