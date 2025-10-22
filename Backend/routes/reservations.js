// Backend/routes/reservations.js
const express = require('express');
const router = express.Router();
const rc = require('../controllers/reservationController');
const { verifyToken } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// Users
router.post('/reserve', verifyToken, rc.reserveBook);
router.post('/cancel', verifyToken, rc.cancelReservation);
router.post('/renew', verifyToken, rc.renewReservation);
router.get('/my', verifyToken, rc.getUserReservations);

// Admin
router.get('/all', verifyToken, requireRole('admin'), rc.getAllReservations);

module.exports = router;
