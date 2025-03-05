"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateUser_1 = require("../middlewares/authenticateUser");
const router = express_1.default.Router();
// 🔹 Ruta protegida accesible para cualquier usuario autenticado
router.get('/dashboard', authenticateUser_1.authenticateUser, (req, res) => {
    res.json({ message: 'Bienvenido al Dashboard', user: req.user });
});
// 🔹 Ruta protegida solo para administradores
router.get('/admin', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('admin'), (req, res) => {
    res.json({ message: 'Bienvenido al Panel de Administrador' });
});
// 🔹 Ruta protegida solo para cajeros
router.get('/cajero', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('cajero'), (req, res) => {
    res.json({ message: 'Bienvenido al Panel de Cajero' });
});
// 🔹 Ruta protegida solo para mantenimiento
router.get('/mantenimiento', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('mantenimiento'), (req, res) => {
    res.json({ message: 'Bienvenido al Panel de Mantenimiento' });
});
exports.default = router;
