const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Usamos memoryStorage porque guardaremos el audio en la base de datos (BLOB)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept common audio mime types
  const allowed = [
    'audio/mpeg', // mp3
    'audio/wav',
    'audio/webm',
    'audio/ogg',
    'audio/x-wav',
    'audio/mp3'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no soportado. Solo se permiten archivos de audio.'), false);
  }
};

const uploadAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 10 // 10MB
  }
});

module.exports = uploadAudio;
