import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

const MapDashboard: React.FC = () => {
  const [center, setCenter] = useState({ lat: 35.6620, lng: 139.7038 }); // Shibuya, Tokyo

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={15}
          mapId="LOCUS_GEMINI_MAP_ID"
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Example Marker */}
          <AdvancedMarker position={center}>
            <Pin background={'#7b61ff'} borderColor={'#5a42d1'} glyphColor={'#fff'} />
          </AdvancedMarker>
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapDashboard;
