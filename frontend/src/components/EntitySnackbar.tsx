import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe, Share2, ExternalLink, ChevronDown, ChevronUp, Maximize2, Sparkles } from 'lucide-react';
import { isEventExpired } from './PulseFeed';

interface EntitySnackbarProps {
  entity: any | null;
  onClose: () => void;
  entities?: any[];
  onSelectEntity?: (entity: any) => void;
  onLightboxToggle?: (isOpen: boolean) => void;
}

const EntitySnackbar: React.FC<EntitySnackbarProps> = ({ 
  entity, 
  onClose, 
  entities = [], 
  onSelectEntity,
  onLightboxToggle
}) => {
  const isExpired = entity && entity.entity_type === 'event' && isEventExpired(entity.date_time_verified || entity.date_time, entity.event_dates);
  const [isExpanded, setIsExpanded] = useState(false);
  const [posterAspect, setPosterAspect] = useState<'horizontal' | 'vertical'>('horizontal');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Responsive mobile width listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset expansion state and layout state when selected entity changes
  useEffect(() => {
    setIsExpanded(false);
    setPosterAspect('horizontal'); // Default fallback
  }, [entity]);

  // Trigger onLightboxToggle when lightbox state changes
  useEffect(() => {
    if (onLightboxToggle) {
      onLightboxToggle(isLightboxOpen);
    }
  }, [isLightboxOpen, onLightboxToggle]);

  // Handle image dimensions to decide aspect split (Point 2)
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth < naturalHeight) {
      setPosterAspect('vertical');
    } else {
      setPosterAspect('horizontal');
    }
  };

  // Compute similar spots / events (Point 4)
  const similarEntities = React.useMemo(() => {
    if (!entities || !entity) return [];
    
    return entities
      .filter((e) => (e.id || e.name) !== (entity.id || entity.name))
      .map((e) => {
        let score = 0;
        // Same category gives +5 points
        if (e.entity_type === entity.entity_type) score += 5;
        
        // Overlapping vibe tags give +2 points each
        const currentTags = entity.vibe_tags || [];
        const otherTags = e.vibe_tags || [];
        const intersection = currentTags.filter((t: string) => otherTags.includes(t));
        score += intersection.length * 2;
        
        return { entity: e, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.entity);
  }, [entities, entity]);

  return (
    <AnimatePresence>
      {entity && (
        <>
          {/* Glassmorphic Backdrop overlay on mobile for focus and easy light-dismiss */}
          {isMobile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(5, 5, 8, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                zIndex: 999
              }}
            />
          )}

          {/* Main Bottom Sheet Panel */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 28 }}
            style={{
              position: isMobile ? 'fixed' : 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              maxHeight: isMobile ? '85vh' : '82vh',
              background: 'rgba(15, 15, 22, 0.96)',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '24px 24px 0 0',
              boxShadow: '0 -15px 40px rgba(0,0,0,0.8)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(25px)',
              WebkitBackdropFilter: 'blur(25px)'
            }}
          >
            {/* Native-like Grab / Pull handle for mobile sheets */}
            {isMobile && (
              <div style={{
                width: '40px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.25)',
                borderRadius: '2px',
                margin: '12px auto 4px auto',
                flexShrink: 0
              }} />
            )}

            {/* Top Close Button for the panel */}
            <button 
              onClick={onClose}
              aria-label="Close details panel"
              style={{
                position: 'absolute',
                top: isMobile ? '12px' : '16px',
                right: isMobile ? '12px' : '16px',
                background: 'rgba(15, 15, 22, 0.7)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary, #f0f0f5)',
                cursor: 'pointer',
                zIndex: 1010,
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 15, 22, 0.7)'}
            >
              <X size={18} />
            </button>

            {/* Split Content layout (Horizontal vs Vertical) (Point 2) */}
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : (posterAspect === 'vertical' ? 'row' : 'column'),
              width: '100%',
              flex: 1,
              minHeight: 0,
              overflowY: isMobile ? 'auto' : (posterAspect === 'vertical' ? 'hidden' : 'auto'),
              overscrollBehaviorY: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}>
              
              {/* Poster Image Area */}
              {entity.sourceImage && (
                <div 
                  onClick={() => setIsLightboxOpen(true)}
                  style={{ 
                    position: 'relative', 
                    cursor: 'zoom-in',
                    width: isMobile ? '100%' : (posterAspect === 'vertical' ? '220px' : '100%'), 
                    height: isMobile ? '240px' : (posterAspect === 'vertical' ? 'auto' : '190px'),
                    minHeight: isMobile ? 'auto' : (posterAspect === 'vertical' ? '300px' : '190px'),
                    maxHeight: isMobile ? '35vh' : 'none',
                    flexShrink: 0,
                    background: '#14141d',
                    overflow: 'hidden',
                    alignSelf: 'stretch'
                  }}
                >
                  <img 
                    src={entity.sourceImage} 
                    alt={entity.name}
                    onLoad={handleImageLoad}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                      filter: isExpired ? 'grayscale(0.8) opacity(0.55)' : 'none',
                      transition: 'filter 0.3s ease'
                    }}
                  />
                  
                  {/* Past Event Overlay Badge */}
                  {isExpired && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(15, 15, 22, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      pointerEvents: 'none'
                    }}>
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.9)',
                        color: 'white',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{ fontSize: '12px' }}>⏰</span> Past Event
                      </div>
                    </div>
                  )}

                  {/* Subtle Zoom/Expand hover hint */}
                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    background: 'rgba(0,0,0,0.6)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: 500,
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Maximize2 size={12} /> Click to zoom
                  </div>
                </div>
              )}

              {/* Information & Description Details Column */}
              <div style={{ 
                flex: 1, 
                padding: isMobile ? '20px 16px 32px 16px' : '24px 24px 32px 24px', 
                display: 'flex', 
                flexDirection: 'column', 
                overflowY: isMobile ? 'visible' : (posterAspect === 'vertical' ? 'auto' : 'visible'),
                minHeight: 0
              }}>
                
                {/* Header Title Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingRight: '40px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    background: entity.entity_type === 'event' ? 'var(--accent-color, #7b61ff)' : (entity.entity_type === 'restaurant' ? '#10b981' : '#00d2ff'), 
                    color: 'white', 
                    padding: '3px 10px', 
                    borderRadius: '12px', 
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {entity.suggested_emoji || (entity.entity_type === 'event' ? '🎫' : (entity.entity_type === 'restaurant' ? '🍜' : '📍'))}
                    {entity.entity_type || 'spot'}
                  </span>

                  {isExpired && (
                    <span style={{ 
                      background: 'rgba(239, 68, 68, 0.15)', 
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171', 
                      padding: '3px 10px', 
                      borderRadius: '12px', 
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      Expired
                    </span>
                  )}

                  <h3 style={{ margin: 0, fontSize: isMobile ? '20px' : '22px', color: 'var(--text-primary, #fff)', fontWeight: 700, lineHeight: 1.25 }}>
                    {entity.name}
                  </h3>
                </div>

                {/* Expired alert banner */}
                {isExpired && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '16px',
                    padding: '12px 16px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '18px' }}>⏰</span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#f87171' }}>This event has ended</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary, #b3b3b3)' }}>
                        This listing is kept for reference as a past hotspot.
                      </span>
                    </div>
                  </div>
                )}

                {/* 1. Labeled Metadata Sections Above Description (Point 1 - Clarity & a11y) */}
                <div 
                  aria-label="Spot Details"
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', 
                    gap: '12px', 
                    marginBottom: '20px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '16px',
                    padding: '16px'
                  }}
                >
                  {/* Schedule/Hours Section */}
                  {(entity.date_time_verified || entity.date_time) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span id="lbl-schedule" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-color, #7b61ff)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        📅 Schedule & Timing
                      </span>
                      <span aria-labelledby="lbl-schedule" style={{ fontSize: '13px', color: '#f0f0f5', fontWeight: 500, lineHeight: 1.35 }}>
                        {entity.date_time_verified || entity.date_time}
                      </span>
                    </div>
                  )}

                  {/* Location/Address Section */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span id="lbl-location" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-color, #7b61ff)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      📍 Location / Map Link
                    </span>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(entity.address || entity.name)}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      aria-labelledby="lbl-location"
                      style={{ 
                        fontSize: '13px', 
                        color: 'var(--success-color, #00d2ff)', 
                        fontWeight: 600, 
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        lineHeight: 1.35
                      }}
                    >
                      {entity.address || 'Tokyo, Japan'} <ExternalLink size={12} style={{ flexShrink: 0 }} />
                    </a>
                  </div>

                  {/* Budget/Admission Section */}
                  {(entity.ticket_price_or_cost_verified || entity.ticket_price_or_cost) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span id="lbl-cost" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-color, #7b61ff)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        🎫 Admission / Average Budget
                      </span>
                      <span aria-labelledby="lbl-cost" style={{ fontSize: '13px', color: '#f0f0f5', fontWeight: 500 }}>
                        {entity.ticket_price_or_cost_verified || entity.ticket_price_or_cost}
                      </span>
                    </div>
                  )}

                  {/* Contact / Social Connections Link List */}
                  {(entity.official_website || (entity.social_media_links && entity.social_media_links.length > 0)) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span id="lbl-links" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-color, #7b61ff)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        🔗 Connections & Website
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {entity.official_website && (
                          <a 
                            href={entity.official_website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            aria-label="Official Website link"
                            style={{ 
                              color: '#fff', 
                              textDecoration: 'none',
                              fontWeight: 600,
                              fontSize: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: 'rgba(123, 97, 255, 0.15)',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              border: '1px solid rgba(123, 97, 255, 0.3)',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(123, 97, 255, 0.25)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(123, 97, 255, 0.15)'}
                          >
                            <Globe size={12} /> Official Site
                          </a>
                        )}
                        {entity.social_media_links?.map((link: string, i: number) => {
                          let label = "Social";
                          if (link.includes("instagram.com")) label = "Instagram";
                          else if (link.includes("x.com") || link.includes("twitter.com")) label = "X / Twitter";
                          else if (link.includes("facebook.com")) label = "Facebook";
                          
                          return (
                            <a 
                              key={i}
                              href={link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              aria-label={`Social connection: ${label}`}
                              style={{ 
                                color: 'var(--success-color, #00d2ff)', 
                                textDecoration: 'none',
                                fontWeight: 600,
                                fontSize: '12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                background: 'rgba(0, 210, 255, 0.08)',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                border: '1px solid rgba(0, 210, 255, 0.15)',
                                transition: 'background 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 210, 255, 0.18)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 210, 255, 0.08)'}
                            >
                              <Share2 size={12} /> {label}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Rich Description Panel with height animations (Point 3) */}
                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-color, #7b61ff)', fontWeight: 700, letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                    📖 Spot Context
                  </span>
                  
                  <motion.div
                    animate={{ height: isExpanded ? 'auto' : '44px' }}
                    transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                    style={{ overflow: 'hidden', position: 'relative' }}
                  >
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary, #b3b3b3)', lineHeight: 1.5, textAlign: 'justify' }}>
                      {entity.description}
                    </p>
                    {!isExpanded && entity.description && entity.description.length > 64 && (
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        height: '24px',
                        background: 'linear-gradient(to top, rgba(15, 15, 22, 0.95), transparent)',
                        pointerEvents: 'none'
                      }} />
                    )}
                  </motion.div>

                  {entity.description && entity.description.length > 64 && (
                    <button
                      onClick={() => setIsExpanded(!isExpanded)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-color, #7b61ff)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 700,
                        padding: 0,
                        marginTop: '6px',
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

                {/* Vibe tag badges */}
                {entity.vibe_tags && entity.vibe_tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {entity.vibe_tags.map((tag: string, i: number) => (
                      <span key={i} style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '4px 12px',
                        borderRadius: '100px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--text-secondary, #b3b3b3)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 4. Similar Events / Spots Carousel (Point 4) */}
                {similarEntities.length > 0 && (
                  <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <h4 style={{ 
                      fontSize: '13px', 
                      color: 'var(--text-primary, #fff)', 
                      fontWeight: 600, 
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Sparkles size={13} style={{ color: 'var(--accent-color, #7b61ff)' }} />
                      Similar Spots & Events
                    </h4>
                    
                    {/* Horizontal scrollable carousel wrapper */}
                    <div style={{ 
                      display: 'flex', 
                      gap: '12px', 
                      overflowX: 'auto', 
                      paddingBottom: '8px',
                      scrollbarWidth: 'thin',
                      msOverflowStyle: 'none',
                    }}>
                      {similarEntities.map((simEntity: any, index: number) => (
                        <div
                          key={index}
                          onClick={() => onSelectEntity && onSelectEntity(simEntity)}
                          style={{
                            flex: '0 0 160px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: '12px',
                            padding: '10px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.borderColor = 'rgba(123, 97, 255, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                          }}
                        >
                          {/* Carousel Thumbnail */}
                          {simEntity.sourceImage ? (
                            <img 
                              src={simEntity.sourceImage} 
                              alt={simEntity.name}
                              style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                          ) : (
                            <div style={{ 
                              width: '100%', 
                              height: '80px', 
                              borderRadius: '8px', 
                              background: 'rgba(123, 97, 255, 0.1)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              fontSize: '20px'
                            }}>
                              {simEntity.suggested_emoji || '📍'}
                            </div>
                          )}
                          
                          {/* Title */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ 
                              fontSize: '12px', 
                              fontWeight: 600, 
                              color: '#fff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {simEntity.name}
                            </span>
                            <span style={{ 
                              fontSize: '10px', 
                              color: 'var(--text-secondary, #9ea3b0)',
                              textTransform: 'capitalize'
                            }}>
                              {simEntity.suggested_emoji || '📍'} {simEntity.entity_type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          </motion.div>

          {/* Full Screen Image Lightbox Modal (Point 2) */}
          <AnimatePresence>
            {isLightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsLightboxOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100vw',
                  height: '100vh',
                  background: 'rgba(5, 5, 8, 0.9)',
                  backdropFilter: 'blur(15px)',
                  WebkitBackdropFilter: 'blur(15px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2000,
                  cursor: 'zoom-out'
                }}
              >
                {/* Lightbox Image Container */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}
                >
                  <img 
                    src={entity.sourceImage} 
                    alt={entity.name}
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '90vh', 
                      objectFit: 'contain',
                      borderRadius: '16px',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                  
                  {/* Close floating button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLightboxOpen(false);
                    }}
                    style={{
                      position: 'absolute',
                      top: '-48px',
                      right: 0,
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={18} />
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default EntitySnackbar;
