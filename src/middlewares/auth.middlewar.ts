import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
        return res.status(403).json({ message: 'Acceso denegado' });
      }

      const decoded: any = jwt.verify(token, JWT_SECRET);

      if (!rolesPermitidos.includes(decoded.role)) {
        return res.status(403).json({ message: 'No tienes permisos para acceder a esta ruta' });
      }

      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  };
};
