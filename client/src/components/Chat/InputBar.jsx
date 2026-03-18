import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const InputBar = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setValue(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 160) + 'px';
    }
  };

  return (
    <div style={{ padding: '12px 20px 20px' }}>
      <div
        style={{
          display: 'flex', alignItems: 'flex-end', gap: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid var(--glass-border)',
          borderRadius: 16, padding: '10px 14px',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
          transition: 'border-color 0.2s',
        }}
        onFocus={() => {}}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={disabled ? 'Thinking…' : 'Message ChatClone…'}
          rows={1}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text-primary)', resize: 'none', fontFamily: 'inherit',
            fontSize: 15, lineHeight: 1.6, padding: '2px 0', maxHeight: 160,
            overflowY: 'auto',
          }}
        />
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: disabled || !value.trim()
              ? 'rgba(255,255,255,0.08)'
              : 'linear-gradient(135deg, #7c6ffc, #c45cff)',
            color: 'white', fontSize: 16, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s',
          }}
        >
          ↑
        </motion.button>
      </div>
      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0' }}>
        AI can make mistakes. Auto web search activates for time-sensitive queries.
      </p>
    </div>
  );
};

export default InputBar;
