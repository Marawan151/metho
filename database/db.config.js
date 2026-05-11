
const mysql = require('mysql2');

const host = process.env.DB_HOST || '127.0.0.1';
const port = Number(process.env.DB_PORT) || 3306;

const pool = mysql.createPool({
  host,
  port,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'eventdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
});

pool.on('error', (err) => {
  if (err.code === 'ECONNREFUSED') {
    console.error(
      `[database] Cannot reach MySQL at ${host}:${port}. Is the server running?\n` +
        '          Start MySQL locally, create the database from database/schema.sql + database/seed.sql, and set DB_* in config/.env.'
    );
    return;
  }
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('[database] Connection lost; restart the app or check MySQL.');
    return;
  }
  if (err.fatal) {
    console.error('[database] Fatal pool error:', err.message);
  }
});

module.exports = pool;
