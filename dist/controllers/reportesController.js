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
Object.defineProperty(exports, "__esModule", { value: true });
exports.reporteTrabajadores = exports.reporteSituaciones = exports.reporteInstalaciones = void 0;
const database_1 = require("../database");
const express_validator_1 = require("express-validator");
// ✅ Función auxiliar para sanitizar entradas (evita ataques XSS)
const sanitizeInput = (input) => {
    return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};
// ✅ Función genérica para crear un reporte con validaciones
const crearReporte = (req, res, tipo) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 🛑 Validar errores de express-validator antes de continuar
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({ errors: errors.array() });
            return;
        }
        let { descripcion, ubicacion, prioridad } = req.body;
        const evidencia = req.file ? req.file.filename : null;
        // 🚀 Sanitizar los datos de entrada
        descripcion = sanitizeInput(descripcion);
        ubicacion = sanitizeInput(ubicacion);
        prioridad = sanitizeInput(prioridad);
        // 🛑 Validar que los campos no estén vacíos
        if (!descripcion.trim() || !ubicacion.trim() || !prioridad.trim()) {
            res.status(400).json({ message: 'Todos los campos son obligatorios' });
            return;
        }
        // 📌 Insertar el reporte en la base de datos de forma segura
        const result = yield database_1.pool.query('INSERT INTO reportes (tipo, descripcion, ubicacion, prioridad, evidencia, fecha) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id', [tipo, descripcion, ubicacion, prioridad, evidencia]);
        res.status(201).json({
            message: `Reporte de ${tipo} guardado con éxito`,
            reporteId: result.rows[0].id, // ✅ Devolver el ID del reporte
            evidencia
        });
    }
    catch (error) {
        console.error(`❌ Error al guardar el reporte de ${tipo}:`, error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
// ✅ Controladores específicos para cada tipo de reporte (sin `return`)
const reporteInstalaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield crearReporte(req, res, 'instalaciones');
});
exports.reporteInstalaciones = reporteInstalaciones;
const reporteSituaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield crearReporte(req, res, 'situaciones');
});
exports.reporteSituaciones = reporteSituaciones;
const reporteTrabajadores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield crearReporte(req, res, 'trabajadores');
});
exports.reporteTrabajadores = reporteTrabajadores;
