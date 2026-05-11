require('dotenv').config({ path: '../config/.env' });
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  console.log('Connecting to remote database...');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true // Required to run full SQL files
    });

    console.log('✅ Connected successfully!');

    // Create database if it doesn't exist and use it
    const dbName = process.env.DB_NAME || 'eventdb';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`✅ Selected database: ${dbName}`);

    // Read and execute schema.sql
    console.log('Reading schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSql);
    console.log('✅ Schema tables created successfully!');

    // Read and execute seed.sql
    console.log('Reading seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await connection.query(seedSql);
    console.log('✅ Seed data inserted successfully!');

    console.log('\n🎉 Database initialization complete! You can now deploy your backend.');
    await connection.end();

  } catch (error) {
    console.error('\n❌ Database initialization failed:');
    console.error(error.message);
  }
}

initializeDatabase();
