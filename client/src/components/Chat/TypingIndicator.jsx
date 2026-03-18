import React from 'react';
import { motion } from 'framer-motion';

const TypingIndicator = () => (
  <div style={{ display: 'flex', padding: '4px 20px', alignItems: 'flex-end', gap: 4 }}>
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        style={{
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--accent)', display: 'inline-block',
        }}
      />
    ))}
  </div>
);

export default TypingIndicator;
