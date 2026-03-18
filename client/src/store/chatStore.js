import { create } from 'zustand';

const useChatStore = create((set, get) => ({
  chats: [],
  activeChatId: null,
  messages: [],
  isStreaming: false,

  setChats: (chats) => set({ chats }),
  setActiveChatId: (id) => set({ activeChatId: id, messages: [] }),
  setMessages: (messages) => set({ messages }),
  setIsStreaming: (val) => set({ isStreaming: val }),

  addChat: (chat) => set((s) => ({ chats: [chat, ...s.chats] })),
  removeChat: (id) =>
    set((s) => ({
      chats: s.chats.filter((c) => c._id !== id),
      activeChatId: s.activeChatId === id ? null : s.activeChatId,
      messages: s.activeChatId === id ? [] : s.messages,
    })),
  updateChatTitle: (id, title) =>
    set((s) => ({
      chats: s.chats.map((c) => (c._id === id ? { ...c, title } : c)),
    })),
  touchChat: (id) =>
    set((s) => ({
      chats: [
        { ...s.chats.find((c) => c._id === id) },
        ...s.chats.filter((c) => c._id !== id),
      ].filter(Boolean),
    })),

  appendUserMessage: (content) =>
    set((s) => ({
      messages: [
        ...s.messages,
        { _id: Date.now() + 'u', role: 'user', content, createdAt: new Date() },
      ],
    })),

  appendStreamingMessage: () =>
    set((s) => ({
      messages: [
        ...s.messages,
        { _id: Date.now() + 'a', role: 'assistant', content: '', streaming: true, sources: [] },
      ],
    })),

  appendToken: (token) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last?.streaming) {
        msgs[msgs.length - 1] = { ...last, content: last.content + token };
      }
      return { messages: msgs };
    }),

  finalizeStreamingMessage: (sources) =>
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last?.streaming) {
        msgs[msgs.length - 1] = { ...last, streaming: false, sources: sources || [], webSearchUsed: (sources || []).length > 0 };
      }
      return { messages: msgs, isStreaming: false };
    }),
}));

export default useChatStore;
