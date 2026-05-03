const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function syncDB() {
  const config = {
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password_secreto',
    database: process.env.DB_NAME || 'restaurante_bd',
  };

  let client;
  let connected = false;
  let retries = 5;

  console.log('🔄 [Audit] Iniciando comprobación de integridad...');

  while (retries > 0 && !connected) {
    try {
      client = new Client(config);
      await client.connect();
      connected = true;
      console.log('✅ [Audit] Conexión establecida con la base de datos.');
    } catch (err) {
      retries--;
      console.log(`⚠️ [Audit] Esperando a la base de datos... (${retries} reintentos restantes)`);
      if (retries === 0) {
        console.error('❌ [Audit] No se pudo conectar tras varios intentos.');
        return;
      }
      await new Promise(res => setTimeout(res, 2000));
    }
  }

  try {
    // 1. Verificar si la tabla 'users' existe
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('⚠️ [Audit] Esquema no detectado. Inyectando init.sql...');
      const initSql = fs.readFileSync(path.join(__dirname, '../bd/init.sql'), 'utf8');
      await client.query(initSql);
      console.log('✅ [Audit] init.sql inyectado.');
    }

    // 2. Verificar columnas críticas
    const columnCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'is_active'
      );
    `);

    if (!columnCheck.rows[0].exists) {
      console.log('⚠️ [Audit] Actualizando esquema (is_active)...');
      await client.query('ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;');
    }

    // 3. Verificar datos mínimos
    const rolesCheck = await client.query('SELECT COUNT(*) FROM roles');
    if (parseInt(rolesCheck.rows[0].count) === 0) {
      console.log('⚠️ [Audit] Poblando datos iniciales...');
      const seedSql = fs.readFileSync(path.join(__dirname, '../bd/seed_test_ivan.sql'), 'utf8');
      await client.query(seedSql);
      console.log('✅ [Audit] Datos de prueba inyectados.');
    }

    console.log('🚀 [Audit] Sincronización completada.');

  } catch (err) {
    console.error('❌ [Audit] Error durante la auditoría:', err.message);
  } finally {
    if (client) await client.end();
  }
}

syncDB();
