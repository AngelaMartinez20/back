"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('⚠️ Error: Falta configurar JWT_SECRET en el archivo .env');
}
const authenticateUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log("🔍 Token recibido en middleware:", authHeader); // 👀 Verificar si el token llega
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error("❌ Error: No se recibió un token o formato incorrecto.");
        res.status(401).json({ message: '❌ Acceso no autorizado. Token requerido.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log("✅ Usuario autenticado:", decoded); // 👀 Verificar si el token es válido
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("❌ Error al verificar token:", error);
        res.status(403).json({ message: '❌ Token inválido o expirado.' });
    }
};
exports.authenticateUser = authenticateUser;
// ✅ Middleware para verificar roles
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: '❌ No autorizado. Usuario no autenticado.' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: '⛔ No tienes permisos para realizar esta acción.' });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
