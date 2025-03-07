import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from './routes/auth.routes';  // ✅ Importación correcta
import adminRoutes from './routes/admin'; // ✅ Asegúrate de que coincide con el nombre del archivo
import reportesRoutes from './routes/reportesRoutes'; // ✅ Importar rutas de reportes
import cajeroRoutes from './routes/cajero';


// 📌 Cargar variables de entorno
dotenv.config();
console.log("🔑 JWT_SECRET cargado:", process.env.JWT_SECRET);

// 📌 Verificar si JWT_SECRET está configurado
if (!process.env.JWT_SECRET) {
    throw new Error('❌ Falta configurar JWT_SECRET en el archivo .env');
}

// 📌 Crear la aplicación de Express
const app = express();

app.set('trust proxy', 1); // ✅ Soluciona el problema con express-rate-limit

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'https://frontend-1w8y.vercel.app'], 
  credentials: true,
  allowedHeaders: ['Authorization', 'Content-Type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// 📌 Servir archivos estáticos (IMPORTANTE para que funcionen las imágenes)
const uploadsPath = path.resolve(__dirname, '../uploads'); 
app.use('/uploads', express.static(uploadsPath));

console.log(`📂 Serviendo archivos en: ${uploadsPath}`);

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
    console.error('❌ Error en el servidor:', err.stack);
    res.status(500).send('⚠️ Algo salió mal. Por favor, intenta más tarde.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    console.log(`🚀 Servidor corriendo en: ${serverUrl}`);
    console.log(`📂 Archivos disponibles en: ${serverUrl}/uploads/`);
});
