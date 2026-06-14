import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatWithCopilot, getCopilotStarters } from '../api/client';

interface Message { role: 'user' | 'assistant'; content: string; }

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input,    setInput]    = useState('');
  const [starters, setStarters] = useState<string[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { getCopilotStarters().then(setStarters).catch(() => {}); }, []);

  const sendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', content: text.trim() };
    const updated = [...messages, userMsg];
    setMessages(updated); setInput(''); setLoading(true); setError('');
    try {
      const reply = await chatWithCopilot(updated);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to reach Carbon Copilot');
      setMessages(messages);
    } finally { setLoading(false); inputRef.current?.focus(); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="page copilot-page">
      <div className="container" style={{ display: 'flex', flexDirection: 'column' }}>
        <header className="animate-fade-up" style={{ marginBottom: 'var(--space-5)', flexShrink: 0 }}>
          <p className="section-heading">AI Assistant</p>
          <h1>Carbon Copilot 🤖</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: 'var(--space-2)', maxWidth: '52ch' }}>
            Ask anything about carbon, money, and sustainability. India-specific numbers. Rupee trade-offs.
          </p>
        </header>

        <div className="chat-container" aria-label="Chat interface">
          <div className="chat-messages" role="log" aria-live="polite">
            {isEmpty && (
              <div className="chat-empty animate-fade-in">
                <Bot size={48} style={{ color: 'var(--color-text-faint)', marginBottom: 16 }} aria-hidden="true" />
                <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>Ask CarbonIQ anything</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--space-5)' }}>
                  India-specific answers. Rupee trade-offs. No guilt.
                </p>
                {starters.length > 0 && (
                  <div className="starters">
                    {starters.map((s, i) => (
                      <button key={i} id={`starter-${i}`} className="starter-chip"
                        onClick={() => { setInput(s); inputRef.current?.focus(); }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`chat-msg chat-msg--${msg.role} animate-fade-up`}
                style={{ animationDelay: `${Math.min(i * 0.05, 0.3)}s` }} role="article">
                <div className="msg-av" aria-hidden="true">
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className="msg-bbl markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-msg chat-msg--assistant" role="status" aria-label="Thinking">
                <div className="msg-av" aria-hidden="true"><Bot size={14} /></div>
                <div className="msg-bbl typing-dots"><span /><span /><span /></div>
              </div>
            )}

            {error && (
              <p role="alert" style={{ color: 'var(--color-red)', fontSize: '0.875rem', textAlign: 'center', padding: 'var(--space-3)' }}>
                ⚠️ {error}
              </p>
            )}
            <div ref={bottomRef} aria-hidden="true" />
          </div>

          <form className="chat-form" onSubmit={handleSubmit} aria-label="Send message">
            <textarea ref={inputRef} id="copilot-input" className="input chat-ta"
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about carbon, money, sustainability… (Enter to send)"
              rows={2} maxLength={2000} disabled={loading} aria-label="Your message" />
            <button id="btn-send-copilot" type="submit" className="btn btn--primary chat-send-btn"
              disabled={!input.trim() || loading} aria-label="Send message">
              <Send size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .copilot-page { display: flex; flex-direction: column; }
        .copilot-page .container { flex: 1; }
        .chat-container { display: flex; flex-direction: column; border: 1px solid var(--color-border); border-radius: var(--radius-xl); overflow: hidden; background: var(--color-surface); height: calc(100vh - 280px); min-height: 380px; }
        .chat-messages { flex: 1; overflow-y: auto; padding: var(--space-5); display: flex; flex-direction: column; gap: var(--space-4); }
        .chat-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; flex: 1; padding: var(--space-8); }
        .starters { display: flex; flex-wrap: wrap; gap: var(--space-2); justify-content: center; max-width: 600px; }
        .starter-chip { padding: var(--space-2) var(--space-3); background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: 0.82rem; color: var(--color-text-muted); cursor: pointer; transition: var(--transition-fast); text-align: left; }
        .starter-chip:hover { background: var(--color-accent-dim); border-color: var(--color-accent); color: var(--color-accent); }
        .chat-msg { display: flex; gap: var(--space-3); align-items: flex-start; max-width: 80%; }
        .chat-msg--user { align-self: flex-end; flex-direction: row-reverse; }
        .chat-msg--assistant { align-self: flex-start; }
        .msg-av { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .chat-msg--user .msg-av { background: var(--color-accent); color: #0a0f0d; }
        .chat-msg--assistant .msg-av { background: var(--color-surface-2); border: 1px solid var(--color-border); color: var(--color-accent); }
        .msg-bbl { padding: var(--space-3) var(--space-4); border-radius: var(--radius-lg); font-size: 0.95rem; line-height: 1.6; }
        .chat-msg--user .msg-bbl { background: var(--color-accent); color: #ffffff; border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg); box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2); }
        .chat-msg--assistant .msg-bbl { background: var(--color-surface-2); border: 1px solid var(--color-border); border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm); }
        .typing-dots { display: flex; gap: 4px; align-items: center; }
        .typing-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--color-text-muted); animation: typingBounce 1.2s ease-in-out infinite; }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce { 0%,80%,100% { transform:translateY(0); } 40% { transform:translateY(-6px); } }
        .chat-form { display: flex; gap: var(--space-3); padding: var(--space-4); border-top: 1px solid var(--color-border); background: var(--color-bg-raised); align-items: flex-end; }
        .chat-send-btn { padding: var(--space-3); width: 44px; height: 44px; border-radius: var(--radius-md); flex-shrink: 0; }
        .markdown-body { display: flex; flex-direction: column; gap: 0.5em; }
        .markdown-body p { margin: 0; }
        .markdown-body ul, .markdown-body ol { margin: 0; padding-left: 1.5em; }
        .markdown-body li { margin-bottom: 0.25em; }
        .markdown-body strong { color: var(--color-accent-light); font-weight: 700; }
        .chat-msg--user .markdown-body strong { color: #ffffff; }
        @media (max-width:768px) { .chat-msg { max-width:95%; } .chat-container { height:calc(100vh - 320px); } }
      `}</style>
    </div>
  );
}
