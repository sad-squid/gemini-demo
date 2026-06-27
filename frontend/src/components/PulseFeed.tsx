import React, { useState } from 'react';
import { Activity, SlidersHorizontal, Calendar, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react';

export interface FeedItem {
  id: string;
  title: string;
  location: string;
  tags: string[];
  lat?: number;
  lng?: number;
  sourceImage?: string;
  date_time?: string;
  event_dates?: string[];
}

interface PulseFeedProps {
  items: FeedItem[];
  onItemClick?: (item: FeedItem) => void;
  isLoading?: boolean; // Point 1: Loading state indicator
}

// Helper to extract all valid dates from a localized natural-language text string
const extractDatesFromText = (text: string): Date[] => {
  const dates: Date[] = [];
  const lowercaseText = text.toLowerCase();
  
  // 1. Check for year in text (e.g. 2026)
  let year = 2026;
  const yearMatch = text.match(/\b(20\d{2})\b/);
  if (yearMatch) {
    year = parseInt(yearMatch[1]);
  }
  
  // 2. Match standard ISO or slash/dash patterns (e.g. 2026/06/06 or 2026-06-06)
  const isoPattern = /\b(20\d{2})[-/](0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])\b/g;
  let match;
  while ((match = isoPattern.exec(text)) !== null) {
    const y = parseInt(match[1]);
    const m = parseInt(match[2]) - 1;
    const d = parseInt(match[3]);
    dates.push(new Date(y, m, d));
  }
  
  // 3. Match US style dates (e.g. 06/06/2026)
  const usPattern = /\b(0?[1-9]|1[0-2])[-/](0?[1-9]|[12]\d|3[01])[-/](20\d{2})\b/g;
  while ((match = usPattern.exec(text)) !== null) {
    const m = parseInt(match[1]) - 1;
    const d = parseInt(match[2]);
    const y = parseInt(match[3]);
    dates.push(new Date(y, m, d));
  }

  // 4. Match month-day patterns (e.g. "June 12" or "June 12, 2026")
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const shortMonths = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  
  const monthNamesRegex = months.concat(shortMonths).join('|');
  const monthDayPattern = new RegExp(`\\b(${monthNamesRegex})\\s*(\\d{1,2})\\b`, 'gi');
  
  while ((match = monthDayPattern.exec(lowercaseText)) !== null) {
    const monthStr = match[1];
    const day = parseInt(match[2]);
    
    let m = months.indexOf(monthStr);
    if (m === -1) {
      m = shortMonths.indexOf(monthStr);
    }
    
    if (m !== -1 && day >= 1 && day <= 31) {
      dates.push(new Date(year, m, day));
    }
  }
  
  return dates;
};

// Utility to parse dates and calculate estimated days from June 27, 2026 (User's context local time)
const getDaysFromToday = (dateTimeStr?: string, eventDates?: string[]): number => {
  const todayDate = new Date('2026-06-27');
  const todayMidnight = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());
  
  if (eventDates && eventDates.length > 0) {
    let minDays = 999;
    for (const d of eventDates) {
      try {
        const eventDate = new Date(d);
        const eventDateMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        const diffTime = eventDateMidnight.getTime() - todayMidnight.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < minDays) {
          minDays = diffDays;
        }
      } catch (e) {
        // ignore invalid dates
      }
    }
    if (minDays !== 999) return minDays;
  }

  if (!dateTimeStr) return 999; // Venues/Hours default to always visible
  
  const text = dateTimeStr.toLowerCase();
  
  if (text.includes('today') || text.includes('tonight')) return 0;
  if (text.includes('tomorrow')) return 1;
  
  // Simple weekday matching
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayIndex = 6; // June 27, 2026 is Saturday
  
  for (let i = 0; i < 7; i++) {
    if (text.includes(daysOfWeek[i])) {
      const targetIndex = i;
      let diff = targetIndex - todayIndex;
      if (diff < 0) diff += 7;
      return diff;
    }
  }
  
  // Extract and match all potential month-day occurrences inside the text
  const parsedDates = extractDatesFromText(dateTimeStr);
  if (parsedDates.length > 0) {
    let minDays = 999;
    for (const d of parsedDates) {
      const dMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffTime = dMidnight.getTime() - todayMidnight.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < minDays) {
        minDays = diffDays;
      }
    }
    if (minDays !== 999) return minDays;
  }
  
  return 999; // Fallback
};

