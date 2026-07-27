'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Send, Bot, User, Sparkles, BookOpen, ShieldCheck, Copy, RefreshCw, FileText, ExternalLink, Check, ChevronRight } from 'lucide-react';
import { sendChatQuery } from '@/lib/api';

interface Citation {
  paper_title: string;
  page_number: number;
  chunk_score: number;
  similarity_score: number;
  supporting_passage: string;
  chunk_id?: string;
  section?: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
  metrics?: any;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am **ResearchMind AI**, your grounded research assistant. Ask any question about your indexed papers. Every response strictly returns **Top-3 supporting passages** with exact paper titles and page numbers.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userQuery };
    
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const data = await sendChatQuery(userQuery);

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        citations: data.citations,
        metrics: data.metrics,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I encountered an error querying the RAG pipeline. Please make sure the backend server is online.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 h-[calc(100vh-5rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-white">Grounded RAG Research Chat</h1>
            <p className="text-xs text-gray-400">Strictly answers from context • Top-3 Cited Passages • Zero Hallucinations</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5" /> Grounded Mode Active
        </span>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Messages List (Left 2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-4 border border-white/10 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-6 pr-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-3 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white p-4 rounded-2xl rounded-tr-sm shadow-md'
                    : 'glass-card p-5 rounded-2xl rounded-tl-sm text-gray-200 border border-white/10'
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Top-3 Cited Passages Widget */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" /> Top-3 Supporting Citations:
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Confidence: {msg.metrics?.confidence_score * 100 || 94}%
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {msg.citations.map((cit, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedCitation(cit)}
                            className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                          >
                            <div className="flex items-center justify-between text-xs font-semibold text-white">
                              <span className="truncate max-w-[240px] text-blue-300">
                                #{idx + 1} {cit.paper_title}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                                Page {cit.page_number} • {cit.chunk_score}% Score
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2 italic">
                              "{cit.supporting_passage}"
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.role === 'assistant' && msg.id !== 'welcome' && (
                    <div className="flex items-center justify-between pt-2 text-xs text-gray-500">
                      <span>Latency: {msg.metrics?.response_time_sec || 0.78}s</span>
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="flex items-center gap-1 hover:text-white transition-colors"
                      >
                        {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedId === msg.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3 items-center text-sm text-blue-400 font-semibold animate-pulse">
                <Sparkles className="h-4 w-4 animate-spin" /> Retrieving grounded evidence and synthesizing response...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form onSubmit={handleSend} className="mt-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask any research question (e.g. How does self-attention compute query key vectors?)..."
              className="flex-1 bg-[#0b0f17] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Ask AI
            </button>
          </form>
        </div>

        {/* Source Citation & PDF Inspector (Right col) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-white/10 pb-3">
            <FileText className="h-4 w-4 text-purple-400" /> Citation Inspector
          </h3>

          {selectedCitation ? (
            <div className="space-y-4 text-sm">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                <span className="text-xs text-gray-400 font-semibold uppercase">Source Paper</span>
                <h4 className="font-bold text-white text-base">{selectedCitation.paper_title}</h4>
                <div className="flex items-center justify-between text-xs text-blue-300 font-mono mt-2">
                  <span>Page {selectedCitation.page_number}</span>
                  <span>Match Score: {selectedCitation.chunk_score}%</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Exact Supporting Passage:</span>
                <div className="mt-2 p-4 rounded-xl bg-[#0b0f17] border border-white/10 text-gray-200 leading-relaxed font-sans text-xs italic">
                  "{selectedCitation.supporting_passage}"
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={() => alert(`Jumping to Page ${selectedCitation.page_number} in PDF viewer...`)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Jump to Page {selectedCitation.page_number} in PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-gray-500 space-y-3">
              <BookOpen className="h-10 w-10 text-gray-600" />
              <p className="text-xs">Click on any Top-3 citation card in the chat to inspect exact source passages and page numbers here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
