import React, { useCallback, useState, useRef, useEffect } from 'react';
import { UploadCloud, Loader2, Sparkles, MapPin, Database, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Loading stages to show progress
const LOADING_STAGES = [
  { text: "Uploading flyer to Google Cloud Storage...", icon: UploadCloud, color: "#38bdf8" },
  { text: "Gemini AI reading flyer layout & design...", icon: Sparkles, color: "#a78bfa" },
  { text: "Enriching coordinates & social links...", icon: Globe, color: "#34d399" },
  { text: "Locating on Google Maps & resolving address...", icon: MapPin, color: "#f87171" },
  { text: "Storing events & metadata to database...", icon: Database, color: "#fbbf24" }
];

// Fun facts / tips to keep users engaged while waiting
const TOKYO_TIPS = [
  "Shibuya Crossing sees up to 3,000 people cross at a single time!",
  "Tokyo has the most Michelin-starred restaurants of any city in the world.",
  "Always walk on the left side of escalators and stairs in Tokyo.",
  "Trash cans are rare on Tokyo streets; carry your trash home with you.",
  "The red lanterns of Omoide Yokocho in Shinjuku house 80+ tiny restaurants.",
  "IC cards can be used to pay at most vending machines and convenience stores.",
  "Traditional Ryokan inns often provide comfortable Yukata robes for guests."
];

interface UploadZoneProps {
  onUploadComplete: (data: any) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onUploadComplete }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manage timers during uploading
  useEffect(() => {
    if (!isUploading) {
      setProgress(0);
      setStageIndex(0);
      setTipIndex(0);
      return;
    }

    // 1. Smoothly increment progress bar up to 98%
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return prev;
        const remaining = 98 - prev;
        // Slow down progress as we approach 98
        const step = Math.max(1, Math.min(5, Math.floor(remaining / 10)));
        return prev + step;
      });
    }, 400);

    // 2. Cycle through logical loading stages
    const stageInterval = setInterval(() => {
      setStageIndex((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
    }, 2800);

    // 3. Cycle through tips
    const tipInterval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TOKYO_TIPS.length);
    }, 3800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stageInterval);
      clearInterval(tipInterval);
    };
  }, [isUploading]);

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
        setProgress(100);
        // Brief timeout to let the user see 100% completion
        setTimeout(() => {
          onUploadComplete(result.data);
        }, 600);
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

  const currentStage = LOADING_STAGES[stageIndex];
  const StageIcon = currentStage.icon;

  return (
    <motion.div 
      className="upload-zone"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      style={{
        borderColor: isDragActive ? 'var(--accent-color)' : 'var(--panel-border)',
        background: isDragActive 
          ? 'rgba(123, 97, 255, 0.05)' 
          : isUploading 
            ? 'rgba(20, 20, 28, 0.4)' 
            : 'rgba(255, 255, 255, 0.02)',
        cursor: isUploading ? 'default' : 'pointer',
        boxShadow: isUploading ? 'inset 0 0 20px rgba(0, 0, 0, 0.2)' : 'none'
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
      
      {!isUploading ? (
        <>
          <motion.div 
            className="upload-icon-wrapper"
            animate={{ y: isDragActive ? -5 : 0 }}
          >
            <UploadCloud size={24} />
          </motion.div>
          <h3 className="upload-title">Snap & Build</h3>
          <p className="upload-subtitle">
            Drag and drop or click to upload a flyer/menu
          </p>
        </>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Animated Spinner Icon Wrapper */}
          <div style={{ position: 'relative', width: '56px', height: '56px', marginBottom: '16px' }}>
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: 'var(--accent-color)',
                borderRightColor: 'var(--success-color)'
              }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            />
            <div style={{
              position: 'absolute',
              top: '3px',
              left: '3px',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: 'rgba(13, 13, 18, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: currentStage.color
            }}>
              <StageIcon size={20} className="animate-pulse" />
            </div>
          </div>

          <h3 className="upload-title" style={{ color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            Analyzing Spot...
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: currentStage.color, height: '20px', transition: 'color 0.3s ease' }}>
            <Loader2 size={12} className="animate-spin" />
            <span style={{ fontWeight: 500 }}>{currentStage.text}</span>
          </div>

          {/* Smooth custom-glowing progress bar */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '100px',
            marginTop: '16px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <motion.div 
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #7b61ff 0%, #00d2ff 100%)',
                borderRadius: '100px',
                boxShadow: '0 0 8px var(--accent-color)'
              }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.3 }}
            />
          </div>
          
          <div style={{ alignSelf: 'flex-end', fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontWeight: 600 }}>
            {progress}%
          </div>

          {/* Tokyo Travel Tip display cards */}
          <div style={{ 
            marginTop: '16px', 
            padding: '12px 14px', 
            background: 'rgba(255, 255, 255, 0.01)', 
            border: '1px solid rgba(255, 255, 255, 0.05)', 
            borderRadius: '12px',
            minHeight: '62px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)'
          }}>
            <span style={{ 
              fontSize: '10px', 
              color: 'var(--accent-color)', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              marginBottom: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}>
              💡 Tokyo Travel Tip
            </span>
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.35 }}
              >
                "{TOKYO_TIPS[tipIndex]}"
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UploadZone;
