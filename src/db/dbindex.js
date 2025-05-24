require('dotenv').config();
const { Pool } = require('pg');

console.log('PGHOST:', process.env.PGHOST);
console.log('PGUSER:', process.env.PGUSER);
console.log('PGPASSWORD:', process.env.PGPASSWORD);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGPORT:', process.env.PGPORT);

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

module.exports = pool;
