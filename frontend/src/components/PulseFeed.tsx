import React from 'react';
import { Activity } from 'lucide-react';

const mockFeed = [
  {
    id: '1',
    title: 'Neon Jazz Night',
    location: 'Shibuya Underground',
    tags: ['jazz', 'cyberpunk', 'live'],
  },
  {
    id: '2',
    title: 'Secret Ramen Pop-up',
    location: 'Harajuku Alley',
    tags: ['food', 'hidden', 'cheap'],
  }
];

const PulseFeed: React.FC = () => {
  return (
    <div className="pulse-feed">
      <h2><Activity size={20} color="var(--accent-color)" /> Pulse Feed</h2>
      
      <div className="feed-list">
        {mockFeed.map((item) => (
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
