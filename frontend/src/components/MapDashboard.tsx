import React, { useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
  suggested_emoji?: string;
}

interface MapDashboardProps {
  markers: MarkerData[];
  center: { lat: number; lng: number };
  onMarkerClick?: (id: string) => void;
}

const MapUpdater: React.FC<{ center: {lat: number, lng: number} }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
    }
  }, [map, center]);
  return null;
};

const MapDashboard: React.FC<MapDashboardProps> = ({ markers, center, onMarkerClick }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={{ lat: 35.6620, lng: 139.7038 }}
          defaultZoom={15}
          gestureHandling={'greedy'}
          mapId="LOCAL_LENS_MAP_ID"
          disableDefaultUI={false}
          style={{ width: '100%', height: '100%' }}
        >
          <MapUpdater center={center} />
          {markers.map((marker) => (
             <AdvancedMarker 
               key={marker.id} 
               position={{ lat: marker.lat, lng: marker.lng }} 
               title={marker.title}
               onClick={() => onMarkerClick && onMarkerClick(marker.id)}
             >
                <Pin 
                  background={marker.type === 'event' ? '#7b61ff' : (marker.type === 'restaurant' ? '#10b981' : '#00d2ff')} 
                  borderColor={marker.type === 'event' ? '#5a42d1' : (marker.type === 'restaurant' ? '#059669' : '#009ebd')} 
                  glyph={marker.suggested_emoji || (marker.type === 'event' ? '🎫' : (marker.type === 'restaurant' ? '🍜' : '📍'))}
                  glyphColor={'#fff'} 
                />
             </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapDashboard;
