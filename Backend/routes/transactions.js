const express = require('express');
const router = express.Router();
const tc = require('../controllers/transactionController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Issue / Return
router.post('/issue', verifyToken, tc.issueBook);
router.post('/return', verifyToken, tc.returnBook);

// Renew
router.post('/renew', verifyToken, tc.renewBook);

// User transactions
router.get('/', verifyToken, tc.getTransactionsForUser);
router.get('/admin/transactions', verifyToken, requireRole('admin'), tc.getAllTransactions);
// User actions (issue/return can be implemented later)
router.post('/issue', verifyToken, tc.issueBook);
router.post('/return', verifyToken, tc.returnBook);
// Admin all transactions
router.get('/all', verifyToken, requireRole('admin'), tc.getAllTransactions);

module.exports = router;
