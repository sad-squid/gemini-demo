import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadZone: React.FC = () => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      console.log('File dropped:', file.name);
      // TODO: Handle file upload to backend
    }
  }, []);

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
