"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../controllers/admin");
const authenticateUser_1 = require("../middlewares/authenticateUser");
const router = (0, express_1.Router)();
router.get('/dashboard', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('admin'), (req, res) => {
    res.render('admin', { user: req.user });
});
router.get('/dashboard/data', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('admin'), (req, res) => {
    res.json({ message: 'Bienvenido al panel de administración', user: req.user });
});
// ✅ API para gestionar usuarios
router.get('/users', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('admin'), admin_1.getUsers);
// ✅ Ruta para actualizar el rol de un usuario
router.put('/users/role', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('admin'), admin_1.updateUserRole);
// ✅ Ruta para eliminar un usuario
router.delete('/users/:id', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('admin'), admin_1.deleteUser);
exports.default = router;
