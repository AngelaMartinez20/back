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
exports.obtenerPagos = exports.registrarPago = void 0;
const database_1 = require("../database");
const logger_1 = __importDefault(require("../logs/logger")); // Importar Pino
const registrarPago = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('📥 Datos recibidos en registrarPago', { body: req.body });
        const { nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido } = req.body;
        if (!nombre_cliente || !correo || !telefono || !metodo_pago || !monto) {
            logger_1.default.warn('❌ Faltan datos en la solicitud', { body: req.body });
            res.status(400).json({ message: 'Todos los campos son obligatorios.' });
            return;
        }
        if (metodo_pago !== 'efectivo' && metodo_pago !== 'tarjeta') {
            logger_1.default.warn(`❌ Método de pago inválido: ${metodo_pago}`);
            res.status(400).json({ message: 'El método de pago debe ser "efectivo" o "tarjeta".' });
            return;
        }
        let cambio = null;
        let montoRecibidoDB = null;
        if (metodo_pago === 'efectivo') {
            if (!monto_recibido || monto_recibido < monto) {
                logger_1.default.warn('❌ Monto recibido insuficiente', { monto_recibido });
                res.status(400).json({ message: 'El monto recibido debe ser mayor o igual al monto a pagar.' });
                return;
            }
            cambio = monto_recibido - monto;
            montoRecibidoDB = monto_recibido;
        }
        logger_1.default.info('✅ Guardando en la base de datos...');
        const result = yield database_1.pool.query(`INSERT INTO pagos_gym (nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido, cambio) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING id, nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido, cambio, fecha`, [nombre_cliente, correo, telefono, metodo_pago, monto, montoRecibidoDB, cambio]);
        if (!result.rows[0]) {
            logger_1.default.error('❌ Error: No se pudo recuperar el pago registrado.');
            res.status(500).json({ message: 'Error interno: No se pudo recuperar el pago registrado.' });
            return;
        }
        logger_1.default.info('✅ Pago registrado correctamente', { pago: result.rows[0] });
        res.status(201).json({ message: 'Pago registrado con éxito', pago: result.rows[0] });
    }
    catch (error) {
        logger_1.default.error('❌ Error en el servidor:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});
exports.registrarPago = registrarPago;
// ✅ Obtener todos los pagos registrados con mejor manejo de errores
const obtenerPagos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('📤 Solicitando lista de pagos...');
        const result = yield database_1.pool.query('SELECT * FROM pagos_gym ORDER BY fecha DESC');
        if (!result.rows.length) {
            logger_1.default.warn('⚠️ No hay pagos registrados en la base de datos.');
            res.status(404).json({ message: 'No hay pagos registrados' });
            return;
        }
        logger_1.default.info('✅ Lista de pagos obtenida con éxito.');
        res.json(result.rows);
    }
    catch (error) {
        logger_1.default.error('❌ Error al obtener pagos:', { message: error.message, stack: error.stack });
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
});
exports.obtenerPagos = obtenerPagos;
