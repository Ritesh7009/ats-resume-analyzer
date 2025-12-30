import React, { useCallback } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import { CloudUpload, InsertDriveFile, CheckCircle, Error } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  uploadProgress?: number;
  uploadedFileName?: string;
  error?: string;
  accept?: Accept;
  acceptedFormats?: string[];
  maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  isUploading = false,
  uploadProgress = 0,
  uploadedFileName,
  error,
  accept = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isUploading,
  });

  const getBorderColor = () => {
    if (isDragReject || error) return 'error.main';
    if (isDragActive) return 'primary.main';
    if (uploadedFileName) return 'success.main';
    return 'grey.300';
  };

  const getBackgroundColor = () => {
    if (isDragReject || error) return 'error.lighter';
    if (isDragActive) return 'primary.lighter';
    if (uploadedFileName) return 'success.lighter';
    return 'grey.50';
  };

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 4,
        cursor: isUploading ? 'default' : 'pointer',
        border: '2px dashed',
        borderColor: getBorderColor(),
        backgroundColor: getBackgroundColor(),
        borderRadius: 3,
        transition: 'all 0.2s ease',
        textAlign: 'center',
        '&:hover': {
          borderColor: isUploading ? getBorderColor() : 'primary.main',
          backgroundColor: isUploading ? getBackgroundColor() : 'primary.lighter',
        },
      }}
    >
      <input {...getInputProps()} />
      
      <AnimatePresence mode="wait">
        {isUploading ? (
          <motion.div
            key="uploading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box sx={{ mb: 2 }}>
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" gutterBottom>
              Uploading...
            </Typography>
            <Box sx={{ width: '100%', mt: 2 }}>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {uploadProgress}%
              </Typography>
            </Box>
          </motion.div>
        ) : uploadedFileName ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Box sx={{ mb: 2 }}>
              <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
            </Box>
            <Typography variant="h6" gutterBottom color="success.main">
              File Uploaded Successfully!
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
              <InsertDriveFile sx={{ color: 'grey.600' }} />
              <Typography variant="body1" color="text.secondary">
                {uploadedFileName}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Drop another file to replace
            </Typography>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box sx={{ mb: 2 }}>
              <Error sx={{ fontSize: 48, color: 'error.main' }} />
            </Box>
            <Typography variant="h6" gutterBottom color="error.main">
              Upload Failed
            </Typography>
            <Typography variant="body2" color="error.main">
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Try again
            </Typography>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Box sx={{ mb: 2 }}>
              <CloudUpload 
                sx={{ 
                  fontSize: 64, 
                  color: isDragActive ? 'primary.main' : 'grey.400',
                  transition: 'color 0.2s ease',
                }} 
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse files
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              Supported formats: PDF, DOCX, JPG, JPEG, PNG (Max 10MB)
            </Typography>
          </motion.div>
        )}
      </AnimatePresence>
    </Paper>
  );
};

export default FileUpload;

