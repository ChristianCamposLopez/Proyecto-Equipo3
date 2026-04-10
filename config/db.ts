// config/db.ts
import { Pool } from 'pg';

// Creamos un Pool de conexiones para no saturar la BD
export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password_secreto',
  database: process.env.DB_NAME || 'restaurante_bd',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// Mensaje en consola para que el equipo sepa que conectó bien
db.on('connect', () => {
  console.log(' Conexión a PostgreSQL establecida con éxito');
});
