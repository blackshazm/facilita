const { Client } = require('pg');

async function main() {
  const client = new Client({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'postgres',
    password: 'password',
    port: 5433,
  });

  try {
    await client.connect();
    console.log('Connected successfully');
    const res = await client.query('SELECT current_user, current_database()');
    console.log(res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error', err.stack);
  }
}

main();
