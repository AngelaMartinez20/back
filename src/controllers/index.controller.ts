import { Request, Response } from 'express';
import { pool } from '../database';
import { QueryResult } from 'pg';
import logger from '../logs/logger'; // Importar Pino


export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        logger.info('📥 Solicitando lista de usuarios...');
        const response: QueryResult = await pool.query('SELECT id, email, username FROM users ORDER BY id ASC');
        logger.info('✅ Lista de usuarios obtenida con éxito.');
        res.status(200).json(response.rows);
    } catch (e) {
        logger.error('❌ Error al obtener usuarios:', e);
        res.status(500).json('Internal Server error');
    }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            logger.warn('❌ Formato de ID inválido:', { id: req.params.id });
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }

        const response: QueryResult = await pool.query(
            'SELECT id, email, username FROM users WHERE id = $1',
            [id]
        );

        if (response.rows.length === 0) {
            logger.warn(`❌ Usuario no encontrado con ID: ${id}`);
            res.status(404).json({ message: 'User not found' });
        } else {
            logger.info(`✅ Usuario obtenido: ${id}`);
            res.status(200).json(response.rows[0]);
        }
    } catch (e) {
        logger.error('❌ Error al obtener usuario:', e);
        res.status(500).json('Internal Server error');
    }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            logger.warn('❌ Faltan campos en la solicitud:', { email, username });
            res.status(400).json({ message: 'Missing required fields: email, username, password' });
            return;
        }

        await pool.query(
            'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)',
            [email, username, password]
        );

        logger.info(`✅ Usuario registrado: ${email}`);
        res.status(201).json({
            message: 'User added successfully',
            body: { email, username }
        });
    } catch (e) {
        logger.error('❌ Error al registrar usuario:', e);
        res.status(500).json('Internal Server error');
    }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);
        const { email, username, password } = req.body;

        if (isNaN(id)) {
            logger.warn('❌ Formato de ID inválido:', { id: req.params.id });
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }

        if (!email || !username || !password) {
            logger.warn('❌ Faltan campos en la actualización de usuario:', { id, email, username });
            res.status(400).json({ message: 'Missing required fields: email, username, password' });
            return;
        }

        const response: QueryResult = await pool.query(
            'UPDATE users SET email = $1, username = $2, password = $3 WHERE id = $4 RETURNING *',
            [email, username, password, id]
        );

        if (response.rows.length === 0) {
            logger.warn(`❌ Usuario no encontrado para actualización: ${id}`);
            res.status(404).json({ message: 'User not found' });
        } else {
            logger.info(`✅ Usuario actualizado: ${id}`);
            res.status(200).json({ message: 'User updated successfully', body: response.rows[0] });
        }
    } catch (e) {
        logger.error('❌ Error al actualizar usuario:', e);
        res.status(500).json('Internal Server error');
    }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = parseInt(req.params.id);

        if (isNaN(id)) {
            logger.warn('❌ Formato de ID inválido:', { id: req.params.id });
            res.status(400).json({ message: 'Invalid ID format' });
            return;
        }

        const response: QueryResult = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );

        if (response.rows.length === 0) {
            logger.warn(`❌ Usuario no encontrado para eliminación: ${id}`);
            res.status(404).json({ message: 'User not found' });
        } else {
            logger.info(`✅ Usuario eliminado: ${id}`);
            res.status(200).json({ message: `User ${id} deleted successfully` });
        }
    } catch (e) {
        logger.error('❌ Error al eliminar usuario:', e);
        res.status(500).json('Internal Server error');
    }
};
