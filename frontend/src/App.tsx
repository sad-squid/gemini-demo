import { useState, useEffect } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import MapDashboard from './components/MapDashboard';
import UploadZone from './components/UploadZone';
import PulseFeed, { type FeedItem } from './components/PulseFeed';
import ConciergeChat from './components/ConciergeChat';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [entities, setEntities] = useState<any[]>([]);
  const [center, setCenter] = useState({ lat: 35.6620, lng: 139.7038 }); // Shibuya, Tokyo
  const [activeTab, setActiveTab] = useState<'discover' | 'concierge'>('discover');

  // 1. Fetch initial spots from DB on load
  const fetchLocations = async () => {
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
      console.error('Failed to fetch locations:', err);
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
    }));

  // 5. Transform entities for Spot list items
  const feedItems: FeedItem[] = entities.map(e => ({
    id: e.id || e.name,
    title: e.name,
    location: e.address || 'Tokyo, Japan',
    tags: [e.entity_type, ...(e.vibe_tags || [])],
    lat: e.latitude,
    lng: e.longitude,
    sourceImage: e.sourceImage
  }));

  return (
    <div className="app-container" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <div className="map-container" style={{ flex: 1, height: '100%' }}>
        <MapDashboard markers={markers} center={center} />
      </div>
      
      <div className="side-panel">
        <div className="panel-header">
          <h1>Local Lens</h1>
          <p>Tokyo active AI-guided mapping engine</p>
        </div>

        {/* Tab Navigation Controls */}
        <div className="tab-navigation" style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('discover')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 0',
              fontSize: '13px',
              fontWeight: 500,
              color: activeTab === 'discover' ? 'white' : 'var(--text-secondary)',
              background: activeTab === 'discover' ? 'rgba(255, 255, 255, 0.08)' : 'none',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Compass size={14} /> Discover Spot
          </button>
          <button
            onClick={() => setActiveTab('concierge')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '10px 0',
              fontSize: '13px',
              fontWeight: 500,
              color: activeTab === 'concierge' ? 'white' : 'var(--text-secondary)',
              background: activeTab === 'concierge' ? 'rgba(255, 255, 255, 0.08)' : 'none',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Sparkles size={14} /> LocalGuide
          </button>
        </div>
        
        {/* Tab Contents */}
        {activeTab === 'discover' ? (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            <UploadZone onUploadComplete={handleUploadComplete} />
            <PulseFeed items={feedItems} onItemClick={handleItemClick} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
            <ConciergeChat />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
