"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./logger")); // Usa el mismo logger de Pino
// Morgan enviará logs a Pino
const stream = {
    write: (message) => logger_1.default.info(message.trim())
};
const morganMiddleware = (0, morgan_1.default)('dev', { stream });
exports.default = morganMiddleware;
