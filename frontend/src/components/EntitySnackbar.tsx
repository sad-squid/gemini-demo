import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Globe, Share2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface EntitySnackbarProps {
  entity: any | null;
  onClose: () => void;
}

const EntitySnackbar: React.FC<EntitySnackbarProps> = ({ entity, onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Reset expansion state when selected entity changes
  useEffect(() => {
    setIsExpanded(false);
  }, [entity]);

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
            bottom: 0,
            left: 0,
            width: '100%',
            background: 'var(--surface-color, #1a1a1a)',
            borderTop: '1px solid var(--panel-border, rgba(255,255,255,0.1))',
            borderRadius: '24px 24px 0 0',
            boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
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
            
            <div>
              <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-secondary, #b3b3b3)', lineHeight: 1.4 }}>
                {isExpanded 
                  ? entity.description 
                  : (entity.description && entity.description.length > 64 
                      ? `${entity.description.slice(0, 64)}...` 
                      : entity.description)
                }
              </p>
              {entity.description && entity.description.length > 64 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color, #7b61ff)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: 0,
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {isExpanded ? (
                    <>Show less <ChevronUp size={14} /></>
                  ) : (
                    <>Show more <ChevronDown size={14} /></>
                  )}
                </button>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary, #b3b3b3)', fontSize: '13px' }}>
                <MapPin size={14} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entity.address || 'Tokyo, Japan'}
                </span>
              </div>

              {entity.official_website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                  <Globe size={14} style={{ color: 'var(--primary-color, #7b61ff)' }} />
                  <a 
                    href={entity.official_website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      color: 'var(--primary-color, #7b61ff)', 
                      textDecoration: 'none',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    Official Website <ExternalLink size={12} />
                  </a>
                </div>
              )}

              {entity.social_media_links && entity.social_media_links.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'start', gap: '6px', fontSize: '13px' }}>
                  <Share2 size={14} style={{ color: '#00d2ff', marginTop: '2px' }} />
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {entity.social_media_links.map((link: string, index: number) => {
                      let label = "Social Link";
                      if (link.includes("instagram.com")) label = "Instagram";
                      else if (link.includes("x.com") || link.includes("twitter.com")) label = "X / Twitter";
                      else if (link.includes("facebook.com")) label = "Facebook";
                      
                      return (
                        <a 
                          key={index}
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ 
                            color: '#00d2ff', 
                            textDecoration: 'none',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {label} <ExternalLink size={12} />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
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
