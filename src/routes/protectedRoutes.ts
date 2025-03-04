import express from 'express';
import { authenticateUser, authorizeRoles } from '../middlewares/authenticateUser';

const router = express.Router();

// 🔹 Ruta protegida accesible para cualquier usuario autenticado
router.get('/dashboard', authenticateUser, (req, res) => {
    res.json({ message: 'Bienvenido al Dashboard', user: req.user });
});

// 🔹 Ruta protegida solo para administradores
router.get('/admin', authenticateUser, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Bienvenido al Panel de Administrador' });
});

// 🔹 Ruta protegida solo para cajeros
router.get('/cajero', authenticateUser, authorizeRoles('cajero'), (req, res) => {
    res.json({ message: 'Bienvenido al Panel de Cajero' });
});

// 🔹 Ruta protegida solo para mantenimiento
router.get('/mantenimiento', authenticateUser, authorizeRoles('mantenimiento'), (req, res) => {
    res.json({ message: 'Bienvenido al Panel de Mantenimiento' });
});

export default router;
 