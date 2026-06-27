import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';
import { Locate } from 'lucide-react';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
  suggested_emoji?: string;
  isExpired?: boolean;
}

interface MapDashboardProps {
  markers: MarkerData[];
  center: { lat: number; lng: number };
  onMarkerClick?: (id: string) => void;
  onMapPan?: () => void;
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

const MyLocationControl: React.FC = () => {
  const map = useMap();
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const handleRecenterUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = { lat: latitude, lng: longitude };
        setUserLocation(newLoc);
        if (map) {
          map.panTo(newLoc);
          map.setZoom(16);
        }
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Unable to retrieve your location. Please check permissions.");
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <>
      {userLocation && (
        <AdvancedMarker position={userLocation}>
          <div className="user-location-dot" style={{
            position: 'relative',
            width: '16px',
            height: '16px',
            background: '#4285F4',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 0 10px rgba(66, 133, 244, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              position: 'absolute',
              width: '32px',
              height: '32px',
              background: 'rgba(66, 133, 244, 0.25)',
              borderRadius: '50%',
              animation: 'pulse-glow 2s infinite ease-out',
              pointerEvents: 'none'
            }} />
          </div>
        </AdvancedMarker>
      )}

      {/* Re-center Floating Action Button */}
      <button
        onClick={handleRecenterUser}
        aria-label="Re-center on user location"
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          zIndex: 10,
          background: 'rgba(15, 15, 22, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          width: '46px',
          height: '46px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(15, 15, 22, 0.85)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <Locate size={20} className={isLocating ? 'locating-spin' : ''} />
      </button>

      {/* Embedded CSS for animations */}
      <style>{`
        @keyframes pulse-glow {
          0% {
            transform: scale(0.5);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        .locating-spin {
          animation: spin 1.5s linear infinite;
        }
      `}</style>
    </>
  );
};

const MapDashboard: React.FC<MapDashboardProps> = ({ markers, center, onMarkerClick, onMapPan }) => {
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
          onDragstart={onMapPan}
        >
          <MapUpdater center={center} />
          <MyLocationControl />
          {markers.map((marker) => (
             <AdvancedMarker 
               key={marker.id} 
               position={{ lat: marker.lat, lng: marker.lng }} 
               title={marker.title}
               onClick={() => onMarkerClick && onMarkerClick(marker.id)}
             >
                <Pin 
                  background={marker.isExpired ? '#4b5563' : (marker.type === 'event' ? '#7b61ff' : (marker.type === 'restaurant' ? '#10b981' : '#00d2ff'))} 
                  borderColor={marker.isExpired ? '#374151' : (marker.type === 'event' ? '#5a42d1' : (marker.type === 'restaurant' ? '#059669' : '#009ebd'))} 
                  glyph={marker.suggested_emoji || (marker.type === 'event' ? '🎫' : (marker.type === 'restaurant' ? '🍜' : '📍'))}
                  glyphColor={marker.isExpired ? '#9ca3af' : '#fff'} 
                />
             </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>
    </div>
  );
};

export default MapDashboard;
