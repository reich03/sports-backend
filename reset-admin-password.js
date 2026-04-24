const bcrypt = require('bcryptjs');
const { Client } = require('pg');

// Contraseña que quieres establecer (cámbiala aquí)
const NEW_PASSWORD = 'admin123';  // ⬅️ CAMBIA ESTO POR TU CONTRASEÑA

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'master_sport_db'
});

async function resetAdminPassword() {
  try {
    await client.connect();
    console.log('📦 Conectado a PostgreSQL');

    // Generar hash para la nueva contraseña
    const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
    console.log(`🔐 Hash generado para contraseña: ${NEW_PASSWORD}`);

    // Actualizar contraseña del admin
    const result = await client.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING email, username',
      [passwordHash, 'admin@mastersport.app']
    );

    if (result.rowCount > 0) {
      console.log('✅ Contraseña actualizada exitosamente');
      console.log(`   Usuario: ${result.rows[0].username}`);
      console.log(`   Email: ${result.rows[0].email}`);
      console.log(`   Nueva contraseña: ${NEW_PASSWORD}`);
    } else {
      console.log('⚠️  No se encontró el usuario admin@mastersport.app');
    }

    // Verificar que funciona
    const dbUser = await client.query(
      'SELECT password FROM users WHERE email = $1',
      ['admin@mastersport.app']
    );
    
    if (dbUser.rows.length > 0) {
      const isValid = await bcrypt.compare(NEW_PASSWORD, dbUser.rows[0].password);
      console.log(`\n🧪 Verificación: ${isValid ? '✅ Contraseña válida' : '❌ Error en la contraseña'}`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
    console.error(err);
  } finally {
    await client.end();
    console.log('\n🔌 Desconectado de la base de datos');
  }
}

resetAdminPassword();
