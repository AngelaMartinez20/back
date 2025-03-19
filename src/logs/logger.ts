import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

let logFilePath: string | undefined = undefined;

// 📌 Usar `import()` dinámico solo en Node.js para evitar problemas en Vite
if (typeof process !== 'undefined' && !isProduction) {
  import('path').then((path) => {
    logFilePath = path.join(__dirname, 'historial.log');
  });
}

// 📌 Configurar el logger con transporte dual (archivo + consola)
const logger = pino({
  transport: {
    targets: [
      {
        target: 'pino-pretty', // 📺 Formato bonito en consola
        options: { colorize: true, translateTime: 'HH:MM:ss Z' }
      },
      ...(logFilePath ? [{ // 📂 Guardar logs en un archivo solo si NO es producción
        target: 'pino/file',
        options: { destination: logFilePath, mkdir: true }
      }] : [])
    ]
  },
  level: 'info' // 📌 Puedes cambiar a 'debug' en desarrollo si necesitas más detalles
});

export default logger;
