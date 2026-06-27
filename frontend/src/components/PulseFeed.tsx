import React from 'react';
import { Activity } from 'lucide-react';

export interface FeedItem {
  id: string;
  title: string;
  location: string;
  tags: string[];
  lat?: number;
  lng?: number;
}

interface PulseFeedProps {
  items: FeedItem[];
  onItemClick?: (item: FeedItem) => void;
}

const PulseFeed: React.FC<PulseFeedProps> = ({ items, onItemClick }) => {
  return (
    <div className="pulse-feed" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
      <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'white' }}>
        <Activity size={16} style={{ color: 'var(--accent-color)' }} /> Verified Spot Feed
      </h2>
      
      <div className="feed-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed var(--panel-border)' }}>
            <p style={{ fontSize: '13px' }}>No spots verified on your map yet.</p>
            <p style={{ fontSize: '11px', marginTop: '4px' }}>Drag in a flyer to populate local hotspots!</p>
          </div>
        ) : (
          items.map((item) => (
            <div 
              key={item.id} 
              className="feed-item" 
              onClick={() => onItemClick?.(item)}
              style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--panel-border)',
                borderRadius: '12px',
                padding: '12px',
                display: 'flex',
                gap: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <div 
                className="feed-image"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: item.tags.includes('event') ? 'linear-gradient(135deg, #7b61ff 0%, #3b2bc5 100%)' : 'linear-gradient(135deg, #00d2ff 0%, #007699 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  fontFamily: 'Outfit, sans-serif'
                }}
              >
                {item.title.charAt(0)}
              </div>
              <div className="feed-content" style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.location}</p>
                <div className="tag-container" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {item.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="tag"
                      style={{
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-secondary)'
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PulseFeed;
