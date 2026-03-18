import { useEffect } from 'react';
import { getMessages, sendMessageStream } from '../api';
import useChatStore from '../store/chatStore';

export const useChat = () => {
  const {
    activeChatId,
    messages,
    setMessages,
    isStreaming,
    setIsStreaming,
    appendUserMessage,
    appendStreamingMessage,
    appendToken,
    finalizeStreamingMessage,
    updateChatTitle,
    touchChat,
    chats,
  } = useChatStore();

  // Load messages whenever active chat changes
  useEffect(() => {
    if (!activeChatId) return;
    getMessages(activeChatId).then(setMessages).catch(console.error);
  }, [activeChatId]);

  const sendMessage = async (content) => {
    if (!content.trim() || !activeChatId || isStreaming) return;

    setIsStreaming(true);
    appendUserMessage(content);
    appendStreamingMessage();

    try {
      const response = await sendMessageStream(activeChatId, content);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let sourcesFromStream = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const data = JSON.parse(raw);
            if (data.sources) {
              sourcesFromStream = data.sources;
            } else if (data.token) {
              appendToken(data.token);
            } else if (data.done) {
              finalizeStreamingMessage(sourcesFromStream);
            } else if (data.error) {
              console.error('Stream error:', data.error);
              finalizeStreamingMessage([]);
            }
          } catch {
            // ignore partial JSON
          }
        }
      }
    } catch (err) {
      console.error('sendMessage error:', err);
      finalizeStreamingMessage([]);
    }

    // Refresh chat list order & title after message
    touchChat(activeChatId);
  };

  return { messages, sendMessage, isStreaming };
};
