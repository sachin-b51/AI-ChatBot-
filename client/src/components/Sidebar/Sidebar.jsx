import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatItem from './ChatItem';

const Sidebar = ({ chats, activeChatId, onNew, onSelect, onDelete }) => {
  return (
    <aside
      style={{
        width: '260px',
        minWidth: '260px',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--glass-border)',
        background: 'rgba(255,255,255,0.02)',
        position: 'relative',
        zIndex: 10,
      }}
    >
      {/* Header */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid var(--glass-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #7c6ffc, #c45cff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>✦</div>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>ChatClone</span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, background: 'rgba(124,111,252,0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onNew}
          style={{
            width: '100%', padding: '10px 14px',
            background: 'rgba(124,111,252,0.15)',
            border: '1px solid rgba(124,111,252,0.4)',
            borderRadius: 10, color: '#a89dff',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Chat
        </motion.button>
      </div>

      {/* Chat list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
        {chats.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            No conversations yet
          </p>
        )}
        <AnimatePresence>
          {chats.map((chat) => (
            <ChatItem
              key={chat._id}
              chat={chat}
              isActive={chat._id === activeChatId}
              onSelect={() => onSelect(chat._id)}
              onDelete={() => onDelete(chat._id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </aside>
  );
};

export default Sidebar;
