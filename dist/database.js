"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logs/logger")); // Importar Pino
// Cargar las variables de entorno desde el archivo .env
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gym',
    port: parseInt(process.env.DB_PORT || '5432'),
    ssl: { rejectUnauthorized: false } // 🚀 NECESARIO PARA RENDER
});
exports.pool.connect()
    .then(() => {
    logger_1.default.info('✅ Conectado a la base de datos');
})
    .catch((err) => {
    logger_1.default.error('❌ Error en la conexión a la base de datos:', err);
});
