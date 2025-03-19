"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarRol = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../logs/logger")); // Importar Pino
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Falta configurar JWT_SECRET en el archivo .env');
}
// ✅ Middleware para verificar roles
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token) {
                logger_1.default.warn('🚫 Acceso denegado: No se proporcionó un token');
                return res.status(403).json({ message: 'Acceso denegado' });
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!rolesPermitidos.includes(decoded.role)) {
                logger_1.default.warn(`🚫 Acceso denegado: El rol '${decoded.role}' no tiene permiso para esta ruta`);
                return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
            }
            req.user = decoded;
            logger_1.default.info(`✅ Acceso permitido para usuario ${decoded.email} con rol ${decoded.role}`);
            next();
        }
        catch (error) {
            logger_1.default.error('❌ Token inválido o error en la verificación:', error);
            return res.status(401).json({ message: 'Token inválido' });
        }
    };
};
exports.verificarRol = verificarRol;
