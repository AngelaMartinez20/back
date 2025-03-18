import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../logs/logger'; // Importar Pino


const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Falta configurar JWT_SECRET en el archivo .env');
}

// ✅ Middleware para verificar roles
export const verificarRol = (rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        logger.warn('🚫 Acceso denegado: No se proporcionó un token');
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      const decoded: any = jwt.verify(token, JWT_SECRET);

      if (!rolesPermitidos.includes(decoded.role)) {
        logger.warn(`🚫 Acceso denegado: El rol '${decoded.role}' no tiene permiso para esta ruta`);
        return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
      }

      req.user = decoded;
      logger.info(`✅ Acceso permitido para usuario ${decoded.email} con rol ${decoded.role}`);
      next();
    } catch (error) {
      logger.error('❌ Token inválido o error en la verificación:', error);
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};
