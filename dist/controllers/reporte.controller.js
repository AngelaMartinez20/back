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
exports.obtenerReportesInstalaciones = void 0;
const database_1 = require("../database");
// ✅ Controlador para obtener solo reportes de instalaciones
const obtenerReportesInstalaciones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT id, descripcion, ubicacion, prioridad, evidencia, fecha FROM reportes WHERE tipo = $1 ORDER BY fecha DESC', ['instalaciones']);
        res.status(200).json(response.rows);
    }
    catch (error) {
        console.error('Error al obtener reportes de instalaciones:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.obtenerReportesInstalaciones = obtenerReportesInstalaciones;
