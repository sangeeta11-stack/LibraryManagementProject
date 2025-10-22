// Backend/routes/reports.js
const express = require('express');
const router = express.Router();
const rpt = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

router.get('/books', verifyToken, requireRole('admin'), rpt.booksReport);
router.get('/users', verifyToken, requireRole('admin'), rpt.usersReport);
router.get('/transactions', verifyToken, requireRole('admin'), rpt.transactionsReport);
router.get('/overdue', verifyToken, requireRole('admin'), rpt.overdueReport);
router.get('/fines', verifyToken, requireRole('admin'), rpt.finesReport);

module.exports = router;
