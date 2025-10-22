const db = require('../config/db');

exports.getAllStudents = (req, res) => {
    db.query('SELECT id, name, email FROM users WHERE role="student"', (err, results) => {
        if (err) return res.status(500).json({ message: 'Database Error' });
        res.json(results);
    });
};
