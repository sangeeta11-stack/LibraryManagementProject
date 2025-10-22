// Backend/controllers/transactionController.js
const db = require('../config/db');

const FINE_PER_DAY = 10; // ₹10/day
const MAX_RENEWALS = 2;
const RENEW_DAYS = 7;

// Issue Book
exports.issueBook = (req, res) => {
  const authUserId = req.user && req.user.id;
  const user_id = authUserId || req.body.user_id;
  const book_id = req.body.book_id;

  if (!user_id || !book_id) return res.status(400).json({ message: 'user_id and book_id are required' });

  db.query('SELECT id, title, available FROM books WHERE id = ?', [book_id], (err, bookRes) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!bookRes.length) return res.status(404).json({ message: 'Book not found' });

    const book = bookRes[0];
    if (!book.available) return res.status(400).json({ message: 'Book not available' });

    db.query('SELECT id, name, email FROM users WHERE id = ?', [user_id], (err2, userRes) => {
      if (err2) return res.status(500).json({ message: 'DB error' });
      if (!userRes.length) return res.status(404).json({ message: 'User not found' });

      const user = userRes[0];
      const issue_date = new Date();
      const due_date = new Date(issue_date);
      due_date.setDate(issue_date.getDate() + RENEW_DAYS);

      const insertSql = `INSERT INTO transactions
        (user_id, user_name, user_email, book_id, book_title, issue_date, due_date, status, renewals_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'issued', 0)`;

      db.query(insertSql, [user.id, user.name, user.email, book.id, book.title, issue_date, due_date], (err3, insertRes) => {
        if (err3) return res.status(500).json({ message: 'DB error inserting transaction' });

        db.query('UPDATE books SET available = 0 WHERE id = ?', [book.id], (err4) => {
          if (err4) return res.status(500).json({ message: 'DB error updating book' });
          res.json({ message: 'Book issued', transactionId: insertRes.insertId, due_date });
        });
      });
    });
  });
};

// Return Book
exports.returnBook = (req, res) => {
  const transaction_id = req.body.transaction_id;
  if (!transaction_id) return res.status(400).json({ message: 'transaction_id required' });

  db.query('SELECT * FROM transactions WHERE id = ?', [transaction_id], (err, txRes) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!txRes.length) return res.status(404).json({ message: 'Transaction not found' });

    const transaction = txRes[0];
    if (transaction.status === 'returned') return res.status(400).json({ message: 'Already returned' });

    const return_date = new Date();
    const due = new Date(transaction.due_date);
    const overdueDays = Math.max(0, Math.ceil((return_date - due) / (1000 * 60 * 60 * 24)));
    const fine = overdueDays * FINE_PER_DAY;

    db.query('UPDATE transactions SET return_date = ?, overdue_days = ?, fine = ?, status = ? WHERE id = ?',
      [return_date, overdueDays, fine, 'returned', transaction_id], (err2) => {
        if (err2) return res.status(500).json({ message: 'DB error updating transaction' });

        db.query('UPDATE books SET available = 1 WHERE id = ?', [transaction.book_id], (err3) => {
          if (err3) return res.status(500).json({ message: 'DB error updating book' });
          res.json({ message: 'Book returned', overdueDays, fine });
        });
      });
  });
};

// Renew Book
exports.renewBook = (req, res) => {
  const userId = req.user.id;
  const { transaction_id } = req.body;

  if (!transaction_id)
    return res.status(400).json({ message: 'transaction_id required' });

  db.query('SELECT * FROM transactions WHERE id = ?', [transaction_id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!rows.length) return res.status(404).json({ message: 'Transaction not found' });

    const transaction = rows[0];

    if (transaction.user_id !== userId && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });

    if (transaction.status !== 'issued')
      return res.status(400).json({ message: 'Cannot renew returned book' });

    if ((transaction.renewals_count || 0) >= 2)
      return res.status(400).json({ message: 'Maximum renewals reached' });

    // Check if book is overdue
    const today = new Date();
    const dueDate = new Date(transaction.due_date);
    const overdueDays = Math.max(0, Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24)));
    const fine = overdueDays * 10; // ₹10/day fine

    // Extend due date by 7 days from today if overdue, else from old due date
    const newDueDate = new Date(today > dueDate ? today : dueDate);
    newDueDate.setDate(newDueDate.getDate() + 7);

    const newRenewCount = (transaction.renewals_count || 0) + 1;

    db.query(
      'UPDATE transactions SET due_date = ?, renewals_count = ?, overdue_days = ?, fine = ? WHERE id = ?',
      [newDueDate, newRenewCount, overdueDays, fine, transaction_id],
      (err2) => {
        if (err2) return res.status(500).json({ message: 'DB error updating transaction' });
        res.json({
          message: 'Book renewed successfully',
          new_due_date: newDueDate,
          renewals_count: newRenewCount,
          overdue_days: overdueDays,
          fine
        });
      }
    );
  });
};
// Get transactions for logged-in user (use req.user.id)
exports.getTransactionsForUser = (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  db.query('SELECT * FROM transactions WHERE user_id = ? ORDER BY issue_date DESC', [userId], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json(results);
  });
};


// Admin: Get all transactions
exports.getAllTransactions = (req, res) => {
  const sql = `
    SELECT t.id, t.user_id, t.book_id, t.book_title, t.issue_date, t.due_date, t.status,
           u.name AS user_name, u.email AS user_email
    FROM transactions t
    JOIN users u ON t.user_id = u.id
    ORDER BY t.issue_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(results);
  });
};

// Issue and Return placeholders
exports.issueBook = (req, res) => res.json({ message: 'Book issued' });
exports.returnBook = (req, res) => res.json({ message: 'Book returned' });
