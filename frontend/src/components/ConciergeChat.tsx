import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface Message {
  id: string;
  sender: 'user' | 'concierge';
  text: string;
  timestamp: Date;
}

interface ConciergeChatProps {
  onLocationAdded?: () => void;
}

// Simple helper to format basic Markdown bold, bullet points, and headers into React
const formatMessageText = (text: string) => {
  if (!text) return '';
  
  const lines = text.split('\n');
  return lines.map((line, i) => {
    let cleanLine = line.trim();
    
    // Check for bullet point
    if (cleanLine.startsWith('* ') || cleanLine.startsWith('- ')) {
      const content = cleanLine.substring(2);
      return (
        <li key={i} style={{ marginLeft: '16px', listStyleType: 'disc', margin: '4px 0', fontSize: '13.5px', color: '#e2e8f0' }}>
          {parseInlineMarkdown(content)}
        </li>
      );
    }
    
    // Check for header
    if (cleanLine.startsWith('### ')) {
      return (
        <h4 key={i} style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginTop: '12px', marginBottom: '4px' }}>
          {parseInlineMarkdown(cleanLine.substring(4))}
        </h4>
      );
    }
    if (cleanLine.startsWith('## ')) {
      return (
        <h3 key={i} style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginTop: '16px', marginBottom: '8px' }}>
          {parseInlineMarkdown(cleanLine.substring(3))}
        </h3>
      );
    }
    
    // Standard paragraph
    return (
      <p key={i} style={{ fontSize: '13.5px', lineHeight: 1.5, marginBottom: '8px', color: '#f1f5f9', minHeight: '1em' }}>
        {parseInlineMarkdown(line)}
      </p>
    );
  });
};

const parseInlineMarkdown = (text: string) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  
  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    parts.push(<strong key={match.index} style={{ fontWeight: 700, color: '#a594fd' }}>{match[1]}</strong>);
    lastIndex = boldRegex.lastIndex;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : text;
};

const SUGGESTIONS = [
  "What cool events are happening in Tokyo?",
  "Recommend a restaurant with cozy vibes.",
  "Suggest a custom itinerary for tonight.",
  "What spot has the highest rating?"
];

const ConciergeChat: React.FC<ConciergeChatProps> = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'concierge',
      text: "Hello! I am **LocusGuide**, your hyper-local Tokyo AI concierge. I can plan dates, craft itineraries, or recommend spots using ONLY verified flyers and menus added to our map. Ask me anything!",
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate or retrieve Session ID on mount
  useEffect(() => {
    let savedSession = localStorage.getItem('locus_gemini_session_id');
    if (!savedSession) {
      savedSession = 'session_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('locus_gemini_session_id', savedSession);
    }
    setSessionId(savedSession);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;
    
    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          session_id: sessionId
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        const conciergeMsg: Message = {
          id: 'msg_' + Date.now() + '_reply',
          sender: 'concierge',
          text: result.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, conciergeMsg]);
      } else {
        throw new Error(result.message || 'Failed to get reply');
      }
    } catch (err) {
      console.error('Chat failed:', err);
      const errorMsg: Message = {
        id: 'msg_' + Date.now() + '_err',
        sender: 'concierge',
        text: "I apologize, but I encountered an error communicating with my system. Please ensure the backend is running.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputText);
    }
  };

  return (
    <div className="concierge-chat-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      <div className="chat-messages-container" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '12px' }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`chat-bubble-wrapper ${msg.sender === 'user' ? 'user-align' : 'concierge-align'}`}
              style={{
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: '16px'
              }}
            >
              <div 
                className={`chat-bubble ${msg.sender === 'user' ? 'user-bubble' : 'concierge-bubble'}`}
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  position: 'relative',
                  background: msg.sender === 'user' ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.04)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--panel-border)',
                  boxShadow: msg.sender === 'user' ? '0 4px 15px rgba(123, 97, 255, 0.25)' : 'none'
                }}
              >
                {msg.sender === 'concierge' && (
                  <div 
                    className="bubble-sparkle"
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      left: '-6px',
                      background: 'linear-gradient(135deg, #7b61ff 0%, #00d2ff 100%)',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 2px 6px rgba(123, 97, 255, 0.4)'
                    }}
                  >
                    <Sparkles size={10} />
                  </div>
                )}
                <div className="bubble-text">
                  {formatMessageText(msg.text)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}
          >
            <div 
              className="chat-bubble concierge-bubble"
              style={{
                padding: '12px 16px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--panel-border)'
              }}
            >
              <div className="typing-indicator" style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '18px' }}>
                <span className="dot" style={{ width: '6px', height: '6px', background: '#9ea3b0', borderRadius: '50%' }}></span>
                <span className="dot" style={{ width: '6px', height: '6px', background: '#9ea3b0', borderRadius: '50%' }}></span>
                <span className="dot" style={{ width: '6px', height: '6px', background: '#9ea3b0', borderRadius: '50%' }}></span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={chatEndRef} />
      </div>

      {messages.length <= 2 && !isLoading && (
        <div className="suggestions-container" style={{ marginBottom: '16px' }}>
          <p className="suggestions-title" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MessageSquare size={10} /> Quick suggestions
          </p>
          <div className="suggestion-chips" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {SUGGESTIONS.map((suggestion, idx) => (
              <button
                key={idx}
                className="suggestion-chip"
                style={{
                  background: 'rgba(123, 97, 255, 0.08)',
                  border: '1px solid rgba(123, 97, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: '#c4b5fd',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
                onClick={() => handleSendMessage(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div 
        className="chat-input-container" 
        style={{ 
          display: 'flex', 
          gap: '8px', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid var(--panel-border)', 
          borderRadius: '12px', 
          padding: '4px 8px 4px 12px', 
          alignItems: 'center' 
        }}
      >
        <input
          type="text"
          className="chat-input"
          placeholder="Ask LocusGuide to build an itinerary..."
          style={{
            flex: 1,
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'white',
            fontSize: '13px',
            padding: '8px 0',
            fontFamily: 'inherit'
          }}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button
          className="chat-send-btn"
          style={{
            background: inputText.trim() ? 'var(--accent-color)' : 'rgba(255, 255, 255, 0.04)',
            color: inputText.trim() ? 'white' : '#555',
            border: 'none',
            borderRadius: '8px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: inputText.trim() && !isLoading ? 'pointer' : 'default',
            transition: 'all 0.2s ease'
          }}
          onClick={() => handleSendMessage(inputText)}
          disabled={!inputText.trim() || isLoading}
        >
          <Send size={12} />
        </button>
      </div>
    </div>
  );
};

export default ConciergeChat;
