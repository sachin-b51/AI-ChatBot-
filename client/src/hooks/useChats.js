import { useEffect } from 'react';
import { getChats, createChat, deleteChat } from '../api';
import useChatStore from '../store/chatStore';

export const useChats = () => {
  const { chats, setChats, addChat, removeChat, activeChatId, setActiveChatId } = useChatStore();

  useEffect(() => {
    getChats().then(setChats).catch(console.error);
  }, []);

  const handleNewChat = async () => {
    const chat = await createChat();
    addChat(chat);
    setActiveChatId(chat._id);
  };

  const handleDeleteChat = async (id) => {
    await deleteChat(id);
    removeChat(id);
  };

  const handleSelectChat = (id) => {
    setActiveChatId(id);
  };

  return { chats, activeChatId, handleNewChat, handleDeleteChat, handleSelectChat };
};
