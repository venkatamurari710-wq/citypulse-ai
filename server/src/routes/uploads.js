// server/src/routes/uploads.js
import { Router } from 'express';
import { uploadFiles, getUpload, deleteUpload } from '../controllers/uploads.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

export const uploadRoutes = Router();

uploadRoutes.post('/', authenticate, upload.array('files', 10), uploadFiles);
uploadRoutes.get('/:id', authenticate, getUpload);
uploadRoutes.delete('/:id', authenticate, deleteUpload);
