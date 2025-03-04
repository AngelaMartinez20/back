import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 📌 Verificar que la carpeta `uploads/` exista, si no, crearla
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configuración del almacenamiento
const storage = multer.diskStorage({
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
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  try {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // ✅ Archivo permitido
    } else {
      console.error("❌ Archivo rechazado:", file.mimetype);
      cb(null, false); // ✅ En lugar de pasar `Error`, pasamos `null, false`
    }
  } catch (error) {
    console.error("❌ Error en fileFilter:", error);
    cb(null, false); // ✅ Manejo seguro del error
  }
};

// ✅ Configuración final de `multer`
export const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 🔹 Limitar a 10MB
  fileFilter: fileFilter,
});
