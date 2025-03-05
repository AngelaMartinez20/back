"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verificarRol = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Falta configurar JWT_SECRET en el archivo .env');
}
// ✅ Middleware corregido con tipo `void` en la función
const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        var _a;
        try {
            const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
            if (!token) {
                res.status(403).json({ message: 'Acceso denegado' });
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!rolesPermitidos.includes(decoded.role)) {
                res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
                return;
            }
            req.user = decoded;
            next(); // ✅ Se llama a `next()` correctamente sin retornar nada
        }
        catch (error) {
            res.status(401).json({ message: 'Token inválido' });
        }
    };
};
exports.verificarRol = verificarRol;
