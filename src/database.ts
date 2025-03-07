import { Pool } from 'pg';
import dotenv from 'dotenv';

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
        console.log('✅ Connected to the database');
    })
    .catch((err) => {
        console.error('❌ Database connection failed:', err);
    });
