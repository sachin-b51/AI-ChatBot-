import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ChatItem = ({ chat, isActive, onSelect, onDelete }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      style={{
        padding: '10px 12px',
        borderRadius: 8,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 2,
        background: isActive
          ? 'rgba(124,111,252,0.18)'
          : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: isActive ? '1px solid rgba(124,111,252,0.3)' : '1px solid transparent',
        transition: 'all 0.15s',
        position: 'relative',
      }}
    >
      <span style={{ fontSize: 14, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: isActive ? '#c9bfff' : 'var(--text-secondary)' }}>
        {chat.title || 'New Chat'}
      </span>
      {hovered && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            background: 'rgba(255,80,80,0.15)', border: 'none',
            color: '#ff6b6b', borderRadius: 6, padding: '2px 6px',
            cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
          }}
        >
          ✕
        </motion.button>
      )}
    </motion.div>
  );
};

export default ChatItem;
