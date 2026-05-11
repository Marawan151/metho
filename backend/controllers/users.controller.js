const pool = require('../../database/db.config');

exports.getUsers = (req, res) => {
  pool.query('SELECT id, name, email, role FROM users', (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch users' });
    return res.json(results);
  });
};
