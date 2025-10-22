const db = require('../config/db');

class Book {
    static getAll(callback) {
        db.query('SELECT * FROM books', callback);
    }

    static create({ title, author, category }, callback) {
        db.query('INSERT INTO books (title, author, category, available) VALUES (?,?,?,1)', [title, author, category], callback);
    }

    static updateAvailability(id, available, callback) {
        db.query('UPDATE books SET available=? WHERE id=?', [available, id], callback);
    }
}

module.exports = Book;
