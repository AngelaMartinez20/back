"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes")); // ✅ Importación correcta
const admin_1 = __importDefault(require("./routes/admin")); // ✅ Asegúrate de que coincide con el nombre del archivo
const reportesRoutes_1 = __importDefault(require("./routes/reportesRoutes")); // ✅ Importar rutas de reportes
const cajero_1 = __importDefault(require("./routes/cajero"));
// 📌 Cargar variables de entorno
dotenv_1.default.config();
console.log("🔑 JWT_SECRET cargado:", process.env.JWT_SECRET);
// 📌 Verificar si JWT_SECRET está configurado
if (!process.env.JWT_SECRET) {
    throw new Error('❌ Falta configurar JWT_SECRET en el archivo .env');
}
// 📌 Crear la aplicación de Express
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:5173', 'https://frontend-1w8y.vercel.app'], // ✅ Agregar Vercel
    credentials: true, // ✅ Permitir autenticación y cookies
    allowedHeaders: ['Authorization', 'Content-Type'], // ✅ Permitir headers específicos
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // ✅ Métodos permitidos
}));
// 📌 Middlewares para procesar datos correctamente
app.use(express_1.default.json()); // ✅ Permitir JSON en las solicitudes
app.use(express_1.default.urlencoded({ extended: false })); // ✅ Permitir formularios
// 📌 Servir archivos estáticos (IMPORTANTE para que funcionen las imágenes)
const uploadsPath = path_1.default.resolve(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadsPath));
console.log(`📂 Serviendo archivos en: ${uploadsPath}`);
// 📌 Servir archivos estáticos desde `dist` y `public`
app.use(express_1.default.static('dist'));
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// 📌 Configuración de vistas
app.set('views', path_1.default.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// ✅ Registrar rutas
app.use('/auth', auth_routes_1.default);
app.use('/admin', admin_1.default);
app.use('/api', reportesRoutes_1.default);
app.use('/api', cajero_1.default);
// 📌 Middleware para manejar errores globales
app.use((err, req, res, next) => {
    console.error('❌ Error en el servidor:', err.stack);
    res.status(500).send('⚠️ Algo salió mal. Por favor, intenta más tarde.');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
    console.log(`🚀 Servidor corriendo en: ${serverUrl}`);
    console.log(`📂 Archivos disponibles en: ${serverUrl}/uploads/`);
});
