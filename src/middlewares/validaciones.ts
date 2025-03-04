import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// ✅ Validaciones para el reporte
export const validarReporte = [
  body('descripcion')
    .trim()
    .isLength({ min: 5 })
    .withMessage('La descripción debe tener al menos 5 caracteres'),
  body('ubicacion')
    .trim()
    .notEmpty()
    .withMessage('Ubicación es obligatoria'),
  body('prioridad')
    .isIn(['Alta', 'Media', 'Baja'])
    .withMessage('Prioridad inválida')
];

// ✅ Middleware para manejar errores de validación
export const manejarErroresValidacion = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() }); // ❌ No usar `return res.status(...)`
    return; // ✅ Se usa `return` para evitar que `next()` se ejecute
  }
  next(); // ✅ Solo se llama `next()` si no hay errores
};
