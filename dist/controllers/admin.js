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
exports.deleteUser = exports.updateUserRole = exports.getUsers = void 0;
const database_1 = require("../database");
// Obtener todos los usuarios
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield database_1.pool.query('SELECT id, email, username, role FROM users');
        res.status(200).json(response.rows);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.getUsers = getUsers;
// Cambiar rol de usuario
const updateUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, role } = req.body;
    const validRoles = ['usuario', 'cajero', 'mantenimiento', 'admin'];
    if (!validRoles.includes(role)) {
        res.status(400).json({ message: 'Rol no válido' });
        return;
    }
    try {
        const userExists = yield database_1.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userExists.rowCount === 0) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        yield database_1.pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
        res.status(200).json({ message: 'Rol actualizado correctamente' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.updateUserRole = updateUserRole;
// Eliminar usuario
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const userExists = yield database_1.pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userExists.rowCount === 0) {
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        yield database_1.pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.deleteUser = deleteUser;
