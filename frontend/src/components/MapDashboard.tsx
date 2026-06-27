import React, { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
}

interface MapDashboardProps {
  markers: MarkerData[];
}

const MapDashboard: React.FC<MapDashboardProps> = ({ markers }) => {
  const [center, setCenter] = useState({ lat: 35.6620, lng: 139.7038 }); // Shibuya, Tokyo

  // If we get a new marker, center on the latest one
  React.useEffect(() => {
    if (markers.length > 0) {
      const latest = markers[markers.length - 1];
      setCenter({ lat: latest.lat, lng: latest.lng });
    }
  }, [markers]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={center}
          center={center}
          defaultZoom={15}
          mapId="LOCUS_GEMINI_MAP_ID"
          disableDefaultUI={true}
          style={{ width: '100%', height: '100%' }}
        >
          {markers.map((marker) => (
             <AdvancedMarker key={marker.id} position={{ lat: marker.lat, lng: marker.lng }} title={marker.title}>
               <Pin background={marker.type === 'event' ? '#7b61ff' : '#00d2ff'} borderColor={'#5a42d1'} glyphColor={'#fff'} />
             </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapDashboard;
