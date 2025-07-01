import fs from 'fs';
import path from 'path';

const logPath = path.join(process.cwd(), 'logs', 'historial.log');
const csvPath = path.join(process.cwd(), 'logs', 'historial.csv');

const lines = fs.readFileSync(logPath, 'utf-8').split('\n').filter(Boolean);

const rows = lines.map(line => {
  try {
    const log = JSON.parse(line);
    return {
      time: new Date(log.time).toISOString(),
      level: log.level,
      msg: log.msg || '',
      pid: log.pid,
      hostname: log.hostname || '',
      module: log.module || '',
      user: log.user || ''
    };
  } catch (err) {
    console.error('❌ Línea no válida:', line);
    return null;
  }
}).filter(Boolean);

// Crear encabezado CSV
const headers = ['time', 'level', 'msg', 'pid', 'hostname', 'module', 'user'];
const csv = [
  headers.join(','), // encabezado
  ...rows.map(row => headers.map(field => `"${(row as any)[field] ?? ''}"`).join(','))
].join('\n');

// Guardar como CSV
fs.writeFileSync(csvPath, csv);
console.log('✅ Logs convertidos a CSV:', csvPath);
