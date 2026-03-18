import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SourcesPanel from './SourcesPanel';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        padding: '4px 20px',
        maxWidth: '100%',
      }}
    >
      <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Avatar label */}
        <span style={{
          fontSize: 11, color: 'var(--text-muted)', fontWeight: 600,
          textAlign: isUser ? 'right' : 'left', letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {isUser ? 'You' : 'AI'}
        </span>

        {/* Bubble */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            background: isUser
              ? 'linear-gradient(135deg, #7c6ffc, #9d6fff)'
              : 'rgba(255,255,255,0.06)',
            border: isUser ? 'none' : '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            fontSize: 15,
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            backdropFilter: isUser ? 'none' : 'blur(8px)',
          }}
        >
          {message.content}
          {message.streaming && (
            <span style={{
              display: 'inline-block', width: 2, height: 16,
              background: '#a89dff', marginLeft: 2, verticalAlign: 'middle',
              animation: 'blink 0.8s step-end infinite',
            }} />
          )}
        </div>

        {/* Sources */}
        {message.webSearchUsed && message.sources?.length > 0 && (
          <SourcesPanel sources={message.sources} />
        )}
      </div>

      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>
    </motion.div>
  );
};

export default MessageBubble;
