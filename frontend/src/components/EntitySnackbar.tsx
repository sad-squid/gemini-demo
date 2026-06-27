import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin } from 'lucide-react';

interface EntitySnackbarProps {
  entity: any | null;
  onClose: () => void;
}

const EntitySnackbar: React.FC<EntitySnackbarProps> = ({ entity, onClose }) => {
  return (
    <AnimatePresence>
      {entity && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{
            position: 'absolute',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '400px',
            background: 'var(--surface-color, #1a1a1a)',
            border: '1px solid var(--panel-border, rgba(255,255,255,0.1))',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000
          }}
        >
          {entity.sourceImage && (
            <div style={{ width: '100%', height: '180px', position: 'relative' }}>
              <img 
                src={entity.sourceImage} 
                alt={entity.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button 
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(0,0,0,0.6)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ 
                background: 'var(--primary-color, #7b61ff)', 
                color: 'white', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {entity.entity_type || 'spot'}
              </span>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary, #fff)', fontWeight: 600 }}>
                {entity.name}
              </h3>
            </div>
            
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: 'var(--text-secondary, #b3b3b3)', lineHeight: 1.4 }}>
              {entity.description}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary, #b3b3b3)', fontSize: '13px' }}>
              <MapPin size={14} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {entity.address || 'Tokyo, Japan'}
              </span>
            </div>
            
            {entity.vibe_tags && entity.vibe_tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                {entity.vibe_tags.map((tag: string, i: number) => (
                  <span key={i} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '4px 10px',
                    borderRadius: '100px',
                    fontSize: '12px',
                    color: 'var(--text-secondary, #b3b3b3)'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EntitySnackbar;
