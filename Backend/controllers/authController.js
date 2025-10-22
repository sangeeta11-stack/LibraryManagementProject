// Backend/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'library_secret';

// ----------- Register Student -----------
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email, password required' });

  db.query('SELECT id FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database Error' });
    if (results.length) return res.status(400).json({ message: 'Email already exists' });

    const hashed = await bcrypt.hash(password, 10);
    db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, 'student'],
      (err2, result) => {
        if (err2) return res.status(500).json({ message: 'Database Error' });
        res.json({ message: 'Registration successful' });
      }
    );
  });
};

// ----------- Login Student/Admin -----------
exports.login = (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password) 
    return res.status(400).json({ message: 'Email & password required' });

  const table = role === 'admin' ? 'admins' : 'users';

  db.query(`SELECT * FROM ${table} WHERE email = ?`, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: 'Database Error' });
    if (!results.length) return res.status(400).json({ message: `${role} not found` });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id, role }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, userId: user.id, name: user.name, email: user.email, role });
  });
};

