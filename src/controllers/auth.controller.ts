import { Request, Response } from 'express';
import { pool } from '../database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import logger from '../logs/logger';


// Definir estructura del usuario
interface User {
    id: number;
    email: string;
    username: string;
    password: string;
    role: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('Falta configurar JWT_SECRET en el archivo .env');
}

// Mapa para almacenar intentos de login fallidos
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Función para verificar intentos fallidos
const checkLoginAttempts = async (email: string): Promise<boolean> => {
    if (!loginAttempts.has(email)) return false;

    const { count, lastAttempt } = loginAttempts.get(email)!;
    const timePassed = Date.now() - lastAttempt;

    if (count >= 5 && timePassed < 15 * 60 * 1000) {
        return true; // Bloqueo activo (15 minutos)
    }

    if (timePassed > 15 * 60 * 1000) {
        loginAttempts.delete(email); // Restablecer intentos después de 15 minutos
    }

    return false;
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Verifica que los campos no sean undefined o vacíos
        if (!email || !password) {
            logger.warn('Intento de login con datos incompletos');
            res.status(400).json({ message: 'Email y contraseña son obligatorios' });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Verificar si el usuario tiene intentos bloqueados
        if (await checkLoginAttempts(normalizedEmail)) {
            logger.warn(`Cuenta bloqueada por intentos fallidos: ${normalizedEmail}`);
            res.status(429).json({ message: 'Cuenta bloqueada por intentos fallidos. Intenta más tarde.' });
            return;
        }

        // Consulta a la base de datos para verificar si el usuario existe
        const response = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        if (response.rows.length === 0) {
            logger.warn(`Intento de login con correo inexistente: ${normalizedEmail}`);
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        const user = response.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            // Registrar intento fallido
            const attempts = loginAttempts.get(normalizedEmail) || { count: 0, lastAttempt: Date.now() };
            loginAttempts.set(normalizedEmail, { count: attempts.count + 1, lastAttempt: Date.now() });

            logger.warn(`Intento de login fallido para ${normalizedEmail} - Intento #${attempts.count + 1}`);
            res.status(401).json({ message: 'Credenciales inválidas' });
            return;
        }

        // Si el login es exitoso, restablecer intentos fallidos
        loginAttempts.delete(normalizedEmail);

        // Generación del token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET as string,
            { expiresIn: '1h' }  // Token válido por 1 hora
        );

        logger.info(`Inicio de sesión exitoso para ${normalizedEmail}`);

        // Respuesta con el token y los datos del usuario
        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            user: { id: user.id, email: user.email, username: user.username, role: user.role },
        });
    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Registro
export const register = async (req: Request, res: Response): Promise<void> => {
    let { email, username, password } = req.body;

    try {
        // Validar campos
        if (!email || !username || !password) {
            logger.warn('Intento de registro con datos incompletos');
            res.status(400).json({ message: 'Todos los campos son obligatorios' });
            return;
        }

        email = email.trim().toLowerCase();
        username = username.trim();

        // Validar longitud de la contraseña
        if (password.length < 6) {
            logger.warn(`Registro fallido: contraseña demasiado corta para ${email}`);
            res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        // Verificar si el usuario ya existe
        const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            logger.warn(`Intento de registro con correo ya existente: ${email}`);
            res.status(400).json({ message: 'El correo ya está registrado' });
            return;
        }

        // Hashear la contraseña antes de guardarla
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertar usuario en la base de datos
        await pool.query(
            'INSERT INTO users (email, username, password, role) VALUES ($1, $2, $3, $4)',
            [email, username, hashedPassword, 'usuario']  // Asignamos rol "usuario" por defecto
        );

        logger.info(`Nuevo usuario registrado: ${email}`);
        res.status(201).json({ message: 'Usuario registrado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
