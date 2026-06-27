import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import MapDashboard from './components/MapDashboard';
import UploadZone from './components/UploadZone';
import PulseFeed, { type FeedItem, isEventExpired } from './components/PulseFeed';
import EntitySnackbar from './components/EntitySnackbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [entities, setEntities] = useState<any[]>([]);
  const [center, setCenter] = useState({ lat: 35.6620, lng: 139.7038 }); // Shibuya, Tokyo
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Fetch initial spots from DB on load
  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/locations`);
      const result = await response.json();
      if (result.status === 'success' && Array.isArray(result.data)) {
        setEntities(result.data);
        if (result.data.length > 0) {
          // Center on latest added spot
          const latest = result.data[result.data.length - 1];
          if (latest.latitude && latest.longitude) {
            setCenter({ lat: latest.latitude, lng: latest.longitude });
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch locations, using mock data:', err);
      const mockData = [
        {
          id: 'mock_1',
          entity_type: 'event',
          name: 'Cyberpunk Art Exhibition',
          description: 'A futuristic digital art exhibition featuring local and international digital artists.',
          address: '2-24-1 Shibuya, Tokyo',
          latitude: 35.6580,
          longitude: 139.7016,
          vibe_tags: ['cyberpunk', 'digital', 'neon'],
          sourceImage: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'mock_2',
          entity_type: 'restaurant',
          name: 'Neon Ramen',
          description: 'Late night ramen spot with a retro-futuristic aesthetic.',
          address: '1-10-2 Dogenzaka, Shibuya, Tokyo',
          latitude: 35.6595,
          longitude: 139.6990,
          vibe_tags: ['cozy', 'late-night', 'cyberpunk'],
          sourceImage: 'https://images.unsplash.com/photo-1552611052-3ba9d73c6516?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        },
        {
          id: 'mock_3',
          entity_type: 'venue',
          name: 'Womb Tokyo',
          description: 'Legendary underground electronic music club.',
          address: '2-16 Maruyamacho, Shibuya, Tokyo',
          latitude: 35.6587,
          longitude: 139.6953,
          vibe_tags: ['underground', 'electronic', 'club'],
          sourceImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        }
      ];
      setEntities(mockData);
      setCenter({ lat: 35.6580, lng: 139.7016 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // 2. Handle visual upload extraction complete
  const handleUploadComplete = (data: any) => {
    if (!data) return;
    setEntities(prev => {
      // Avoid adding duplicates
      const exists = prev.some(item => item.name === data.name);
      if (exists) return prev;
      return [...prev, data];
    });
    
    // Automatically fly/center map on newly added spot
    if (data.latitude && data.longitude) {
      setCenter({ lat: data.latitude, lng: data.longitude });
    }
  };

  // 3. Handle item clicked on the Verified Spot list
  const handleItemClick = (item: FeedItem) => {
    if (item.lat && item.lng) {
      setCenter({ lat: item.lat, lng: item.lng });
    }
    const fullEntity = entities.find(e => (e.id || e.name) === item.id);
    if (fullEntity) {
      setSelectedEntity(fullEntity);
    }
  };

  const handleMarkerClick = (id: string) => {
    const fullEntity = entities.find(e => (e.id || e.name) === id);
    if (fullEntity) {
      if (fullEntity.latitude && fullEntity.longitude) {
        setCenter({ lat: fullEntity.latitude, lng: fullEntity.longitude });
      }
      setSelectedEntity(fullEntity);
    }
  };

  // 4. Transform entities for Map markers
  const markers = entities
    .filter(e => e.latitude && e.longitude)
    .map(e => ({
      id: e.id || e.name,
      lat: e.latitude,
      lng: e.longitude,
      title: e.name,
      type: e.entity_type,
      suggested_emoji: e.suggested_emoji,
      isExpired: e.entity_type === 'event' && isEventExpired(e.date_time_verified || e.date_time, e.event_dates)
    }));

  // 5. Transform entities for Spot list items
  const feedItems: FeedItem[] = entities.map(e => ({
    id: e.id || e.name,
    title: e.name,
    location: e.address || 'Tokyo, Japan',
    tags: [e.entity_type, ...(e.vibe_tags || [])],
    lat: e.latitude,
    lng: e.longitude,
    sourceImage: e.sourceImage,
    date_time: e.date_time_verified || e.date_time,
    event_dates: e.event_dates || []
  }));

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
      
      {/* Point 5: Floating Toggle Button for Side Panel (Google Maps Style) */}
      <button
        onClick={() => setIsSidePanelCollapsed(!isSidePanelCollapsed)}
        aria-label={isSidePanelCollapsed ? "Expand side panel" : "Collapse side panel"}
        style={isMobile ? {
          position: 'absolute',
          bottom: isSidePanelCollapsed ? '84px' : 'calc(55vh + 24px)',
          left: '16px',
          zIndex: 101,
          background: 'rgba(15, 15, 22, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'bottom 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background 0.2s',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        } : {
          position: 'absolute',
          top: '24px',
          right: isSidePanelCollapsed ? '24px' : '444px',
          zIndex: 101,
          background: 'rgba(15, 15, 22, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          transition: 'right 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), background 0.2s',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 15, 22, 0.85)'}
      >
        {isMobile ? (
          isSidePanelCollapsed ? <ChevronUp size={20} /> : <ChevronDown size={20} />
        ) : (
          isSidePanelCollapsed ? <ChevronLeft size={20} /> : <ChevronRight size={20} />
        )}
      </button>

      <div className="map-container" style={{ flex: 1, height: isMobile ? 'auto' : '100%', position: 'relative' }}>
        <MapDashboard 
          markers={markers} 
          center={center} 
          onMarkerClick={handleMarkerClick}
          onMapPan={() => {
            setIsSidePanelCollapsed(true); // Auto-collapse side panel on map drag/pan
            setSelectedEntity(null);       // Close/collapse bottom details sheet on map drag/pan
          }}
        />
        <EntitySnackbar 
          entity={selectedEntity} 
          onClose={() => setSelectedEntity(null)} 
          entities={entities}
          onSelectEntity={(entity) => {
            if (entity.latitude && entity.longitude) {
              setCenter({ lat: entity.latitude, lng: entity.longitude });
            }
            setSelectedEntity(entity);
          }}
          onLightboxToggle={(isOpen) => {
            if (isOpen) {
              setIsSidePanelCollapsed(true); // Point 5: Collapse side panel when poster zooms in
            }
          }}
        />
      </div>
      
      {/* Point 5: Collapsible Animated Side Panel */}
      <motion.div 
        animate={isMobile ? {
          height: isSidePanelCollapsed ? 60 : '55vh',
          width: '100%',
          padding: isSidePanelCollapsed ? '12px 16px' : '20px 16px',
          opacity: 1
        } : {
          width: isSidePanelCollapsed ? 0 : 420,
          padding: isSidePanelCollapsed ? 0 : 24,
          opacity: isSidePanelCollapsed ? 0 : 1,
          height: '100%'
        }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        className="side-panel"
        onClick={() => {
          if (isMobile && isSidePanelCollapsed) {
            setIsSidePanelCollapsed(false);
          }
        }}
        style={{ 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'rgba(20, 20, 28, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderLeft: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          borderTop: isMobile ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          boxShadow: '0 -8px 32px 0 rgba(0, 0, 0, 0.37)'
        }}
      >
        {isMobile && (
          <div style={{
            width: '36px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px',
            margin: '0 auto 8px auto',
            cursor: 'pointer',
            flexShrink: 0
          }} />
        )}
        {/* Point 4: Google Whimsical Style Logo and Indicators */}
        <div className="panel-header" style={{ position: 'relative', marginBottom: isMobile && isSidePanelCollapsed ? 0 : undefined }}>
          {!(isMobile && isSidePanelCollapsed) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{
                display: 'flex',
                gap: '3px',
                padding: '4px 6px',
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '50px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4285F4' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34A853' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FBBC05' }} />
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA4335' }} />
              </div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--success-color, #00d2ff)', fontWeight: 700 }}>
                Hyperlocal Engine
              </span>
            </div>
          )}
          <h1 style={{ 
            fontSize: isMobile && isSidePanelCollapsed ? '18px' : '28px', 
            background: 'linear-gradient(135deg, #fff 0%, #a594fd 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent', 
            margin: '0',
            textAlign: isMobile && isSidePanelCollapsed ? 'center' : 'left'
          }}>
            Local Lens
          </h1>
          {!(isMobile && isSidePanelCollapsed) && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>Tokyo active AI-guided mapping engine</p>
          )}
        </div>

         <div style={{ 
           display: 'flex', 
           flexDirection: 'column', 
           flex: 1, 
           overflowY: 'auto', 
           marginTop: '16px',
           minHeight: 0,
           WebkitOverflowScrolling: 'touch'
         }}>
           <UploadZone onUploadComplete={handleUploadComplete} />
           <PulseFeed items={feedItems} onItemClick={handleItemClick} isLoading={isLoading} />
         </div>
      </motion.div>
    </div>
  );
}

export default App;