// Utility to determine if an event is in the past (before June 27, 2026)
export const isEventExpired = (dateTimeStr?: string, eventDates?: string[]): boolean => {
  const todayDate = new Date('2026-06-27');
  const todayMidnight = new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate());

  if (eventDates && eventDates.length > 0) {
    return eventDates.every(d => {
      try {
        const eventDate = new Date(d);
        const eventDateMidnight = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDateMidnight.getTime() < todayMidnight.getTime();
      } catch (e) {
        return true;
      }
    });
  }

  if (!dateTimeStr) return false;
  
  const text = dateTimeStr.toLowerCase();
  
  if (text.includes('today') || text.includes('tonight') || text.includes('tomorrow')) {
    return false;
  }
  
  const parsedDates = extractDatesFromText(dateTimeStr);
  if (parsedDates.length > 0) {
    // It is expired if and only if EVERY single parsed date is strictly in the past
    return parsedDates.every(d => {
      const dMidnight = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return dMidnight.getTime() < todayMidnight.getTime();
    });
  }
  
  return false;
};

const PulseFeed: React.FC<PulseFeedProps> = ({ items, onItemClick, isLoading = false }) => {
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [maxDays, setMaxDays] = useState<number>(30); // 30 represents "Anytime"

  // Filter items chronologically: Keep non-events visible, filter events based on slider
  const filteredItems = items.filter(item => {
    const isEvent = item.tags.includes('event');
    if (!isEvent) return true; // Keep venues/restaurants always visible
    
    if (maxDays === 30) return true; // Anytime option (shows both upcoming and expired events)
    
    // Expired events are filtered out on future-focused timeline views
    const isExpired = isEventExpired(item.date_time, item.event_dates);
    if (isExpired) return false;
    
    const daysAway = getDaysFromToday(item.date_time, item.event_dates);
    return daysAway <= maxDays;
  });

  // Sort items: upcoming/active first, expired events at the bottom of the feed
  const sortedItems = [...filteredItems].sort((a, b) => {
    const aExpired = a.tags.includes('event') && isEventExpired(a.date_time, a.event_dates);
    const bExpired = b.tags.includes('event') && isEventExpired(b.date_time, b.event_dates);
    if (aExpired && !bExpired) return 1;
    if (!aExpired && bExpired) return -1;
    return 0;
  });

  const getFilterLabel = () => {
    if (maxDays === 0) return 'Happening Today 📍';
    if (maxDays === 1) return 'Happening by Tomorrow 🌅';
    if (maxDays === 7) return 'Within the Next Week 📅';
    if (maxDays === 14) return 'Within 2 Weeks 🗓️';
    if (maxDays === 30) return 'Show Anytime ♾️';
    return `Within next ${maxDays} days`;
  };

  return (
    <div className="pulse-feed" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header section (Renamed to Event Feed with a whimsy Maps touch) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, color: 'white' }}>
          <Activity size={18} style={{ color: 'var(--success-color, #00d2ff)' }} /> Event & Spot Feed
        </h2>
        
        {/* Toggle Filter Panel */}
        <button
          onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          style={{
            background: isFilterExpanded ? 'rgba(0, 210, 255, 0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isFilterExpanded ? 'rgba(0, 210, 255, 0.3)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '20px',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            color: isFilterExpanded ? 'var(--success-color, #00d2ff)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <SlidersHorizontal size={13} />
          <span>Timeline</span>
          {isFilterExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Expandable Date/Time Filter Slider Section (Point 6) */}
      {isFilterExpanded && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} style={{ color: 'var(--success-color)' }} /> Chronological Filter
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 700,
              background: 'rgba(0, 210, 255, 0.1)',
              color: 'var(--success-color, #00d2ff)',
              padding: '3px 8px',
              borderRadius: '20px',
              border: '1px solid rgba(0, 210, 255, 0.15)'
            }}>
              {getFilterLabel()}
            </span>
          </div>

          <input 
            type="range" 
            min="0" 
            max="30" 
            step="1" 
            value={maxDays}
            onChange={(e) => setMaxDays(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: 'rgba(255,255,255,0.1)',
              outline: 'none',
              cursor: 'pointer',
              accentColor: 'var(--success-color, #00d2ff)'
            }}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)', padding: '0 2px' }}>
            <span>Today</span>
            <span>1 Week</span>
            <span>2 Weeks</span>
            <span>Anytime</span>
          </div>
        </div>
      )}

      {/* Main list container */}
      <div className="feed-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
        
        {/* Point 1: Loading state indicator inside the feed */}
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 16px', gap: '12px' }}>
            <div className="google-spinner" style={{
              width: '32px',
              height: '32px',
              border: '3px solid rgba(255, 255, 255, 0.05)',
              borderTop: '3px solid var(--success-color, #00d2ff)',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.02em' }}>
              Fetching active lens metadata...
            </span>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : sortedItems.length === 0 ? (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed var(--panel-border)' }}>
            <Info size={20} style={{ color: 'var(--success-color)', marginBottom: '8px', opacity: 0.8 }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'white' }}>No events or spots found</p>
            <p style={{ fontSize: '11px', marginTop: '4px', color: 'var(--text-secondary)' }}>
              {items.length > 0 ? "Try widening your Timeline filter." : "Drag in a flyer to populate Tokyo hotspots!"}
            </p>
          </div>
        ) : (
          sortedItems.map((item) => {
            const isExpired = item.tags.includes('event') && isEventExpired(item.date_time, item.event_dates);
            
            return (
              <div 
                key={item.id} 
                className="feed-item" 
                onClick={() => onItemClick?.(item)}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--panel-border)',
                  borderRadius: '16px',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: isExpired ? 0.45 : 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                  e.currentTarget.style.borderColor = isExpired ? 'rgba(239, 68, 68, 0.2)' : 'rgba(0, 210, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                  e.currentTarget.style.borderColor = 'var(--panel-border)';
                }}
              >
                <div 
                  className="feed-image"
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    background: item.tags.includes('event') 
                      ? (isExpired ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)' : 'linear-gradient(135deg, #7b61ff 0%, #3b2bc5 100%)')
                      : 'linear-gradient(135deg, #00d2ff 0%, #007699 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    overflow: 'hidden',
                    flexShrink: 0,
                    filter: isExpired ? 'grayscale(1)' : 'none'
                  }}
                >
                  {item.sourceImage ? (
                    <img src={item.sourceImage} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    item.title.charAt(0)
                  )}
                </div>
                
                <div className="feed-content" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'white', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.location}
                  </p>
                  
                  {/* Event Time Hint under Title (if Event) */}
                  {item.tags.includes('event') && item.date_time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ fontSize: '10px', color: isExpired ? '#9ca3af' : 'var(--success-color, #00d2ff)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={10} />
                        <span>{item.date_time}</span>
                      </div>
                      {isExpired && (
                        <span style={{
                          fontSize: '8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          padding: '1px 4px',
                          borderRadius: '4px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          Expired
                        </span>
                      )}
                    </div>
                  )}

                  <div className="tag-container" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {item.tags.slice(0, 3).map(tag => (
                      <span 
                        key={tag} 
                        className="tag"
                        style={{
                          fontSize: '9px',
                          padding: '2px 6px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
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
            );
          })
        )}
      </div>
    </div>
  );
};

export default PulseFeed;
