import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import logger from './logs/logger'; // Importar Pino
import morganMiddleware from './logs/morganMiddleware'; // Importar middleware de Morgan


import authRoutes from './routes/auth.routes';  // ✅ Importación correcta
import adminRoutes from './routes/admin'; // ✅ Asegúrate de que coincide con el nombre del archivo
import reportesRoutes from './routes/reportesRoutes'; // ✅ Importar rutas de reportes
import cajeroRoutes from './routes/cajero';


// 📌 Cargar variables de entorno
dotenv.config();
logger.info("🔑 JWT_SECRET cargado:", { JWT_SECRET: process.env.JWT_SECRET ? "CARGADO" : "NO CONFIGURADO" });

// 📌 Verificar si JWT_SECRET está configurado
if (!process.env.JWT_SECRET) {
    throw new Error('❌ Falta configurar JWT_SECRET en el archivo .env');
}

// 📌 Crear la aplicación de Express
const app = express();
app.set('trust proxy', 1); // ✅ Soluciona el problema con express-rate-limit


app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://frontend-1w8y-nyqrljdh6-angelas-projects-a3fd7f7d.vercel.app'],
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    optionsSuccessStatus: 204, // ✅ Evita problemas con preflight
  }));
  

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.sendStatus(204); // No devuelve contenido
  });
  

// 📌 Middleware de Morgan para registrar todas las solicitudes HTTP
app.use(morganMiddleware);

// 📌 Servir archivos estáticos (IMPORTANTE para que funcionen las imágenes)
const uploadsPath = path.resolve(__dirname, '../uploads'); 
app.use('/uploads', express.static(uploadsPath));
logger.info(`📂 Serviendo archivos estáticos en: ${uploadsPath}`);



// 📌 Servir archivos estáticos desde `dist` y `public`
app.use(express.static('dist'));
app.use(express.static(path.join(__dirname, 'public')));

// 📌 Configuración de vistas
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ✅ Registrar rutas
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api', reportesRoutes);
app.use('/api', cajeroRoutes);

// 📌 Middleware para manejar errores globales
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('❌ Error en el servidor:', err);
    res.status(500).send('⚠️ Algo salió mal. Por favor, intenta más tarde.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    logger.info(`🚀 Servidor corriendo en: ${serverUrl}`);
    logger.info(`📂 Archivos disponibles en: ${serverUrl}/uploads/`);
});
