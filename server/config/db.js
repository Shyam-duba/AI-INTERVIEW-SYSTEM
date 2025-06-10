// src/config/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRESQL_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10, // limit concurrent clients
  idleTimeoutMillis: 30000, // close idle clients after 30s
  connectionTimeoutMillis: 2000, // fail if can't connect in 2s
});


console.log("connected to db")

module.exports = pool;
