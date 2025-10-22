const express = require('express');
const router = express.Router();
const { getAllBooks, addBook, updateBook, deleteBook } = require('../controllers/bookController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, getAllBooks);
router.post('/', verifyToken, addBook);
router.put('/:id', verifyToken, updateBook);
router.delete('/:id', verifyToken, deleteBook);

module.exports = router;