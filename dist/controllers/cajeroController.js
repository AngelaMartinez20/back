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
exports.obtenerPagos = exports.registrarPago = void 0;
const database_1 = require("../database");
const registrarPago = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('📥 Datos recibidos:', req.body); // 🔍 Depuración
        const { nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido } = req.body;
        if (!nombre_cliente || !correo || !telefono || !metodo_pago || !monto) {
            console.error('❌ Faltan datos en la solicitud:', req.body);
            res.status(400).json({ message: 'Todos los campos son obligatorios.' });
            return;
        }
        if (metodo_pago !== 'efectivo' && metodo_pago !== 'tarjeta') {
            console.error('❌ Método de pago inválido:', metodo_pago);
            res.status(400).json({ message: 'El método de pago debe ser "efectivo" o "tarjeta".' });
            return;
        }
        let cambio = null;
        let montoRecibidoDB = null; // ✅ Para guardar `NULL` en la base de datos si es tarjeta
        if (metodo_pago === 'efectivo') {
            if (!monto_recibido || monto_recibido < monto) {
                console.error('❌ Monto recibido insuficiente:', monto_recibido);
                res.status(400).json({ message: 'El monto recibido debe ser mayor o igual al monto a pagar.' });
                return;
            }
            cambio = monto_recibido - monto;
            montoRecibidoDB = monto_recibido;
        }
        console.log('✅ Guardando en la base de datos...');
        const result = yield database_1.pool.query(`INSERT INTO pagos_gym (nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido, cambio) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido, cambio, fecha`, [nombre_cliente, correo, telefono, metodo_pago, monto, montoRecibidoDB, cambio]);
        console.log('✅ Pago registrado:', result.rows[0]);
        if (!result.rows[0].id) {
            console.error('❌ Error: La base de datos no devolvió un ID para el pago registrado.');
            res.status(500).json({ message: 'Error interno: No se pudo recuperar el ID del pago.' });
            return;
        }
        res.status(201).json({ message: 'Pago registrado con éxito', pago: result.rows[0] });
    }
    catch (error) {
        console.error('❌ Error en el servidor:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.registrarPago = registrarPago;
// ✅ Obtener todos los pagos registrados
const obtenerPagos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield database_1.pool.query('SELECT * FROM pagos_gym ORDER BY fecha DESC');
        res.json(result.rows);
    }
    catch (error) {
        console.error('❌ Error al obtener pagos:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.obtenerPagos = obtenerPagos;
