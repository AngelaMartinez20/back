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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const database_1 = require("../database");
const logger_1 = __importDefault(require("../logs/logger")); // Importar Pino
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        logger_1.default.info('📥 Solicitando lista de usuarios...');
        const response = yield database_1.pool.query('SELECT id, email, username FROM users ORDER BY id ASC');
        logger_1.default.info('✅ Lista de usuarios obtenida con éxito.');
        res.status(200).json(response.rows);
    }
    catch (e) {
        logger_1.default.error('❌ Error al obtener usuarios:', e);
        res.status(500).json('Internal Server error');
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            logger_1.default.warn('❌ Formato de ID inválido:', { id: req.params.id });
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }
        const response = yield database_1.pool.query('SELECT id, email, username FROM users WHERE id = $1', [id]);
        if (response.rows.length === 0) {
            logger_1.default.warn(`❌ Usuario no encontrado con ID: ${id}`);
            res.status(404).json({ message: 'User not found' });
        }
        else {
            logger_1.default.info(`✅ Usuario obtenido: ${id}`);
            res.status(200).json(response.rows[0]);
        }
    }
    catch (e) {
        logger_1.default.error('❌ Error al obtener usuario:', e);
        res.status(500).json('Internal Server error');
    }
});
exports.getUserById = getUserById;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            logger_1.default.warn('❌ Faltan campos en la solicitud:', { email, username });
            res.status(400).json({ message: 'Missing required fields: email, username, password' });
            return;
        }
        yield database_1.pool.query('INSERT INTO users (email, username, password) VALUES ($1, $2, $3)', [email, username, password]);
        logger_1.default.info(`✅ Usuario registrado: ${email}`);
        res.status(201).json({
            message: 'User added successfully',
            body: { email, username }
        });
    }
    catch (e) {
        logger_1.default.error('❌ Error al registrar usuario:', e);
        res.status(500).json('Internal Server error');
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const { email, username, password } = req.body;
        if (isNaN(id)) {
            logger_1.default.warn('❌ Formato de ID inválido:', { id: req.params.id });
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }
        if (!email || !username || !password) {
            logger_1.default.warn('❌ Faltan campos en la actualización de usuario:', { id, email, username });
            res.status(400).json({ message: 'Missing required fields: email, username, password' });
            return;
        }
        const response = yield database_1.pool.query('UPDATE users SET email = $1, username = $2, password = $3 WHERE id = $4 RETURNING *', [email, username, password, id]);
        if (response.rows.length === 0) {
            logger_1.default.warn(`❌ Usuario no encontrado para actualización: ${id}`);
            res.status(404).json({ message: 'User not found' });
        }
        else {
            logger_1.default.info(`✅ Usuario actualizado: ${id}`);
            res.status(200).json({ message: 'User updated successfully', body: response.rows[0] });
        }
    }
    catch (e) {
        logger_1.default.error('❌ Error al actualizar usuario:', e);
        res.status(500).json('Internal Server error');
    }
});
exports.updateUser = updateUser;
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            logger_1.default.warn('❌ Formato de ID inválido:', { id: req.params.id });
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }
        const response = yield database_1.pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (response.rows.length === 0) {
            logger_1.default.warn(`❌ Usuario no encontrado para eliminación: ${id}`);
            res.status(404).json({ message: 'User not found' });
        }
        else {
            logger_1.default.info(`✅ Usuario eliminado: ${id}`);
            res.status(200).json({ message: `User ${id} deleted successfully` });
        }
    }
    catch (e) {
        logger_1.default.error('❌ Error al eliminar usuario:', e);
        res.status(500).json('Internal Server error');
    }
});
exports.deleteUser = deleteUser;
