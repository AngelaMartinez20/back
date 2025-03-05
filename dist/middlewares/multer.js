"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
// 📌 Verificar que la carpeta `uploads/` exista, si no, crearla
const uploadDir = 'uploads/';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// ✅ Configuración del almacenamiento
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // 📌 Se asegura que `uploads/` existe
    },
    filename: (req, file, cb) => {
        // 🔹 Reemplazar caracteres peligrosos en el nombre del archivo
        const safeFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${Date.now()}-${safeFileName}`);
    },
});
// ✅ Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    try {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true); // ✅ Archivo permitido
        }
        else {
            console.error("❌ Archivo rechazado:", file.mimetype);
            cb(null, false); // ✅ En lugar de pasar `Error`, pasamos `null, false`
        }
    }
    catch (error) {
        console.error("❌ Error en fileFilter:", error);
        cb(null, false); // ✅ Manejo seguro del error
    }
};
// ✅ Configuración final de `multer`
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 🔹 Limitar a 10MB
    fileFilter: fileFilter,
});
