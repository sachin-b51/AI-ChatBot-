import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SourcesPanel = ({ sources }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: 4 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'rgba(124,111,252,0.12)', border: '1px solid rgba(124,111,252,0.25)',
          borderRadius: 6, color: '#a89dff', cursor: 'pointer', padding: '4px 10px',
          fontSize: 12, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5,
        }}
      >
        🌐 {sources.length} web source{sources.length !== 1 ? 's' : ''} {open ? '▲' : '▼'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
              {sources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'block', padding: '8px 12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 8, textDecoration: 'none',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#a89dff', marginBottom: 2 }}>
                    {src.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>
                    {src.url}
                  </div>
                  {src.description && (
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {src.description}
                    </div>
                  )}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SourcesPanel;
