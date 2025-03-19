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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = require("../middlewares/multer");
const database_1 = require("../database");
const validaciones_1 = require("../middlewares/validaciones");
const authenticateUser_1 = require("../middlewares/authenticateUser");
const reportesController_1 = require("../controllers/reportesController");
const logger_1 = __importDefault(require("../logs/logger")); // Importar Pino
const router = express_1.default.Router();
// ✅ Obtener reportes de instalaciones (Solo usuarios autenticados con rol "mantenimiento")
router.get('/reportes/instalaciones', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('mantenimiento'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.pool.query('SELECT * FROM reportes WHERE tipo = $1 ORDER BY fecha DESC', ['instalaciones']);
        res.json(result.rows);
    }
    catch (error) {
        logger_1.default.error('❌ Error al obtener reportes:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}));
// ✅ Enviar reportes (Solo usuarios autenticados)
router.post('/reportes/instalaciones', authenticateUser_1.authenticateUser, multer_1.upload.single('evidencia'), validaciones_1.validarReporte, validaciones_1.manejarErroresValidacion, reportesController_1.reporteInstalaciones);
router.post('/reportes/situaciones', authenticateUser_1.authenticateUser, multer_1.upload.single('evidencia'), validaciones_1.validarReporte, validaciones_1.manejarErroresValidacion, reportesController_1.reporteSituaciones);
router.post('/reportes/trabajadores', authenticateUser_1.authenticateUser, multer_1.upload.single('evidencia'), validaciones_1.validarReporte, validaciones_1.manejarErroresValidacion, reportesController_1.reporteTrabajadores);
exports.default = router;
