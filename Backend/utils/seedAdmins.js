// Backend/utils/seedAdmins.js
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const admins = [
  { name: 'Admin One', email: 'admin1@example.com', password: 'password1' },
  { name: 'Admin Two', email: 'admin2@example.com', password: 'password2' },
  { name: 'Admin Three', email: 'admin3@example.com', password: 'password3' },
  { name: 'Admin Four', email: 'admin4@example.com', password: 'password4' },
  { name: 'Admin Five', email: 'admin5@example.com', password: 'password5' },
];

(async function seedAdmins() {
  for (const admin of admins) {
    const hashed = await bcrypt.hash(admin.password, 10);

    db.query(
      'INSERT INTO admins (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [admin.name, admin.email, hashed],
      (err, result) => {
        if (err) console.error(`Error inserting ${admin.email}:`, err);
        else console.log(`Inserted admin: ${admin.email}`);
      }
    );
  }
})();
