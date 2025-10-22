const db = require('../config/db');

exports.getDashboardStats = (req, res) => {
    const stats = {};

    // Total books
    db.query('SELECT COUNT(*) AS totalBooks FROM books', (err, bookResult) => {
        if (err) {
            console.error('Error fetching totalBooks:', err);
            return res.status(500).json({ message: 'Database error fetching totalBooks', error: err });
        }
        stats.totalBooks = bookResult[0]?.totalBooks || 0;

        // Available books
        db.query('SELECT COUNT(*) AS availableBooks FROM books', (err, availResult) => {
    if (err) {
        console.error('Error fetching availableBooks:', err);
        return res.status(500).json({ message: 'Database error fetching availableBooks', error: err });
    }
    stats.availableBooks = availResult[0]?.availableBooks || 0;
            // Total users
            db.query('SELECT COUNT(*) AS totalUsers FROM users', (err, userResult) => {
                if (err) {
                    console.error('Error fetching totalUsers:', err);
                    return res.status(500).json({ message: 'Database error fetching totalUsers', error: err });
                }
                stats.totalUsers = userResult[0]?.totalUsers || 0;

                // Total transactions
                db.query('SELECT COUNT(*) AS totalTransactions FROM transactions', (err, transResult) => {
                    if (err) {
                        console.error('Error fetching totalTransactions:', err);
                        return res.status(500).json({ message: 'Database error fetching totalTransactions', error: err });
                    }
                    stats.totalTransactions = transResult[0]?.totalTransactions || 0;

                    // Send final stats
                    res.json(stats);
                });
            });
        });
    });
};

// Get all students with their transactions
exports.getStudentsWithTransactions = (req, res) => {
  const sql = `
    SELECT u.id AS student_id, u.name, u.email, u.role,
           t.book_id, t.book_title, t.status, t.issue_date, t.due_date
    FROM users u
    LEFT JOIN transactions t ON u.id = t.user_id
    WHERE u.role='student'
    ORDER BY u.id, t.issue_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });

    // Group transactions by student
    const students = [];
    let currentId = null;
    let student = null;

    results.forEach(row => {
      if (row.student_id !== currentId) {
        if (student) students.push(student);
        currentId = row.student_id;
        student = {
          id: row.student_id,
          name: row.name,
          email: row.email,
          role: row.role,
          transactions: []
        };
      }
      if (row.book_id) {
        student.transactions.push({
          book_id: row.book_id,
          book_title: row.book_title,
          status: row.status,
          issue_date: row.issue_date,
          due_date: row.due_date
        });
      }
    });

    if (student) students.push(student);
    res.json(students);
  });
};