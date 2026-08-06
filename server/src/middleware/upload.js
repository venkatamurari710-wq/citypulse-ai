// server/src/middleware/upload.js — Multer File Upload Configuration
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4'],
  document: ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'],
};

const ALL_ALLOWED = Object.values(ALLOWED_MIME_TYPES).flat();
const MAX_SIZE = parseInt(env.MAX_FILE_SIZE_MB || '25') * 1024 * 1024;

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/\.{2,}/g, '_');
}

const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const random = crypto.randomBytes(16).toString('hex');
    const sanitized = sanitizeFilename(path.basename(file.originalname, ext));
    cb(null, `${Date.now()}_${random}_${sanitized}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (ALL_ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed`), false);
  }
}

export const upload = multer({
  storage: diskStorage,
  limits: { fileSize: MAX_SIZE, files: 10 },
  fileFilter,
});

export function getFileType(mimetype) {
  for (const [type, mimes] of Object.entries(ALLOWED_MIME_TYPES)) {
    if (mimes.includes(mimetype)) return type;
  }
  return 'document';
}
