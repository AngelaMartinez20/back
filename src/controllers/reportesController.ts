import { Request, Response } from 'express';
import { pool } from '../database';
import { validationResult } from 'express-validator';
import logger from '../logs/logger'; // Importar Pino


// ✅ Función auxiliar para sanitizar entradas (evita ataques XSS)
const sanitizeInput = (input: string): string => {
  return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

// ✅ Función genérica para crear un reporte con validaciones
const crearReporte = async (req: Request, res: Response, tipo: string): Promise<void> => {
  try {
    logger.info(`📥 Recibiendo solicitud para reporte de ${tipo}`, { body: req.body });

    // 🛑 Validar errores de express-validator antes de continuar
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.warn(`❌ Errores de validación en reporte de ${tipo}`, { errors: errors.array() });
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
      logger.warn(`❌ Campos vacíos en reporte de ${tipo}`);
      res.status(400).json({ message: 'Todos los campos son obligatorios' });
      return;
    }

    // 📌 Insertar el reporte en la base de datos de forma segura
    logger.info(`📤 Guardando reporte de ${tipo} en la base de datos...`);
    const result = await pool.query(
      'INSERT INTO reportes (tipo, descripcion, ubicacion, prioridad, evidencia, fecha) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id',
      [tipo, descripcion, ubicacion, prioridad, evidencia]
    );

    logger.info(`✅ Reporte de ${tipo} guardado con éxito`, { reporteId: result.rows[0].id });

    res.status(201).json({
      message: `Reporte de ${tipo} guardado con éxito`,
      reporteId: result.rows[0].id, // ✅ Devolver el ID del reporte
      evidencia
    });
  } catch (error) {
    logger.error(`❌ Error al guardar el reporte de ${tipo}:`, error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// ✅ Controladores específicos para cada tipo de reporte (sin `return`)
export const reporteInstalaciones = async (req: Request, res: Response): Promise<void> => {
  await crearReporte(req, res, 'instalaciones');
};

export const reporteSituaciones = async (req: Request, res: Response): Promise<void> => {
  await crearReporte(req, res, 'situaciones');
};

export const reporteTrabajadores = async (req: Request, res: Response): Promise<void> => {
  await crearReporte(req, res, 'trabajadores');
};
