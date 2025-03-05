"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authenticateUser_1 = require("../middlewares/authenticateUser");
const cajeroController_1 = require("../controllers/cajeroController"); // ✅ Verifica que esto no sea undefined
const router = express_1.default.Router();
// ✅ Solo los cajeros pueden registrar y ver pagos
router.post('/pagos', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('cajero'), cajeroController_1.registrarPago);
router.get('/pagos', authenticateUser_1.authenticateUser, (0, authenticateUser_1.authorizeRoles)('cajero'), cajeroController_1.obtenerPagos);
exports.default = router;
