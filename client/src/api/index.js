import axios from 'axios';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
const SECRET = import.meta.env.VITE_APP_SECRET || '';

const api = axios.create({
  baseURL: `${BASE}/api`,
  headers: { 'x-app-secret': SECRET },
});

// Chats
export const getChats = () => api.get('/chats').then(r => r.data);
export const createChat = () => api.post('/chats').then(r => r.data);
export const deleteChat = (id) => api.delete(`/chats/${id}`);
export const renameChat = (id, title) => api.patch(`/chats/${id}/title`, { title }).then(r => r.data);

// Messages
export const getMessages = (chatId) => api.get(`/chats/${chatId}/messages`).then(r => r.data);

// Memories
export const getMemories = () => api.get('/memories').then(r => r.data);
export const updateMemory = (id, content) => api.patch(`/memories/${id}`, { content }).then(r => r.data);
export const deleteMemory = (id) => api.delete(`/memories/${id}`).then(r => r.data);

// Search
export const searchMessages = (query) => api.get(`/search?q=${encodeURIComponent(query)}`).then(r => r.data);

// Streaming send — returns a fetch Response for SSE
export const sendMessageStream = (chatId, content) => {
  return fetch(`${BASE}/api/chats/${chatId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-secret': SECRET,
    },
    body: JSON.stringify({ content }),
  });
};

export default api;
