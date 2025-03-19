"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeToken = exports.loginLimiter = exports.authorizeRoles = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("../logs/logger")); // Importar Pino
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRATION = '1h';
if (!JWT_SECRET) {
    throw new Error('⚠️ Error: Falta configurar JWT_SECRET en el archivo .env');
}
// ✅ Lista negra de tokens expirados o revocados (mejor en Redis en producción)
const blacklistedTokens = new Set();
// ✅ Middleware de autenticación con alta seguridad
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logUnauthorizedAccess(req, 'Token no proporcionado');
        res.status(401).json({ message: 'Acceso no autorizado. Token requerido.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    // ✅ Verificar si el token está en la lista negra
    if (blacklistedTokens.has(token)) {
        logUnauthorizedAccess(req, 'Token en lista negra');
        res.status(403).json({ message: 'Token inválido o expirado.' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        logger_1.default.info(`✅ Acceso permitido para usuario ${decoded.email} con rol ${decoded.role}`);
        next();
    }
    catch (error) {
        logUnauthorizedAccess(req, 'Token inválido o expirado');
        res.status(403).json({ message: 'Token inválido o expirado.' });
    }
});
exports.authenticateUser = authenticateUser;
// ✅ Middleware para verificar roles con más seguridad
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            res.status(401).json({ message: 'No autorizado. Usuario no autenticado.' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            logUnauthorizedAccess(req, `Intento de acceso con rol no permitido (${req.user.role})`);
            res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
            return;
        }
        logger_1.default.info(`✅ Usuario ${req.user.email} con rol ${req.user.role} accedió correctamente`);
        next();
    });
};
exports.authorizeRoles = authorizeRoles;
// ✅ Middleware para proteger contra ataques de fuerza bruta
exports.loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo de intentos de login por IP
    message: '⚠️ Demasiados intentos de acceso. Intenta nuevamente más tarde.',
    headers: true,
    handler: (req, res) => {
        logger_1.default.warn(`🚫 Demasiados intentos de login desde IP ${req.ip}`);
        res.status(429).json({ message: 'Demasiados intentos de acceso. Intenta nuevamente más tarde.' });
    }
});
// ✅ Función para revocar tokens (Logout seguro)
const revokeToken = (token) => {
    blacklistedTokens.add(token);
    logger_1.default.info(`🔒 Token revocado`);
};
exports.revokeToken = revokeToken;
// ✅ Función para registrar accesos no autorizados
const logUnauthorizedAccess = (req, reason) => {
    logger_1.default.warn(`❌ Acceso no autorizado desde ${req.ip} - Motivo: ${reason}`);
};
