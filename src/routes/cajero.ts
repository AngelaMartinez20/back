import express from 'express';
import { authenticateUser, authorizeRoles } from '../middlewares/authenticateUser';
import { registrarPago, obtenerPagos } from '../controllers/cajeroController'; // ✅ Verifica que esto no sea undefined

const router = express.Router();

// ✅ Solo los cajeros pueden registrar y ver pagos
router.post('/pagos', authenticateUser, authorizeRoles('cajero'), registrarPago);
router.get('/pagos', authenticateUser, authorizeRoles('cajero'), obtenerPagos);

export default router;
