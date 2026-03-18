import React, { useCallback } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import ChatWindow from '../components/Chat/ChatWindow';
import InputBar from '../components/Chat/InputBar';
import EmptyState from '../components/UI/EmptyState';
import { useChats } from '../hooks/useChats';
import { useChat } from '../hooks/useChat';
import { createChat } from '../api';
import useChatStore from '../store/chatStore';

const HomePage = () => {
  const { chats, activeChatId, handleNewChat, handleDeleteChat, handleSelectChat } = useChats();
  const { messages, sendMessage, isStreaming } = useChat();
  const { addChat, setActiveChatId } = useChatStore();

  const handleSuggestion = useCallback(async (text) => {
    let chatId = useChatStore.getState().activeChatId;
    if (!chatId) {
      const newChat = await createChat();
      addChat(newChat);
      setActiveChatId(newChat._id);
      await new Promise(r => setTimeout(r, 50));
    }
    sendMessage(text);
  }, [sendMessage, addChat, setActiveChatId]);

  const activeChat = chats.find(c => c._id === activeChatId);

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Background orbs */}
      <div className="bg-orb" style={{ width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,111,252,0.15) 0%, transparent 70%)', top: -100, left: -100 }} />
      <div className="bg-orb" style={{ width: 400, height: 400, background: 'radial-gradient(circle, rgba(196,92,255,0.1) 0%, transparent 70%)', bottom: -80, right: -80 }} />

      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onNew={handleNewChat}
        onSelect={handleSelectChat}
        onDelete={handleDeleteChat}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--glass-border)',
          display: 'flex', alignItems: 'center', gap: 10, minHeight: 56,
        }}>
          <span style={{ color: activeChatId ? 'var(--text-secondary)' : 'var(--text-muted)', fontSize: 14 }}>
            {activeChat ? activeChat.title : 'ChatClone'}
          </span>
        </div>

        {activeChatId ? (
          <>
            <ChatWindow messages={messages} isStreaming={isStreaming} />
            <InputBar onSend={sendMessage} disabled={isStreaming} />
          </>
        ) : (
          <EmptyState onSuggestion={handleSuggestion} />
        )}
      </main>
    </div>
  );
};

export default HomePage;
