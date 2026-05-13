const { Pool } = require('pg');

// Force allow self-signed certificates for cloud providers (like Aiven)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// Robust SSL configuration for PostgreSQL
const sslConfig = {
  rejectUnauthorized: false
};

const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  // Increase timeout for slow cloud connections
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

function convertPlaceholders(text) {
  if (typeof text !== 'string') return text;
  let index = 1;
  return text.replace(/\?/g, () => `$${index++}`);
}

const wrapClient = (client) => {
  return {
    query: (text, params, callback) => {
      if (typeof params === 'function') {
        callback = params;
        params = [];
      }
      const newText = convertPlaceholders(text);
      if (callback) {
        return client.query(newText, params, (err, result) => {
          callback(err, result ? result.rows : undefined, result ? result.fields : undefined);
        });
      }
      return client.query(newText, params).then(result => {
        const rows = result.rows;
        rows.affectedRows = result.rowCount;
        return [rows, result.fields];
      });
    },
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    release: () => client.release(),
  };
};

const originalQuery = pool.query.bind(pool);

pool.query = (text, params, callback) => {
  if (typeof params === 'function') {
    callback = params;
    params = [];
  }
  const newText = convertPlaceholders(text);
  if (callback) {
    return originalQuery(newText, params, (err, result) => {
      if (err) console.error('[database] Query Error:', err.message);
      callback(err, result ? result.rows : undefined, result ? result.fields : undefined);
    });
  }
  return originalQuery(newText, params)
    .then(result => result.rows)
    .catch(err => {
      console.error('[database] Query Error:', err.message);
      throw err;
    });
};

pool.promise = () => ({
  query: (text, params) => {
    const newText = convertPlaceholders(text);
    return originalQuery(newText, params)
      .then(result => {
        const rows = result.rows;
        rows.affectedRows = result.rowCount;
        return [rows, result.fields];
      })
      .catch(err => {
        console.error('[database] Promise Query Error:', err.message);
        throw err;
      });
  },
  getConnection: () => pool.connect()
    .then(client => wrapClient(client))
    .catch(err => {
      console.error('[database] Connection Error:', err.message);
      throw err;
    })
});

pool.on('error', (err) => {
  console.error('[database] Unexpected error on idle client', err.message);
});

module.exports = pool;
