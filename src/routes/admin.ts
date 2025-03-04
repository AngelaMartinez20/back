import { Router, Request, Response } from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/admin';
import { authenticateUser, authorizeRoles } from '../middlewares/authenticateUser';

const router = Router();

router.get('/dashboard', authenticateUser, authorizeRoles('admin'), (req: Request, res: Response) => {
    res.render('admin', { user: req.user });
});

router.get('/dashboard/data', authenticateUser, authorizeRoles('admin'), (req: Request, res: Response) => {
    res.json({ message: 'Bienvenido al panel de administración', user: req.user });
});

// ✅ API para gestionar usuarios
router.get('/users', authenticateUser, authorizeRoles('admin'), getUsers);

// ✅ Ruta para actualizar el rol de un usuario
router.put('/users/role', authenticateUser, authorizeRoles('admin'), updateUserRole);

// ✅ Ruta para eliminar un usuario
router.delete('/users/:id', authenticateUser, authorizeRoles('admin'), deleteUser);

export default router;
