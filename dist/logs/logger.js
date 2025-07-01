"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pino_1 = __importDefault(require("pino"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const isProduction = process.env.NODE_ENV === 'production';
const targets = [
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
    const logDirectory = path_1.default.join(process.cwd(), 'logs');
    if (!fs_1.default.existsSync(logDirectory)) {
        fs_1.default.mkdirSync(logDirectory);
    }
    targets.push({
        target: 'pino/file',
        options: {
            destination: path_1.default.join(logDirectory, 'historial.log'),
            mkdir: true
        },
        level: 'info'
    });
}
const logger = (0, pino_1.default)({
    transport: {
        targets
    },
    level: 'info'
});
exports.default = logger;
