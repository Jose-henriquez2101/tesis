const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- 1. CONFIGURACIÓN DEL ALMACENAMIENTO ---
const storage = multer.diskStorage({
    // Define la carpeta de destino para el archivo
    destination: (req, file, cb) => {
        // Usa la ruta relativa a donde Multer se está ejecutando (la raíz del proyecto backend)
        const uploadPath = path.join(__dirname, '..', 'assets', 'bomberos');
        
        // Opcional: Asegurarse de que el directorio exista
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    
    // Define el nombre del archivo
    filename: (req, file, cb) => {
        // Usaremos el ID del bombero (si está disponible en el body o params) + timestamp + extensión original
        // Esto asegura que la foto siempre tendrá un nombre único
        const ext = path.extname(file.originalname);
        const bomberoId = req.params.bomberoId || 'temp'; // Si no viene ID, usa 'temp'
        const uniqueName = `bombero-${bomberoId}-${Date.now()}${ext}`;
        cb(null, uniqueName);
    }
});

// --- 2. FILTRO DE ARCHIVOS (Opcional) ---
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/webp') {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no soportado. Solo se permiten JPEG, PNG y WebP.'), false);
    }
};

// --- 3. CREACIÓN DE LA INSTANCIA DE MULTER ---
const uploadPhoto = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 60 // Límite de 60MB
    }
});

module.exports = uploadPhoto;