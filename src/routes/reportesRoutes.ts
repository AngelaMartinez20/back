import express from 'express';
import { upload } from '../middlewares/multer';
import { pool } from '../database';
import { validarReporte, manejarErroresValidacion } from '../middlewares/validaciones';
import { authenticateUser, authorizeRoles } from '../middlewares/authenticateUser';
import { reporteInstalaciones, reporteSituaciones, reporteTrabajadores } from '../controllers/reportesController';
import logger from '../logs/logger'; // Importar Pino


const router = express.Router();

// ✅ Obtener reportes de instalaciones (Solo usuarios autenticados con rol "mantenimiento")
router.get('/reportes/instalaciones', authenticateUser, authorizeRoles('mantenimiento'), async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reportes WHERE tipo = $1 ORDER BY fecha DESC', ['instalaciones']);
    res.json(result.rows);
  } catch (error) {
    logger.error('❌ Error al obtener reportes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// ✅ Enviar reportes (Solo usuarios autenticados)
router.post('/reportes/instalaciones', authenticateUser, upload.single('evidencia'), validarReporte, manejarErroresValidacion, reporteInstalaciones);
router.post('/reportes/situaciones', authenticateUser, upload.single('evidencia'), validarReporte, manejarErroresValidacion, reporteSituaciones);
router.post('/reportes/trabajadores', authenticateUser, upload.single('evidencia'), validarReporte, manejarErroresValidacion, reporteTrabajadores);

export default router;
