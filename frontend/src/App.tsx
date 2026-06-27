import React from 'react';
import MapDashboard from './components/MapDashboard';
import UploadZone from './components/UploadZone';
import PulseFeed from './components/PulseFeed';

function App() {
  return (
    <div className="app-container">
      <div className="map-container">
        <MapDashboard />
      </div>
      
      <div className="side-panel">
        <div className="panel-header">
          <h1>LocusGemini</h1>
          <p>Hyperlocalized Context Builder</p>
        </div>
        
        <UploadZone />
        
        <PulseFeed />
      </div>
    </div>
  );
}

export default App;
