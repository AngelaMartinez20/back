import pino from 'pino';
import path from 'path';
import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production';

const targets: pino.TransportTargetOptions[] = [
  {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z'
    },
    level: 'info'
  }
];

if (!isProduction) {
  // Solo en desarrollo, guardamos en archivo
  const logDirectory = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
  }

  targets.push({
    target: 'pino/file',
    options: {
        destination: path.join(logDirectory, 'historial.log'),
        mkdir: true
    },
    level: 'info'
  });
}

const logger = pino({
  transport: {
    targets
  },
  level: 'info'
});

export default logger;
