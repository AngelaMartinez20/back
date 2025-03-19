import { Pool } from 'pg';
import dotenv from 'dotenv';
import logger from './logs/logger'; // Importar Pino

// Cargar las variables de entorno desde el archivo .env
dotenv.config();

export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gym',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false }  // 🚀 NECESARIO PARA RENDER
});

pool.connect()
    .then(() => {
        logger.info('✅ Conectado a la base de datos');
    })
    .catch((err) => {
        logger.error('❌ Error en la conexión a la base de datos:', err);
    });
