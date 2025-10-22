
const db = require('../config/db');

// ✅ Get all books
exports.getAllBooks = (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) return res.status(500).json({ message: 'Database Error', error: err });
    res.json(results);
  });
};

// ✅ Add a new book
exports.addBook = (req, res) => {
  const { title, author, category } = req.body;
  if (!title || !author) {
    return res.status(400).json({ message: 'Title and Author are required' });
  }
  db.query(
    'INSERT INTO books (title, author, category, available) VALUES (?, ?, ?, 1)',
    [title, author, category],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Failed to add book', error: err });
      res.json({ message: 'Book added successfully', bookId: result.insertId });
    }
  );
};

// ✅ Update book
exports.updateBook = (req, res) => {
  const { id } = req.params;
  const { title, author, category, available } = req.body;

  db.query(
    'UPDATE books SET title=?, author=?, category=?, available=? WHERE id=?',
    [title, author, category, available, id],
    (err) => {
      if (err) return res.status(500).json({ message: 'Failed to update book', error: err });
      res.json({ message: 'Book updated successfully' });
    }
  );
};

// ✅ Delete book
exports.deleteBook = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM books WHERE id=?', [id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to delete book', error: err });
    res.json({ message: 'Book deleted successfully' });
  });
};


