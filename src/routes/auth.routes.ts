import { Router, Request, Response, NextFunction } from 'express';
import { login, register } from '../controllers/auth.controller';
import rateLimit from 'express-rate-limit';
import { check, validationResult } from 'express-validator';

const router = Router();

// 🔒 Protección contra ataques de fuerza bruta (Rate Limiting)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // Máximo de intentos fallidos por IP
  message: "Demasiados intentos fallidos. Intenta más tarde.",
});

// 🔍 Middleware de validación de entrada
const validateLogin = [
  check('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
  check('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

// 🔄 Middleware para manejar errores de validación
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return; // ✅ Asegura que la función se detiene después de enviar la respuesta
  }
  next();
};

// ✅ Rutas de autenticación con validaciones separadas
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, login);
router.post('/register', register);

export default router;
