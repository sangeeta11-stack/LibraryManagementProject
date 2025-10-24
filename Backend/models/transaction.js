const db = require('../config/db');

class Transaction {
  static insert(data, cb) {
    const sql = `INSERT INTO transactions
      (user_id, user_name, user_email, book_id, book_title, issue_date, due_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(sql, [data.user_id, data.user_name, data.user_email, data.book_id, data.book_title, data.issue_date, data.due_date, data.status], cb);
  }
}

module.exports = Transaction;
