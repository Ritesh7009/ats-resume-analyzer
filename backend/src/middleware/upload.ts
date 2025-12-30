import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.upload.dir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueId}${ext}`);
  },
});

// File filter for allowed types
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const allowedMimes = config.upload.allowedMimeTypes;
  const allowedExts = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, JPG, JPEG, and PNG files are allowed.'));
  }
};

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
    files: 1,
  },
});

// Single file upload middleware
export const uploadResume = upload.single('resume');

// Error handler for multer
export const handleUploadError = (error: Error): string => {
  if (error.message.includes('File too large')) {
    return 'File size exceeds the maximum limit of 10MB.';
  }
  if (error.message.includes('Invalid file type')) {
    return error.message;
  }
  return 'Error uploading file. Please try again.';
};
