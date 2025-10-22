// Backend/controllers/reservationController.js
const db = require('../config/db');

// Helpers
function formatDate(d) {
  if (!d) return null;
  return new Date(d).toISOString().split('T')[0];
}

// Reserve a book for a specific date
exports.reserveBook = (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { book_id, reservation_date } = req.body;
  if (!book_id || !reservation_date) return res.status(400).json({ message: 'book_id and reservation_date required' });

  // Validate date (no past dates)
  const todayStr = new Date().toISOString().split('T')[0];
  if (reservation_date < todayStr) return res.status(400).json({ message: 'Reservation date cannot be in the past' });

  // Check book exists
  db.query('SELECT id, title FROM books WHERE id = ?', [book_id], (err, bookRes) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!bookRes.length) return res.status(404).json({ message: 'Book not found' });

    const book = bookRes[0];

    // Check user exists and fetch info
    db.query('SELECT id, name, email FROM users WHERE id = ?', [userId], (err2, userRes) => {
      if (err2) return res.status(500).json({ message: 'DB error' });
      if (!userRes.length) return res.status(404).json({ message: 'User not found' });

      const user = userRes[0];

      // Prevent duplicate active reservation by same user for same book on same date OR any active reservation
      const dupSql = `SELECT * FROM reservations WHERE user_id = ? AND book_id = ? AND reservation_date = ? AND status = 'active' LIMIT 1`;
      db.query(dupSql, [userId, book_id, reservation_date], (err3, dupRows) => {
        if (err3) return res.status(500).json({ message: 'DB error' });
        if (dupRows.length) return res.status(400).json({ message: 'You already have an active reservation for this book on that date' });

        // Insert reservation
        const insertSql = `
          INSERT INTO reservations
            (user_id, user_name, user_email, book_id, book_title, reservation_date, reserved_at, status)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), 'active')
        `;
        db.query(insertSql, [user.id, user.name, user.email, book.id, book.title, reservation_date], (err4, insertRes) => {
          if (err4) return res.status(500).json({ message: 'DB error creating reservation' });

          // return reservation details and the user's position in queue for that date/book
          const reservationId = insertRes.insertId;
          const posSql = `SELECT COUNT(*) AS position FROM reservations WHERE book_id = ? AND reservation_date = ? AND status = 'active' AND id <= ?`;
          db.query(posSql, [book_id, reservation_date, reservationId], (err5, posRes) => {
            if (err5) return res.json({ message: 'Book reserved', reservationId }); // fallback
            const position = posRes[0].position || 1;
            res.json({ message: 'Book reserved', reservationId, reservation_date, position });
          });
        });
      });
    });
  });
};

// Cancel reservation
exports.cancelReservation = (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { reservation_id } = req.body;
  if (!reservation_id) return res.status(400).json({ message: 'reservation_id required' });

  db.query('SELECT * FROM reservations WHERE id = ?', [reservation_id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!rows.length) return res.status(404).json({ message: 'Reservation not found' });

    const reservation = rows[0];
    // Only owner or admin can cancel
    if (reservation.user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (reservation.status !== 'active') {
      return res.status(400).json({ message: 'Reservation cannot be cancelled (not active)' });
    }

    db.query('UPDATE reservations SET status = ? WHERE id = ?', ['cancelled', reservation_id], (err2) => {
      if (err2) return res.status(500).json({ message: 'DB error cancelling' });
      res.json({ message: 'Reservation cancelled' });
    });
  });
};

// Renew reservation (extend reservation_date by days or set new date)
exports.renewReservation = (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const { reservation_id, new_date } = req.body;
  if (!reservation_id || !new_date) return res.status(400).json({ message: 'reservation_id and new_date required' });

  const todayStr = new Date().toISOString().split('T')[0];
  if (new_date < todayStr) return res.status(400).json({ message: 'New reservation date cannot be in the past' });

  db.query('SELECT * FROM reservations WHERE id = ?', [reservation_id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    if (!rows.length) return res.status(404).json({ message: 'Reservation not found' });

    const reservation = rows[0];
    if (reservation.user_id !== userId && req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    if (reservation.status !== 'active') return res.status(400).json({ message: 'Only active reservations can be renewed' });

    // Prevent duplicate existing active reservation for same user/book/date
    db.query('SELECT * FROM reservations WHERE user_id = ? AND book_id = ? AND reservation_date = ? AND status = "active" AND id != ? LIMIT 1',
      [userId, reservation.book_id, new_date, reservation_id], (err2, dup) => {
        if (err2) return res.status(500).json({ message: 'DB error' });
        if (dup.length) return res.status(400).json({ message: 'You already have an active reservation for this book on the new date' });

        // Update reservation_date and increment renewals_count
        db.query('UPDATE reservations SET reservation_date = ?, renewals_count = renewals_count + 1 WHERE id = ?', [new_date, reservation_id], (err3) => {
          if (err3) return res.status(500).json({ message: 'DB error updating reservation' });

          // return new position among active reservations for that date/book
          const posSql = `SELECT COUNT(*) AS position FROM reservations WHERE book_id = ? AND reservation_date = ? AND status = 'active' AND id <= ?`;
          db.query(posSql, [reservation.book_id, new_date, reservation_id], (err4, posRes) => {
            if (err4) return res.json({ message: 'Reservation renewed', new_date }); // fallback
            const position = posRes[0].position || 1;
            res.json({ message: 'Reservation renewed', new_date, position });
          });
        });
      });
  });
};

// Get current user's reservations (sorted by reservation_date asc)
exports.getUserReservations = (req, res) => {
  const userId = req.user && req.user.id;
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });

  const sql = `SELECT id, user_id, book_id, book_title, reservation_date, reserved_at, renewals_count, status,
    (SELECT COUNT(*) FROM reservations r2 WHERE r2.book_id = reservations.book_id AND r2.reservation_date = reservations.reservation_date AND r2.status = 'active' AND r2.id <= reservations.id) AS position
    FROM reservations
    WHERE user_id = ?
    ORDER BY reservation_date ASC, reserved_at ASC`;

  db.query(sql, [userId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json(rows);
  });
};

// Admin: get all reservations (optional filtering can be added)
exports.getAllReservations = (req, res) => {
  const sql = `SELECT * FROM reservations ORDER BY reservation_date ASC, reserved_at ASC`;
  db.query(sql, (err, rows) => {
    if (err) return res.status(500).json({ message: 'DB error' });
    res.json(rows);
  });
};
