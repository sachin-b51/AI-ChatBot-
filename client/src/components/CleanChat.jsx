import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, Search, Plus, Moon, Sun, Paperclip, 
  File, Globe, X, History, Brain, ChevronDown, Menu
} from 'lucide-react'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import MemoryPanel from './Memory/MemoryPanel'
import { getChats, getChatMessages } from '../api'

// --- Internal Icons (SVG) ---
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const IconHistory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
)
const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)
const IconPaperclip = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
  </svg>
)
const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconFile = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
  </svg>
)
const IconGlobe = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
)
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" 
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)

// --- Consts ---
const RAW_BASE = import.meta.env.VITE_API_URL || '';
const API_BASE = RAW_BASE.replace(/\/api\/?$/, '');
const APP_SECRET = import.meta.env.VITE_APP_SECRET || 'any_random_secret_string';

const MODELS = [
  { id: 'gpt-4o', label: 'GPT-4o (Premium)' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Fast' },
  { id: 'o1-mini', label: 'OpenAI Reasoning' }
];

// --- Sub-Components ---
const TypingDots = () => (
  <div className="flex gap-1 items-center px-4 py-3 bg-white/5 border border-white/5 rounded-2xl w-fit">
    <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:-0.3s]" />
    <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce [animation-delay:-0.15s]" />
    <div className="w-1.5 h-1.5 rounded-full bg-white/20 animate-bounce" />
  </div>
);

const AIMarkdown = ({ content }) => {
  return (
    <div className="prose prose-invert max-w-none text-[15px] leading-relaxed prose-p:my-2 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-accent prose-code:bg-accent/10 prose-code:px-1 prose-code:rounded prose-code:font-normal prose-code:before:content-none prose-code:after:content-none">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, '')}
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              />
            ) : (
              <code className={className} {...props}>{children}</code>
            );
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  );
};

const FilePill = ({ file, onRemove }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white/60 animate-in fade-in zoom-in duration-200">
    <IconFile />
    <span className="max-w-[120px] truncate font-medium">{file.name}</span>
    <button onClick={onRemove} className="hover:text-white transition-colors">
      <IconX />
    </button>
  </div>
);

