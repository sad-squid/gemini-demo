import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

interface UploadZoneProps {
  onUploadComplete: (data: any) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete }) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      console.log('File dropped:', file.name);
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('http://localhost:8000/api/ingest', {
          method: 'POST',
          body: formData,
        });
        const result = await response.json();
        console.log('Extraction Result:', result);
        onUploadComplete(result.data);
      } catch (err) {
        console.error('Failed to upload file:', err);
      }
    }
  }, [onUploadComplete]);

  return (
    <motion.div 
      className="upload-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        borderColor: isDragActive ? 'var(--accent-color)' : 'var(--panel-border)',
        background: isDragActive ? 'rgba(123, 97, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div 
        className="upload-icon-wrapper"
        animate={{ y: isDragActive ? -5 : 0 }}
      >
        <UploadCloud size={24} />
      </motion.div>
      <h3 className="upload-title">Snap & Build</h3>
      <p className="upload-subtitle">Drag and drop a photo of a flyer, menu, or venue</p>
    </motion.div>
  );
};

export default UploadZone;
