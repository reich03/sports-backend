const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const client = new Client({
  host: 'postgres',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'master_sport_db'
});

async function updatePasswords() {
  try {
    await client.connect();
    console.log('📦 Conectado a PostgreSQL');

    // Generate fresh hashes
    const adminHash = await bcrypt.hash('admin123', 10);
    const testHash = await bcrypt.hash('test123', 10);

    console.log('🔐 Hashes generados:');
    console.log('  admin123:', adminHash);
    console.log('  test123:', testHash);

    // Update admin
    await client.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      [adminHash, 'admin@mastersport.app']
    );
    console.log('✅ Admin password actualizado');

    // Update test users
    await client.query(
      'UPDATE users SET password = $1 WHERE email IN ($2, $3, $4)',
      [testHash, 'test@test.com', 'user1@test.com', 'user2@test.com']
    );
    console.log('✅ Test users passwords actualizados');

    const result = await client.query('SELECT email, LEFT(password, 30) as pwd FROM users');
    console.log('\n📋 Passwords en DB:');
    result.rows.forEach(row => console.log(`  ${row.email}: ${row.pwd}...`));

    // Verify hashes work
    console.log('\n🧪 Verificando hashes:');
    const adminMatch = await bcrypt.compare('admin123', adminHash);
    const testMatch = await bcrypt.compare('test123', testHash);
    console.log(`  admin123 match: ${adminMatch}`);
    console.log(`  test123 match: ${testMatch}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await client.end();
    console.log('\n🔌 Desconectado');
  }
}

updatePasswords();
