// server/src/controllers/uploads.js
import { supabase } from '../config/supabase.js';
import { createError } from '../middleware/errorHandler.js';
import { getFileType } from '../middleware/upload.js';
import fs from 'fs';

export async function uploadFiles(req, res, next) {
  try {
    if (!req.files || req.files.length === 0) {
      return next(createError(400, 'No files provided'));
    }

    const { complaint_id } = req.body;
    const uploads = [];

    for (const file of req.files) {
      const fileType = getFileType(file.mimetype);
      const { data, error } = await supabase
        .from('uploads')
        .insert({
          complaint_id: complaint_id || null,
          user_id: req.user.id,
          file_name: file.originalname,
          file_type: fileType,
          mime_type: file.mimetype,
          file_size: file.size,
          storage_path: file.path,
        })
        .select()
        .single();

      if (!error) uploads.push(data);
    }

    res.status(201).json({ uploads });
  } catch (err) { next(err); }
}

export async function getUpload(req, res, next) {
  try {
    const { id } = req.params;
    const isOfficer = ['officer', 'department_admin', 'super_admin'].includes(req.user.role);

    const { data: upload, error } = await supabase.from('uploads').select('*').eq('id', id).single();
    if (error || !upload) return next(createError(404, 'Upload not found'));
    if (!isOfficer && upload.user_id !== req.user.id) return next(createError(403, 'Access denied'));

    res.json({ upload });
  } catch (err) { next(err); }
}

export async function deleteUpload(req, res, next) {
  try {
    const { id } = req.params;
    const { data: upload } = await supabase.from('uploads').select('*').eq('id', id).single();
    if (!upload) return next(createError(404, 'Upload not found'));
    if (upload.user_id !== req.user.id && req.user.role !== 'super_admin') {
      return next(createError(403, 'Access denied'));
    }

    // Delete physical file
    try { if (fs.existsSync(upload.storage_path)) fs.unlinkSync(upload.storage_path); } catch {}

    await supabase.from('uploads').delete().eq('id', id);
    res.json({ message: 'Upload deleted' });
  } catch (err) { next(err); }
}
