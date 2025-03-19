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
exports.register = exports.login = void 0;
const database_1 = require("../database");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = __importDefault(require("../logs/logger"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('Falta configurar JWT_SECRET en el archivo .env');
}
// Mapa para almacenar intentos de login fallidos
const loginAttempts = new Map();
// Función para verificar intentos fallidos
const checkLoginAttempts = (email) => __awaiter(void 0, void 0, void 0, function* () {
    if (!loginAttempts.has(email))
        return false;
    const { count, lastAttempt } = loginAttempts.get(email);
    const timePassed = Date.now() - lastAttempt;
    if (count >= 5 && timePassed < 15 * 60 * 1000) {
        return true; // Bloqueo activo (15 minutos)
    }
    if (timePassed > 15 * 60 * 1000) {
        loginAttempts.delete(email); // Restablecer intentos después de 15 minutos
    }
    return false;
});
// Login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Verifica que los campos no sean undefined o vacíos
        if (!email || !password) {
            logger_1.default.warn('Intento de login con datos incompletos');
            res.status(400).json({ message: 'Email y contraseña son obligatorios' });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();
        // Verificar si el usuario tiene intentos bloqueados
        if (yield checkLoginAttempts(normalizedEmail)) {
            logger_1.default.warn(`Cuenta bloqueada por intentos fallidos: ${normalizedEmail}`);
            res.status(429).json({ message: 'Cuenta bloqueada por intentos fallidos. Intenta más tarde.' });
            return;
        }
        // Consulta a la base de datos para verificar si el usuario existe
        const response = yield database_1.pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (response.rows.length === 0) {
            logger_1.default.warn(`Intento de login con correo inexistente: ${normalizedEmail}`);
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }
        const user = response.rows[0];
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            // Registrar intento fallido
            const attempts = loginAttempts.get(normalizedEmail) || { count: 0, lastAttempt: Date.now() };
            loginAttempts.set(normalizedEmail, { count: attempts.count + 1, lastAttempt: Date.now() });
            logger_1.default.warn(`Intento de login fallido para ${normalizedEmail} - Intento #${attempts.count + 1}`);
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }
        // Si el login es exitoso, restablecer intentos fallidos
        loginAttempts.delete(normalizedEmail);
        // Generación del token JWT
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' } // Token válido por 1 hora
        );
        logger_1.default.info(`Inicio de sesión exitoso para ${normalizedEmail}`);
        // Respuesta con el token y los datos del usuario
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
        });
    }
    catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.login = login;
// Registro
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, username, password } = req.body;
    try {
        // Validar campos
        if (!email || !username || !password) {
            logger_1.default.warn('Intento de registro con datos incompletos');
            res.status(400).json({ message: 'Todos los campos son obligatorios' });
            return;
        }
        email = email.trim().toLowerCase();
        username = username.trim();
        // Validar longitud de la contraseña
        if (password.length < 6) {
            logger_1.default.warn(`Registro fallido: contraseña demasiado corta para ${email}`);
            res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }
        // Verificar si el usuario ya existe
        const userExists = yield database_1.pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            logger_1.default.warn(`Intento de registro con correo ya existente: ${email}`);
            res.status(400).json({ message: 'El correo ya está registrado' });
            return;
        }
        // Hashear la contraseña antes de guardarla
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Insertar usuario en la base de datos
        yield database_1.pool.query('INSERT INTO users (email, username, password, role) VALUES ($1, $2, $3, $4)', [email, username, hashedPassword, 'usuario'] // Asignamos rol "usuario" por defecto
        );
        logger_1.default.info(`Nuevo usuario registrado: ${email}`);
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});
exports.register = register;
