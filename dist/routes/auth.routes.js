"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_validator_1 = require("express-validator");
const router = (0, express_1.Router)();
// 🔒 Protección contra ataques de fuerza bruta (Rate Limiting)
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo de intentos fallidos por IP
    message: "Demasiados intentos fallidos. Intenta más tarde.",
});
// 🔍 Middleware de validación de entrada
const validateLogin = [
    (0, express_validator_1.check)('email').isEmail().withMessage('Correo inválido').normalizeEmail(),
    (0, express_validator_1.check)('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];
// 🔄 Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return; // ✅ Asegura que la función se detiene después de enviar la respuesta
    }
    next();
};
// ✅ Rutas de autenticación con validaciones separadas
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, auth_controller_1.login);
router.post('/register', auth_controller_1.register);
exports.default = router;
