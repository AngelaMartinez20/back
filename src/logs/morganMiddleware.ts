import morgan from 'morgan';
import logger from './logger'; // Usa el mismo logger de Pino

// Morgan enviará logs a Pino
const stream = {
  write: (message: string) => logger.info(message.trim())
};

const morganMiddleware = morgan('dev', { stream });

export default morganMiddleware;
