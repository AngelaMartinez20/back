import { Request, Response } from 'express';
import { pool } from '../database';
import logger from '../logs/logger'; // Importar Pino


// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const response = await pool.query('SELECT id, email, username, role FROM users');
        logger.info('Lista de usuarios obtenida correctamente');
        res.status(200).json(response.rows);
    } catch (error) {
        logger.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Cambiar rol de usuario
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    const { id, role } = req.body;

    const validRoles = ['usuario', 'cajero', 'mantenimiento', 'admin'];
    if (!validRoles.includes(role)) {
        logger.warn(`Intento de asignar un rol inválido: ${role}`);
        res.status(400).json({ message: 'Rol no válido' });
        return;
    }

    try {
        const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userExists.rowCount === 0) {
            logger.warn(`Intento de cambiar rol a un usuario inexistente: ID ${id}`);
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
        logger.info(`Rol del usuario ${id} actualizado a ${role}`);
        res.status(200).json({ message: 'Rol actualizado correctamente' });
    } catch (error) {
        console.error(error);
        logger.error('Error al actualizar el rol del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Eliminar usuario
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userExists.rowCount === 0) {
            logger.warn(`Intento de eliminar un usuario inexistente: ID ${id}`);
            res.status(404).json({ message: 'Usuario no encontrado' });
            return;
        }

        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        logger.info(`Usuario ${id} eliminado correctamente`);
        res.status(200).json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error(error);
        logger.error('Error al eliminar usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
