// ================================================================
//  CleanChat.jsx — Claude-style clean chat UI
//  Adapted for Vite + Express MERN backend
// ================================================================

import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import 'katex/dist/katex.min.css'
import { Brain } from 'lucide-react'
import MemoryPanel from './Memory/MemoryPanel'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// ── available models ──────────────────────────────────────────
const MODELS = [
  { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4' },
  { id: 'claude-opus-4-20250514',   label: 'Claude Opus 4'   },
  { id: 'claude-haiku-4-5-20251001',label: 'Claude Haiku'    },
  { id: 'gpt-4o',                   label: 'GPT-4o'          },
  { id: 'gpt-4o-mini',              label: 'GPT-4o Mini'     },
]

// ── icons (inline SVG — no extra deps) ───────────────────────
const IconPaperclip = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19
             a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
  </svg>
)
const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IconStop = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="3" y="3" width="18" height="18" rx="3"/>
  </svg>
)
const IconChevron = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)
const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const IconFile = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
  </svg>
)
const IconMenu = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
)
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="3" y1="12" x2="21" y2="12"/>
  </svg>
)

const API_BASE = import.meta.env.VITE_API_URL || '';
console.log('Chat App initialized with API_BASE:', API_BASE || '(relative path)');
const IconHistory = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)
const IconGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
)
const IconPlay = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
)
const IconTerminal = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
  </svg>
)
const IconSparkles = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.912 3.876 4.276.621-3.093 3.016.73 4.259L12 12.75l-3.825 2.022.73-4.259-3.093-3.016 4.276-.621L12 3z"/>
    <path d="M5 3l.765 1.55 1.71.248-1.237 1.206.292 1.704L5 6.9 3.47 7.708l.292-1.704L2.525 4.798l1.71-.248L5 3z"/>
  </svg>
)
const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)

