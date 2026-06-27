import React, { useCallback, useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface UploadZoneProps {
  onUploadComplete: (data: any) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const uploadFile = async (file: File) => {
    console.log('Uploading file:', file.name);
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/ingest`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('Extraction Result:', result);
      if (result.status === 'success') {
        onUploadComplete(result.data);
      } else {
        console.error('Upload failed with status:', result.status);
      }
    } catch (err) {
      console.error('Failed to upload file:', err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFile(e.dataTransfer.files[0]);
    }
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFile(e.target.files[0]);
    }
  };
  
  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <motion.div 
      className="upload-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        borderColor: isDragActive ? 'var(--accent-color)' : 'var(--panel-border)',
        background: isDragActive ? 'rgba(123, 97, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
        cursor: isUploading ? 'default' : 'pointer',
        opacity: isUploading ? 0.7 : 1
      }}
      whileHover={!isUploading ? { scale: 1.02 } : {}}
      whileTap={!isUploading ? { scale: 0.98 } : {}}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        style={{ display: 'none' }} 
        accept="image/*"
      />
      <motion.div 
        className="upload-icon-wrapper"
        animate={{ y: isDragActive ? -5 : 0 }}
      >
        {isUploading ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
      </motion.div>
      <h3 className="upload-title">{isUploading ? 'Analyzing...' : 'Snap & Build'}</h3>
      <p className="upload-subtitle">
        {isUploading ? 'Our agents are extracting the context' : 'Drag and drop or click to upload a flyer/menu'}
      </p>
    </motion.div>
  );
};

export default UploadZone;
