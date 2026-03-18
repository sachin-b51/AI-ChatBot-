import React from 'react';
import { motion } from 'framer-motion';

const suggestions = [
  { icon: '💡', text: 'Explain quantum computing simply' },
  { icon: '📰', text: "What's in the news today?" },
  { icon: '💻', text: 'Write a Python script for a todo app' },
  { icon: '🌤️', text: "What's the weather like in Paris?" },
];

const EmptyState = ({ onSuggestion }) => (
  <div
    style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 24px',
    }}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: 'spring' }}
      style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'linear-gradient(135deg, #7c6ffc, #c45cff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 30, marginBottom: 20,
        boxShadow: '0 0 40px var(--accent-glow)',
      }}
    >
      ✦
    </motion.div>

    <motion.h2
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center' }}
    >
      How can I help you today?
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32, textAlign: 'center' }}
    >
      Ask me anything. I'll search the web automatically for fresh info.
    </motion.p>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 520, width: '100%' }}>
      {suggestions.map((s, i) => (
        <motion.button
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.07 }}
          whileHover={{ background: 'rgba(124,111,252,0.15)', borderColor: 'rgba(124,111,252,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onSuggestion && onSuggestion(s.text)}
          style={{
            padding: '12px 14px', background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--glass-border)', borderRadius: 12,
            color: 'var(--text-secondary)', cursor: 'pointer', textAlign: 'left',
            fontFamily: 'inherit', fontSize: 13, lineHeight: 1.5, transition: 'all 0.2s',
          }}
        >
          <span style={{ marginRight: 8 }}>{s.icon}</span>{s.text}
        </motion.button>
      ))}
    </div>
  </div>
);

export default EmptyState;
