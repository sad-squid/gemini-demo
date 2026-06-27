import { useState } from 'react';
import MapDashboard from './components/MapDashboard';
import UploadZone from './components/UploadZone';
import PulseFeed, { type FeedItem } from './components/PulseFeed';

function App() {
  const [entities, setEntities] = useState<any[]>([]);

  const handleUploadComplete = (data: any) => {
    setEntities(prev => [...prev, data]);
  };

  const markers = entities.filter(e => e.location?.coordinates).map(e => ({
    id: e.id,
    lat: e.location.coordinates.latitude,
    lng: e.location.coordinates.longitude,
    title: e.name,
    type: e.type,
  }));

  const feedItems: FeedItem[] = entities.map(e => ({
    id: e.id,
    title: e.name,
    location: e.location?.address || 'Unknown',
    tags: e.tags || [],
  }));

  return (
    <div className="app-container">
      <div className="map-container">
        <MapDashboard markers={markers} />
      </div>
      
      <div className="side-panel">
        <div className="panel-header">
          <h1>LocusGemini</h1>
          <p>Hyperlocalized Context Builder</p>
        </div>
        
        <UploadZone onUploadComplete={handleUploadComplete} />
        
        <PulseFeed items={feedItems} />
      </div>
    </div>
  );
}

export default App;
