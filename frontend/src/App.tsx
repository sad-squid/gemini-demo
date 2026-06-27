import { useState, useEffect } from 'react';
import { Sparkles, Compass } from 'lucide-react';
import MapDashboard from './components/MapDashboard';
import UploadZone from './components/UploadZone';
import PulseFeed, { type FeedItem } from './components/PulseFeed';
import EntitySnackbar from './components/EntitySnackbar';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

function App() {
  const [entities, setEntities] = useState<any[]>([]);
  const [center, setCenter] = useState({ lat: 35.6620, lng: 139.7038 }); // Shibuya, Tokyo
  const [selectedEntity, setSelectedEntity] = useState<any | null>(null);

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
      <div className="map-container" style={{ flex: 1, height: '100%', position: 'relative' }}>
        <MapDashboard 
          markers={markers} 
          center={center} 
          onMarkerClick={handleMarkerClick}
        />
        <EntitySnackbar 
          entity={selectedEntity} 
          onClose={() => setSelectedEntity(null)} 
        />
      </div>
      
      <div className="side-panel">
        <div className="panel-header">
          <h1>Local Lens</h1>
          <p>Tokyo active AI-guided mapping engine</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
          <UploadZone onUploadComplete={handleUploadComplete} />
          <PulseFeed items={feedItems} onItemClick={handleItemClick} />
        </div>
      </div>
    </div>
  );
}

export default App;
