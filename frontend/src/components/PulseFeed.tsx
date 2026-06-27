import React from 'react';
import { Activity } from 'lucide-react';

export interface FeedItem {
  id: string;
  title: string;
  location: string;
  tags: string[];
}

interface PulseFeedProps {
  items: FeedItem[];
}

const PulseFeed: React.FC<PulseFeedProps> = ({ items }) => {
  return (
    <div className="pulse-feed">
      <h2><Activity size={20} color="var(--accent-color)" /> Pulse Feed</h2>
      
      <div className="feed-list">
        {items.map((item) => (
          <div key={item.id} className="feed-item">
            <div className="feed-image"></div>
            <div className="feed-content">
              <h3>{item.title}</h3>
              <p>{item.location}</p>
              <div className="tag-container">
                {item.tags.map(tag => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PulseFeed;
