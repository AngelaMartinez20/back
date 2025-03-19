import { Request, Response } from 'express';
import { pool } from '../database';
import logger from '../logs/logger'; // Importar Pino


export const registrarPago = async (req: Request, res: Response): Promise<void> => {
  try {
      logger.info('📥 Datos recibidos en registrarPago', { body: req.body });

      const { nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido } = req.body;

      if (!nombre_cliente || !correo || !telefono || !metodo_pago || !monto) {
          logger.warn('❌ Faltan datos en la solicitud', { body: req.body });
          res.status(400).json({ message: 'Todos los campos son obligatorios.' });
          return;
      }

      if (metodo_pago !== 'efectivo' && metodo_pago !== 'tarjeta') {
          logger.warn(`❌ Método de pago inválido: ${metodo_pago}`);
          res.status(400).json({ message: 'El método de pago debe ser "efectivo" o "tarjeta".' });
          return;
      }

      let cambio = null;
      let montoRecibidoDB = null;

      if (metodo_pago === 'efectivo') {
          if (!monto_recibido || monto_recibido < monto) {
              logger.warn('❌ Monto recibido insuficiente', { monto_recibido });
              res.status(400).json({ message: 'El monto recibido debe ser mayor o igual al monto a pagar.' });
              return;
          }
          cambio = monto_recibido - monto;
          montoRecibidoDB = monto_recibido;
      }

      logger.info('✅ Guardando en la base de datos...');

      const result = await pool.query(
          `INSERT INTO pagos_gym (nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido, cambio) 
          VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING id, nombre_cliente, correo, telefono, metodo_pago, monto, monto_recibido, cambio, fecha`,
          [nombre_cliente, correo, telefono, metodo_pago, monto, montoRecibidoDB, cambio]
      );

      if (!result.rows[0]) {
          logger.error('❌ Error: No se pudo recuperar el pago registrado.');
          res.status(500).json({ message: 'Error interno: No se pudo recuperar el pago registrado.' });
          return;
      }

      logger.info('✅ Pago registrado correctamente', { pago: result.rows[0] });
      res.status(201).json({ message: 'Pago registrado con éxito', pago: result.rows[0] });

  } catch (error: any) {
      logger.error('❌ Error en el servidor:', { message: error.message, stack: error.stack });
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};

// ✅ Obtener todos los pagos registrados con mejor manejo de errores
export const obtenerPagos = async (req: Request, res: Response): Promise<void> => {
  try {
      logger.info('📤 Solicitando lista de pagos...');
      const result = await pool.query('SELECT * FROM pagos_gym ORDER BY fecha DESC');

      if (!result.rows.length) {
          logger.warn('⚠️ No hay pagos registrados en la base de datos.');
          res.status(404).json({ message: 'No hay pagos registrados' });
          return;
      }

      logger.info('✅ Lista de pagos obtenida con éxito.');
      res.json(result.rows);
  } catch (error: any) {
      logger.error('❌ Error al obtener pagos:', { message: error.message, stack: error.stack });
      res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
