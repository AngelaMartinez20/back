"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manejarErroresValidacion = exports.validarReporte = void 0;
const express_validator_1 = require("express-validator");
// ✅ Validaciones para el reporte
exports.validarReporte = [
    (0, express_validator_1.body)('descripcion')
        .trim()
        .isLength({ min: 5 })
        .withMessage('La descripción debe tener al menos 5 caracteres'),
    (0, express_validator_1.body)('ubicacion')
        .trim()
        .notEmpty()
        .withMessage('Ubicación es obligatoria'),
    (0, express_validator_1.body)('prioridad')
        .isIn(['Alta', 'Media', 'Baja'])
        .withMessage('Prioridad inválida')
];
// ✅ Middleware para manejar errores de validación
const manejarErroresValidacion = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() }); // ❌ No usar `return res.status(...)`
        return; // ✅ Se usa `return` para evitar que `next()` se ejecute
    }
    next(); // ✅ Solo se llama `next()` si no hay errores
};
exports.manejarErroresValidacion = manejarErroresValidacion;
