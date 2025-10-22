const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/adminController');
const { verifyToken } = require('../middleware/auth');
const { getStudentsWithTransactions } = require('../controllers/adminController');

router.get('/dashboard', verifyToken, getDashboardStats);
router.get('/students', verifyToken, getStudentsWithTransactions);

module.exports = router;