// ── code block with copy button ───────────────────────────────
function CodeBlock({ language, children }) {
  const [copied, setCopied] = useState(false)
  const [executionRes, setExecutionRes] = useState(null)
  const [executing, setExecuting] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRun = async () => {
    setExecuting(true)
    setExecutionRes(null)
    try {
      const res = await fetch(`${API_BASE}/api/execute`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-app-secret': import.meta.env.VITE_APP_SECRET || 'any_random_secret_string'
        },
        body: JSON.stringify({ language, code: children })
      })
      const data = await res.json()
      setExecutionRes(data)
    } catch (err) {
      setExecutionRes({ error: 'Failed to run code' })
    } finally {
      setExecuting(false)
    }
  }

  const isExecutable = ['python', 'py', 'javascript', 'js', 'node'].includes(String(language).toLowerCase())

  return (
    <div className="rounded-xl overflow-hidden my-4 border border-[var(--border-base)] shadow-sm group">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-side)] border-b border-[var(--border-base)]">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider">{language || 'code'}</span>
          {isExecutable && (
            <button
              onClick={handleRun}
              disabled={executing}
              className={`flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider 
                         transition-colors py-0.5 px-2 rounded-md border
                         ${executing 
                           ? 'text-zinc-500 border-zinc-700 pointer-events-none' 
                           : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'}`}
            >
              <IconPlay />
              {executing ? 'Running...' : 'Run'}
            </button>
          )}
        </div>
        <button onClick={copy}
          className="text-xs text-[var(--text-muted)] hover:text-[var(--text-base)] transition-colors px-2 py-1 rounded">
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px', background: '#18181b' }}
      >
        {children}
      </SyntaxHighlighter>

      {/* Sandbox Output Area */}
      {(executing || executionRes) && (
        <div className="bg-[#09090b] border-t border-[var(--border-base)] p-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-2 opacity-30 uppercase tracking-widest text-[10px] font-bold">
            <IconTerminal />
            <span>Output</span>
          </div>
          {executing && (
            <div className="flex items-center gap-2 text-zinc-500">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>executing code on server...</span>
            </div>
          )}
          {executionRes && (
            <div className="space-y-1 overflow-auto max-h-[300px]">
              {executionRes.run?.stdout && (
                <pre className="text-zinc-300 whitespace-pre-wrap">{executionRes.run.stdout}</pre>
              )}
              {executionRes.run?.stderr && (
                <pre className="text-red-400 whitespace-pre-wrap">{executionRes.run.stderr}</pre>
              )}
              {executionRes.run && !executionRes.run.stdout && !executionRes.run.stderr && (
                <p className="text-zinc-500 italic">Code finished with no output.</p>
              )}
              {executionRes.error && (
                <p className="text-red-400">{executionRes.error}</p>
              )}
              {executionRes.run && (
                <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-zinc-600 flex justify-between">
                  <span>Exit code: {executionRes.run.code}</span>
                  {executionRes.run.signal && <span>Signal: {executionRes.run.signal}</span>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── charting component ────────────────────────────────────────
function ChartRenderer({ config }) {
  try {
    const { type, data, options } = JSON.parse(config);
    const ChartComp = type === 'bar' ? Bar : type === 'line' ? Line : type === 'pie' ? Pie : Bar;
    
    return (
      <div className="bg-[#18181b] p-6 rounded-xl border border-white/5 my-4">
        <div style={{ height: '300px', position: 'relative' }}>
          <ChartComp data={data} options={{
            ...options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...options?.plugins,
              legend: {
                ...options?.plugins?.legend,
                labels: { color: '#a1a1aa', font: { family: 'Inter' } }
              }
            },
            scales: type !== 'pie' ? {
              x: { ticks: { color: '#71717a' }, grid: { color: '#27272a' } },
              y: { ticks: { color: '#71717a' }, grid: { color: '#27272a' } }
            } : undefined
          }} />
        </div>
      </div>
    );
  } catch (e) {
    return <div className="text-red-400 text-xs p-4 bg-red-400/10 rounded-lg">Failed to render chart: {e.message}</div>;
  }
}

// ── markdown renderer for AI responses ───────────────────────
function AIMarkdown({ content }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          const isBlock = match || String(children).includes('\n')
          const language = match ? match[1] : ''

          if (isBlock && language === 'chartjs') {
            return <ChartRenderer config={String(children).replace(/\n$/, '')} />
          }

          return isBlock ? (
            <CodeBlock language={language}>
              {String(children).replace(/\n$/, '')}
            </CodeBlock>
          ) : (
            <code className="bg-[var(--border-base)] text-[var(--accent)] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
              {children}
            </code>
          )
        },
        h1: ({ children }) => <h1 className="text-2xl font-semibold mt-6 mb-3 text-[var(--text-base)]">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2 text-[var(--text-base)]">{children}</h2>,
        h3: ({ children }) => <h3 className="text-base font-semibold mt-4 mb-1 text-[var(--text-base)]">{children}</h3>,
        p: ({ children }) => <p className="mb-3 leading-7 text-[var(--text-base)] opacity-90 text-[15px]">{children}</p>,
        ul: ({ children }) => <ul className="mb-3 space-y-1 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="mb-3 space-y-1 pl-5 list-decimal">{children}</ol>,
        li: ({ children }) => (
          <li className="text-[var(--text-base)] opacity-90 text-[15px] leading-7 list-disc marker:text-[var(--text-muted)]">
            {children}
          </li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-[var(--border-base)] pl-4 my-3 text-[var(--text-muted)] italic">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4 border border-[var(--border-base)] rounded-xl">
            <table className="w-full text-sm border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className="text-left px-3 py-2 border border-[var(--border-base)] text-[var(--text-base)] font-medium text-xs uppercase tracking-wide bg-[var(--bg-side)]">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-3 py-2 border border-[var(--border-base)] text-[var(--text-base)] opacity-80 text-[13px]">{children}</td>
        ),
        hr: () => <hr className="my-6 border-[var(--border-base)]" />,
        strong: ({ children }) => <strong className="font-semibold text-[var(--text-base)]">{children}</strong>,
        em: ({ children }) => <em className="italic text-[var(--text-base)] opacity-80">{children}</em>,
        a: ({ href, children }) => (
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline underline-offset-2 transition-colors">
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

// ── typing indicator ──────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-2">
      {[0, 1, 2].map(i => (
        <span key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// ── file preview pill ─────────────────────────────────────────
function FilePill({ file, onRemove }) {
  return (
    <div className="flex items-center gap-2 bg-white/10 border border-white/15
                    rounded-lg px-3 py-1.5 text-xs text-white/70">
      <IconFile />
      <span className="max-w-[120px] truncate">{file.name}</span>
      <button onClick={onRemove} className="text-white/40 hover:text-white/80 transition-colors ml-1">
        <IconX />
      </button>
    </div>
  )
}

// ════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════════
export default function CleanChat() {
  const [messages, setMessages]       = useState([])
  const [input, setInput]             = useState('')
  const [files, setFiles]             = useState([])
  const [isLoading, setIsLoading]     = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const [modelOpen, setModelOpen]     = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isDarkMode, setIsDarkMode]   = useState(true)
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)
  const [agenticMode, setAgenticMode] = useState(false)
  const [chats, setChats]             = useState([])
  const abortRef                      = useRef(null)
  const bottomRef                     = useRef(null)
  const fileInputRef                  = useRef(null)
  const textareaRef                   = useRef(null)
  const [memoryOpen, setMemoryOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Apply theme class
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove('light-theme')
    } else {
      document.body.classList.add('light-theme')
    }
  }, [isDarkMode])

  // Fetch chat history
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/chats`, {
          headers: { 'x-app-secret': import.meta.env.VITE_APP_SECRET || 'any_random_secret_string' }
        })
        if (res.ok) {
          const data = await res.json()
          setChats(data)
        }
      } catch (err) {
        console.error('Failed to fetch chats:', err)
      }
    }
    fetchChats()
  }, [])

  const handleSearch = async (val) => {
    setSearchQuery(val)
    if (!val.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    try {
      const { searchMessages } = await import('../api') // Dynamic import if needed or use imported one
      const data = await searchMessages(val)
      setSearchResults(data)
    } catch (err) {
      console.error('Search failed:', err)
    } finally {
      setIsSearching(false)
    }
  }

  const jumpToChat = async (chatId) => {
    // Basic logic to switch to a chat
    try {
      const { getMessages } = await import('../api')
      const data = await getMessages(chatId)
      setMessages(data)
      setSearchResults([])
      setSearchQuery('')
    } catch (err) {
      console.error('Failed to jump to chat:', err)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'auto' })
  }, [messages, isLoading])

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input])

  const send = async () => {
    const text = input.trim()
    if (!text && files.length === 0) return
    if (isLoading) return

    const userMsg = { role: 'user', content: text, files: [...files] }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setFiles([])
    setIsLoading(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(`${API_BASE}/api/stateless`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-app-secret': import.meta.env.VITE_APP_SECRET || 'any_random_secret_string'
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: selectedModel,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          webSearchEnabled,
          agenticMode
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      setIsLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop(); // keep the last partial line in buffer

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.token) {
                setMessages(prev => {
                  const last = prev[prev.length - 1];
                  if (last && last.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      { ...last, content: last.content + parsed.token }
                    ];
                  }
                  return prev;
                });
              }
              if (parsed.done) break;
            } catch (e) {
              console.warn('Failed to parse SSE chunk:', dataStr);
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Send Error:', err);
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Error: ${err.message || 'Unknown Failure'}`
        }])
      }
    } finally {
      setIsLoading(false)
      abortRef.current = null
    }
  }

  const stop = () => {
    abortRef.current?.abort()
    setIsLoading(false)
  }

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || [])
    setFiles(prev => [...prev, ...selected].slice(0, 5))
    e.target.value = ''
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const selectedModelLabel = MODELS.find(m => m.id === selectedModel)?.label || 'Model'

  return (
    <div className={`flex h-screen bg-[var(--bg-app)] text-[var(--text-base)] overflow-hidden font-sans transition-colors duration-300`}>
      {/* ── sidebar ────────────────────────────────── */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[var(--bg-side)] border-r border-[var(--border-base)] 
                      transform transition-transform duration-300 ease-in-out
                      ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
                      lg:relative lg:translate-x-0 ${showSidebar ? 'lg:flex' : 'lg:hidden'}
                      flex-col`}>
        <div className="p-4 pt-16 flex flex-col h-full">
          <button
            onClick={() => { setMessages([]); setInput('') }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-[var(--border-base)] 
                       hover:bg-white/5 transition-all text-sm font-medium mb-4`}
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
              placeholder="Search conversations..."
              className="w-full bg-white/5 border border-[var(--border-base)] rounded-xl py-2 pl-9 pr-3 
                         text-xs focus:border-accent/40 outline-none transition-all placeholder:text-[var(--text-muted)]/50"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-2">
            <h3 className="px-3 text-[11px] font-semibold opacity-30 uppercase tracking-widest mb-3 flex items-center gap-2">
              <IconHistory />
              {searchQuery ? 'Search Results' : 'History'}
            </h3>

            {searchQuery ? (
              <div className="space-y-4">
                {isSearching ? (
                  <p className="px-3 text-[10px] text-[var(--text-muted)] animate-pulse">Searching thoughts...</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-3 text-[10px] text-[var(--text-muted)] italic">No matches found</p>
                ) : (
                  searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => jumpToChat(res.chatId)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-accent/5 border border-accent/10 
                                 hover:bg-accent/10 transition-all group"
                    >
                      <p className="text-[11px] text-accent font-medium mb-1 flex items-center justify-between">
                        <span>{res.role === 'user' ? 'Message' : 'Response'}</span>
                        <span className="text-[9px] opacity-50">{new Date(res.createdAt).toLocaleDateString()}</span>
                      </p>
                      <p className="text-[12px] opacity-80 line-clamp-2 leading-relaxed group-hover:opacity-100 italic">
                        "{res.content}"
                      </p>
                    </button>
                  ))
                )}
              </div>
            ) : chats.length === 0 ? (
              <div className="px-3 py-8 text-center">
                <p className="opacity-20 text-xs italic">No history yet</p>
              </div>
            ) : (
              chats.map(chat => (
                <button
                  key={chat._id}
                  className="w-full text-left px-3 py-2 rounded-lg text-[13px] opacity-60 
                             hover:opacity-100 hover:bg-white/5 transition-colors truncate"
                >
                  {chat.title || 'Untitled Chat'}
                </button>
              ))
            )}
          </div>

          <div className="mt-auto pt-4 border-t border-[var(--border-base)] space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl
                         hover:bg-white/5 transition-all text-[13px] font-medium"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <IconMoon /> : <IconSun />}
                <span>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${isDarkMode ? 'bg-purple-600' : 'bg-zinc-300'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDarkMode ? 'left-4.5' : 'left-0.5'}`} />
              </div>
            </button>

            {/* AI Memory Button */}
            <button
              onClick={() => setMemoryOpen(true)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl
                         hover:bg-accent/10 hover:text-accent transition-all text-[13px] font-medium group"
            >
              <Brain className="w-4 h-4 text-[var(--text-muted)] group-hover:text-accent" />
              <span>AI Memory</span>
              <div className="ml-auto px-1.5 py-0.5 rounded-md bg-accent/10 text-[9px] text-accent uppercase font-bold tracking-wider">
                Active
              </div>
            </button>

            <div className="px-3 py-3 rounded-xl bg-white/5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 shadow-lg shadow-blue-500/20" />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">User</p>
                <p className="text-[10px] opacity-30 truncate">Free Plan</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── main content ────────────────────────────── */}
      <div className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Sticky Toggle Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`fixed top-4 left-4 z-[60] p-2 rounded-xl bg-[var(--bg-side)]/80 backdrop-blur-md 
                     border border-[var(--border-base)] opacity-40 hover:opacity-100 hover:bg-[var(--bg-side)]
                     transition-all shadow-xl`}
          title="Toggle Sidebar"
        >
          <IconMenu />
        </button>

        {/* ── messages area ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto w-full pt-16 scroll-smooth">
        <div className="max-w-[720px] mx-auto px-4 py-8 flex flex-col gap-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10
                              flex items-center justify-center text-white/40 text-lg font-light">
                ✦
              </div>
              <p className="text-white/30 text-sm">Start a conversation</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="flex flex-col gap-1 w-full">
              {msg.role === 'user' && (
                <div className="flex justify-end w-full">
                  <div className="flex flex-col gap-2 items-end max-w-[85%]">
                    {msg.files?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        {msg.files.map((f, fi) => (
                          <div key={fi}
                            className="flex items-center gap-1.5 bg-white/5 border border-white/10
                                       rounded-lg px-2.5 py-1 text-xs text-white/50">
                            <IconFile />
                            <span className="max-w-[100px] truncate">{f.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.content && (
                      <div className={`${isDarkMode ? 'bg-white text-black' : 'bg-purple-600 text-white shadow-sm'} 
                                      rounded-2xl rounded-br-sm
                                      px-4 py-3 text-[15px] leading-7 font-normal inline-block self-end whitespace-pre-wrap text-left break-words transition-all duration-300`}>
                        {msg.content}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {msg.role === 'assistant' && (
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-white/20 font-mono text-[10px] uppercase tracking-wider">assistant</span>
                    {msg.status && (
                      <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[10px] text-amber-500/80 font-medium">{msg.status}</span>
                      </div>
                    )}
                  </div>

                  {msg.sources?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {msg.sources.map((s, si) => (
                        <a key={si} href={s.link || s.url} target="_blank" rel="noreferrer"
                           className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10
                                      hover:bg-white/10 transition-colors text-[11px] text-white/50 max-w-[200px]">
                          <IconGlobe />
                          <span className="truncate">{s.title || 'Source'}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="text-white/90">
                    {msg.content === '' && !msg.status ? (
                       <TypingDots />
                    ) : (
                       <AIMarkdown content={msg.content} />
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === 'user' && (
            <div className="flex flex-col gap-1 w-full">
              <span className="text-xs text-white/20 mb-1 font-mono">assistant</span>
              <TypingDots />
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>
      </div>

      {/* ── input area ─────────────────────────────────── */}
      <div className="px-4 pb-6 pt-2 w-full">
        <div className="max-w-[720px] mx-auto w-full">
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 px-1">
              {files.map((f, i) => (
                <FilePill key={i} file={f}
                  onRemove={() => setFiles(prev => prev.filter((_, j) => j !== i))} />
              ))}
            </div>
          )}

          <div className={`relative flex flex-col bg-[var(--bg-card)] border border-[var(--border-base)]
                          rounded-2xl overflow-hidden shadow-sm
                          focus-within:border-purple-500/30 transition-all`}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message..."
              rows={1}
              className="w-full bg-transparent text-[var(--text-base)] placeholder-[var(--text-muted)]
                         text-[15px] leading-7 px-4 pt-3.5 pb-2
                         resize-none outline-none min-h-[52px] max-h-[200px]"
            />

            <div className="flex items-center justify-between px-3 pb-3 pt-1 gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach file"
                  className="flex items-center justify-center w-8 h-8 rounded-lg
                             text-[var(--text-muted)] hover:text-[var(--text-base)] hover:bg-white/5
                             transition-all"
                >
                  <IconPaperclip />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.txt,.md,.js,.jsx,.ts,.tsx,.py,.json,.csv,.png,.jpg,.jpeg"
                  onChange={handleFiles}
                  className="hidden"
                />

                <button
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  title={webSearchEnabled ? "Web Search Enabled" : "Web Search Disabled"}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all
                             ${webSearchEnabled 
                               ? 'text-purple-500 bg-purple-500/10 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]' 
                               : 'text-[var(--text-muted)] hover:text-[var(--text-base)] hover:bg-white/5 border-transparent'}`}
                >
                  <IconGlobe />
                </button>

                <button
                  onClick={() => setAgenticMode(!agenticMode)}
                  title={agenticMode ? "Agent Mode Enabled" : "Agent Mode Disabled"}
                  className={`flex items-center justify-center w-8 h-8 rounded-lg border transition-all
                             ${agenticMode 
                               ? 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                               : 'text-[var(--text-muted)] hover:text-[var(--text-base)] hover:bg-white/5 border-transparent'}`}
                >
                  <IconSparkles />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setModelOpen(o => !o)}
                    className="flex items-center gap-1.5 px-2.5 h-8 rounded-lg
                               text-[var(--text-muted)] hover:text-[var(--text-base)] hover:bg-white/5
                               text-xs font-mono transition-all border border-transparent
                               hover:border-[var(--border-base)]"
                  >
                    <span>{selectedModelLabel}</span>
                    <IconChevron />
                  </button>

                  {modelOpen && (
                    <div className="absolute bottom-full left-0 mb-2 w-48
                                    bg-[var(--bg-card)] border border-[var(--border-base)] rounded-xl
                                    shadow-2xl overflow-hidden z-50">
                      {MODELS.map(m => (
                        <button
                          key={m.id}
                          onClick={() => { setSelectedModel(m.id); setModelOpen(false) }}
                          className={`w-full text-left px-3 py-2.5 text-xs font-mono
                                      transition-colors hover:bg-white/5
                                      ${selectedModel === m.id
                                        ? 'text-[var(--accent)] bg-white/5'
                                        : 'text-[var(--text-muted)]'}`}
                        >
                          {selectedModel === m.id && (
                            <span className="inline-block w-1.5 h-1.5 rounded-full
                                             bg-[var(--accent)] mr-2 mb-0.5" />
                          )}
                          {m.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLoading ? (
                  <button
                    onClick={stop}
                    className="flex items-center gap-1.5 px-3 h-8 rounded-lg
                               bg-white/10 hover:bg-white/15 border border-[var(--border-base)]
                               text-[var(--text-muted)] hover:text-[var(--text-base)] text-xs transition-all"
                  >
                    <IconStop />
                    <span>Stop</span>
                  </button>
                ) : (
                  <button
                    onClick={send}
                    disabled={!input.trim() && files.length === 0}
                    className="flex items-center justify-center w-8 h-8 rounded-lg
                               bg-[var(--text-base)] text-[var(--bg-app)] disabled:bg-white/10
                               disabled:text-[var(--text-muted)] hover:opacity-90
                               transition-all disabled:cursor-not-allowed"
                  >
                    <IconSend />
                  </button>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-[var(--text-muted)] opacity-50 text-xs mt-3">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
    <MemoryPanel isOpen={memoryOpen} onClose={() => setMemoryOpen(false)} />
  </div>
  )
}
