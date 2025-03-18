import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import logger from '../logs/logger'; // Importar Pino


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET as string;
const TOKEN_EXPIRATION = '1h';

if (!JWT_SECRET) {
    throw new Error('⚠️ Error: Falta configurar JWT_SECRET en el archivo .env');
}

// ✅ Lista negra de tokens expirados o revocados (mejor en Redis en producción)
const blacklistedTokens = new Set<string>();

// ✅ Extender la interfaz Request para incluir `user`
export interface UserPayload {
    id: number;
    email: string;
    role: string;
}

// ✅ Agregar `user` a `Request`
declare module 'express-serve-static-core' {
    interface Request {
        user?: UserPayload;
    }
}

// ✅ Middleware de autenticación con alta seguridad
export const authenticateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        req.user = decoded;
        logger.info(`✅ Acceso permitido para usuario ${decoded.email} con rol ${decoded.role}`);
        next();
    } catch (error) {
        logUnauthorizedAccess(req, 'Token inválido o expirado');
        res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

// ✅ Middleware para verificar roles con más seguridad
export const authorizeRoles = (...allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            res.status(401).json({ message: 'No autorizado. Usuario no autenticado.' });
            return;
        }

        if (!allowedRoles.includes(req.user.role)) {
            logUnauthorizedAccess(req, `Intento de acceso con rol no permitido (${req.user.role})`);
            res.status(403).json({ message: 'No tienes permisos para realizar esta acción.' });
            return;
        }
        logger.info(`✅ Usuario ${req.user.email} con rol ${req.user.role} accedió correctamente`);
        next();
    };
};

// ✅ Middleware para proteger contra ataques de fuerza bruta
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo de intentos de login por IP
    message: '⚠️ Demasiados intentos de acceso. Intenta nuevamente más tarde.',
    headers: true,
    handler: (req, res) => {
        logger.warn(`🚫 Demasiados intentos de login desde IP ${req.ip}`);
        res.status(429).json({ message: 'Demasiados intentos de acceso. Intenta nuevamente más tarde.' });
    }
});

// ✅ Función para revocar tokens (Logout seguro)
export const revokeToken = (token: string) => {
    blacklistedTokens.add(token);
    logger.info(`🔒 Token revocado`);
};

// ✅ Función para registrar accesos no autorizados
const logUnauthorizedAccess = (req: Request, reason: string) => {
    logger.warn(`❌ Acceso no autorizado desde ${req.ip} - Motivo: ${reason}`);
};