// --- Main Assistant ---
const CleanChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [files, setFiles] = useState([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [chats, setChats] = useState([]);
  const [memoryOpen, setMemoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    document.body.className = isDarkMode ? 'dark-theme' : 'light-theme';
    fetchChats();
  }, [isDarkMode]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const data = await getChats();
      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chats');
    }
  };

  const jumpToChat = async (chatId) => {
    try {
      const msgs = await getChatMessages(chatId);
      setMessages(msgs);
      setSearchQuery('');
      setSearchResults([]);
    } catch (e) {
      console.error('Failed to load chat');
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`${API_BASE}/api/search?q=${encodeURIComponent(query)}`, {
        headers: { 'x-app-secret': APP_SECRET }
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error('Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const send = async () => {
    if ((!input.trim() && files.length === 0) || isLoading) return;

    const text = input;
    const userMsg = { role: 'user', content: text, files: [...files] };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setFiles([]);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setMessages(prev => [...prev, { role: 'assistant', content: '', status: 'Thinking...' }]);

      const res = await fetch(`${API_BASE}/api/stateless`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-app-secret': APP_SECRET
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: selectedModel,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          stream: true
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      // Clear the "Thinking..." status once streaming starts
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last && last.role === 'assistant') {
          return [...prev.slice(0, -1), { role: 'assistant', content: '' }];
        }
        return prev;
      });

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                assistantText += parsed.token;
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, content: assistantText }];
                  }
                  return prev;
                });
              }
              if (parsed.status) {
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, status: parsed.status }];
                  }
                  return prev;
                });
              }
              if (parsed.sources) {
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant') {
                    return [...prev.slice(0, -1), { ...last, sources: parsed.sources }];
                  }
                  return prev;
                });
              }
            } catch (e) {
              console.warn('Failed to parse SSE chunk');
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant' && last.content === '') {
            return [...prev.slice(0, -1), { role: 'assistant', content: `Error: ${err.message}` }];
          }
          return [...prev, { role: 'assistant', content: `Error: ${err.message}` }];
        });
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleFile = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selected].slice(0, 5));
    e.target.value = '';
  };

  const selectedModelLabel = MODELS.find(m => m.id === selectedModel)?.label || 'Model';

  return (
    <div className="flex bg-[var(--bg-app)] text-[var(--text-base)] h-screen overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-[70] 
        w-[280px] bg-[var(--bg-side)] border-r border-[var(--border-base)]
        flex flex-col transition-transform duration-300 ease-in-out
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setShowMobileSidebar(false)}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg lg:hidden text-white/40"
        >
          <IconX />
        </button>

        <div className="p-4 pt-16 lg:pt-8 flex flex-col h-full overflow-hidden">
          <button
            onClick={() => { setMessages([]); setInput(''); setShowMobileSidebar(false); }}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-[var(--border-base)] 
                       hover:bg-white/5 transition-all text-sm font-medium mb-6 bg-white/5`}
          >
            <IconPlus />
            <span>New Chat</span>
          </button>

          {/* Search Bar */}
          <div className="relative mb-6">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              <IconSearch />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search history..."
              className="w-full bg-white/5 border border-[var(--border-base)] rounded-xl py-2.5 pl-9 pr-3 
                         text-xs focus:border-accent/40 outline-none transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            <h3 className="px-3 text-[10px] font-bold opacity-30 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <History className="w-3 h-3" />
              {searchQuery ? 'Results' : 'History'}
            </h3>

            {searchQuery ? (
              <div className="space-y-4">
                {isSearching ? (
                  <p className="px-3 text-[10px] text-accent animate-pulse">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-3 text-[10px] opacity-40 italic">No matches</p>
                ) : (
                  searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => { jumpToChat(res.chatId); setShowMobileSidebar(false); }}
                      className="w-full text-left px-3 py-3 rounded-xl bg-accent/5 border border-accent/10 hover:bg-accent/10 transition-all group"
                    >
                      <p className="text-[11px] text-accent font-medium mb-1 truncate capitalize">Match Found</p>
                      <p className="text-[12px] opacity-70 line-clamp-2 leading-relaxed">"{res.content}"</p>
                    </button>
                  ))
                )}
              </div>
            ) : chats.length === 0 ? (
              <div className="px-3 py-8 text-center opacity-20 text-xs">No history yet</div>
            ) : (
              chats.map(chat => (
                <button
                  key={chat._id}
                  onClick={() => { jumpToChat(chat._id); setShowMobileSidebar(false); }}
                  className="w-full text-left px-3 py-2.5 rounded-xl text-[13px] opacity-60 hover:opacity-100 hover:bg-white/5 transition-all truncate"
                >
                  {chat.title || 'Untitled Chat'}
                </button>
              ))
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-[var(--border-base)] space-y-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-[13px] font-medium"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <IconMoon /> : <IconSun />}
                <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
            </button>

            <button
              onClick={() => { setMemoryOpen(true); setShowMobileSidebar(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-accent/10 hover:text-accent transition-all text-[13px] font-medium group"
            >
              <Brain className="w-4 h-4 text-white/20 group-hover:text-accent" />
              <span>AI Memory</span>
            </button>

            <div className="px-4 py-4 rounded-2xl bg-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent to-purple-600 shadow-lg shadow-accent/20" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate">User</p>
                <p className="text-[10px] opacity-30 uppercase tracking-widest font-bold">Standard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        
        {/* Mobile Header */}
        <header className="h-14 border-b border-[var(--border-base)] flex items-center justify-between px-4 shrink-0 bg-[var(--bg-app)]/80 backdrop-blur-md z-40 lg:hidden">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMobileSidebar(true)}
              className="p-2 hover:bg-white/5 rounded-lg text-white/60"
            >
              <IconMenu />
            </button>
            <h1 className="text-sm font-semibold text-white/90">AI Chat</h1>
          </div>
          <button 
            onClick={() => { setMessages([]); setInput('') }}
            className="p-2 hover:bg-white/5 rounded-lg text-white/40"
          >
            <IconPlus />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 border-b border-[var(--border-base)] items-center justify-between px-8 shrink-0 bg-[var(--bg-app)]/80 backdrop-blur-md z-40">
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-white/90 uppercase tracking-[0.2em]">Railway Cloud Assistant</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[9px] text-white/20 uppercase tracking-[0.15em] font-bold">Live Status • Hybrid v1.2</span>
            </div>
          </div>
        </header>

        {/* --- Messages Area --- */}
        <div className="flex-1 overflow-y-auto w-full scroll-smooth custom-scrollbar">
          <div className="max-w-[800px] mx-auto px-4 lg:px-8 py-10 flex flex-col gap-10">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/10 text-2xl font-light">
                  ✦
                </div>
                <p className="text-white/10 text-sm font-medium tracking-wide">Tell me anything, I'm here to help.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
                {msg.role === 'user' && (
                  <div className="flex justify-end w-full">
                    <div className="flex flex-col gap-2 items-end max-w-[92%] lg:max-w-[85%]">
                      {msg.files?.length > 0 && (
                        <div className="flex flex-wrap gap-2 justify-end">
                          {msg.files.map((f, fi) => (
                            <div key={fi}
                              className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-white/30">
                              <IconFile />
                              <span className="max-w-[120px] truncate">{f.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.content && (
                        <div className={`${isDarkMode ? 'bg-white text-black font-medium' : 'bg-accent text-white shadow-xl shadow-accent/10'} 
                                        rounded-2xl rounded-br-sm px-4 py-3 text-[14.5px] lg:text-[15.5px] leading-relaxed break-words`}>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' && (
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">assistant</span>
                      {msg.status && (
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                          <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                          <span className="text-[9px] text-amber-500/80 font-bold uppercase">{msg.status}</span>
                        </div>
                      )}
                    </div>

                    {msg.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {msg.sources.map((s, si) => (
                          <a key={si} href={s.link || s.url} target="_blank" rel="noreferrer"
                             className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-[10px] text-white/40 font-medium">
                            <IconGlobe />
                            <span className="truncate">{s.title || 'Source'}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    <div className="text-white/90 overflow-hidden">
                      {msg.content === '' && !msg.status ? <TypingDots /> : <AIMarkdown content={msg.content} />}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex flex-col gap-1 w-full">
                <span className="text-[10px] text-white/20 mb-1 font-black uppercase tracking-widest">assistant</span>
                <TypingDots />
              </div>
            )}

            <div ref={bottomRef} className="h-20" />
          </div>
        </div>

        {/* --- Input Area --- */}
        <div className="px-4 pb-8 pt-4 w-full bg-gradient-to-t from-[var(--bg-app)] via-[var(--bg-app)] to-transparent">
          <div className="max-w-[760px] mx-auto w-full">
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 px-1">
                {files.map((f, i) => (
                  <FilePill key={i} file={f} onRemove={() => setFiles(prev => prev.filter((_, j) => j !== i))} />
                ))}
              </div>
            )}

            <div className={`relative flex flex-col bg-[var(--bg-card)] border border-[var(--border-base)]
                            rounded-3xl overflow-hidden shadow-2xl shadow-black/40
                            focus-within:border-accent/40 transition-all duration-300`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Message assistant..."
                rows={1}
                className="w-full bg-transparent border-none focus:ring-0 text-[14.5px] lg:text-[15.5px]
                           px-6 py-5 min-h-[64px] max-h-56 resize-none placeholder:text-white/10"
              />

              <div className="flex items-center justify-between px-5 pb-4">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 hover:bg-white/5 rounded-xl text-white/20 hover:text-white/50 transition-all"
                    title="Upload file"
                  >
                    <IconPaperclip />
                  </button>
                  
                  <div className="relative group">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-white/5 text-[11px] font-bold text-white/20 hover:text-white/60 transition-all uppercase tracking-wider">
                      {selectedModelLabel}
                      <IconChevronDown />
                    </button>
                    <div className="absolute bottom-full left-0 mb-3 w-52 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                      {MODELS.map(m => (
                        <button 
                          key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          className={`w-full text-left px-5 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors ${selectedModel === m.id ? 'text-accent bg-accent/5' : 'text-white/40'}`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-white/5 hidden sm:inline font-bold uppercase tracking-[0.2em]">Enter to send</span>
                  <button
                    onClick={send}
                    disabled={(!input.trim() && files.length === 0) || isLoading}
                    className={`p-3 rounded-2xl transition-all duration-300 ${
                      (!input.trim() && files.length === 0) || isLoading
                        ? 'bg-white/5 text-white/5'
                        : 'bg-white text-black hover:scale-105 active:scale-95 shadow-xl shadow-white/5'
                    }`}
                  >
                    {isLoading ? <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" /> : <IconSend />}
                  </button>
                </div>
              </div>
            </div>
            
            <p className="mt-4 text-[9px] text-center text-white/5 uppercase tracking-[0.3em] font-black italic">
              AI intelligence is an experimental tool.
            </p>
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFile} multiple className="hidden" />

      <MemoryPanel isOpen={memoryOpen} onClose={() => setMemoryOpen(false)} />
    </div>
  );
};

export default CleanChat;
