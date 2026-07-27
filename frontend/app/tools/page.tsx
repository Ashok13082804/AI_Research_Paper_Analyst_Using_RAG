'use client';

import { useState, useEffect } from 'react';
import { Bot, FileText, Quote, GitCompare, Code2, GraduationCap, Lightbulb, Calculator, HelpCircle, Sparkles, Loader2, Play, Copy, Check, FileCheck, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { executeAgentTool, fetchDocuments } from '@/lib/api';

const agents = [
  { id: 'summary', name: 'Paper Summarizer', icon: FileText, desc: 'Generate Abstract, Executive, Bullet, or Full Paper summaries.' },
  { id: 'citation', name: 'Citation Generator', icon: Quote, desc: 'Generate IEEE, APA, MLA, Chicago, and BibTeX citations.' },
  { id: 'comparison', name: 'Paper Comparison', icon: GitCompare, desc: 'Compare 2 or 10 research papers side-by-side.' },
  { id: 'code', name: 'Code Generator', icon: Code2, desc: 'Generate PyTorch & Python implementation directly from paper algorithms.' },
  { id: 'tutor', name: 'AI Tutor Mode', icon: GraduationCap, desc: 'Explain concepts at Beginner, Intermediate, Expert, or PhD level.' },
  { id: 'gap', name: 'Research Gap Detector', icon: Lightbulb, desc: 'Identify unsolved problems, missing work, and novel research directions.' },
  { id: 'equation', name: 'Equation Explainer', icon: Calculator, desc: 'Convert complex LaTeX equations into natural language derivations.' },
  { id: 'quiz', name: 'Quiz & Flashcards', icon: HelpCircle, desc: 'Generate MCQs and revision study flashcards automatically.' },
  { id: 'reviewer', name: 'Peer Reviewer Audit', icon: FileCheck, desc: 'Technical soundness audit, weaknesses, and peer review score.' },
];

export default function ToolsPage() {
  const [selectedAgent, setSelectedAgent] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [subOption, setSubOption] = useState('full');
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDocuments()
      .then((docs) => {
        setDocuments(docs);
        if (docs.length > 0) setSelectedDocId(docs[0].id);
      })
      .catch(() => {});
  }, []);

  const handleRunTool = async () => {
    setLoading(true);
    try {
      const extraParams: any = {};
      if (selectedAgent === 'summary') extraParams.level = subOption;
      if (selectedAgent === 'citation') extraParams.style = subOption;
      if (selectedAgent === 'tutor') extraParams.level = subOption;
      if (selectedAgent === 'code') extraParams.framework = 'PyTorch';
      if (selectedAgent === 'equation') extraParams.equation = '\\text{Attention}(Q,K,V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V';

      const docIds = selectedDocId ? [selectedDocId] : [];
      const data = await executeAgentTool(selectedAgent, docIds, extraParams);
      setOutput(data.output || data);
    } catch (e: any) {
      setOutput(`### Execution Error\n${e.message || 'Agent execution failed. Please verify backend is running.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (!output) return;
    const textToCopy = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          Multi-Agent AI Research Suite
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Orchestrate specialized AI agents to analyze, compare, code, summarize, and evaluate research papers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Agent Selector */}
        <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3">Select AI Agent</span>
          {agents.map((ag) => {
            const Icon = ag.icon;
            const isSelected = selectedAgent === ag.id;
            return (
              <button
                key={ag.id}
                onClick={() => {
                  setSelectedAgent(ag.id);
                  setOutput(null);
                }}
                className={`w-full text-left p-3.5 rounded-xl transition-all flex items-start gap-3 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-white/20' : 'bg-white/5 text-blue-400'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-bold">{ag.name}</div>
                  <p className="text-xs text-gray-400 line-clamp-1">{ag.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Output Panel */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 space-y-6 flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              {agents.find((a) => a.id === selectedAgent)?.name}
            </h3>

            <div className="flex items-center gap-3">
              {/* Document Selector */}
              {documents.length > 0 && (
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  className="bg-[#0b0f17] border border-white/10 rounded-lg p-2 text-xs text-white max-w-[200px] truncate"
                >
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      📄 {doc.title || doc.filename}
                    </option>
                  ))}
                </select>
              )}

              {/* Sub-options for specific tools */}
              {selectedAgent === 'summary' && (
                <select value={subOption} onChange={(e) => setSubOption(e.target.value)} className="bg-[#0b0f17] border border-white/10 rounded-lg p-2 text-xs text-white">
                  <option value="abstract">Abstract Level</option>
                  <option value="executive">Executive Level</option>
                  <option value="bullet">Bullet Summary</option>
                  <option value="full">Full Summary</option>
                </select>
              )}

              {selectedAgent === 'citation' && (
                <select value={subOption} onChange={(e) => setSubOption(e.target.value)} className="bg-[#0b0f17] border border-white/10 rounded-lg p-2 text-xs text-white">
                  <option value="APA">APA Style</option>
                  <option value="IEEE">IEEE Style</option>
                  <option value="MLA">MLA Style</option>
                  <option value="BIBTEX">BibTeX Format</option>
                </select>
              )}

              {selectedAgent === 'tutor' && (
                <select value={subOption} onChange={(e) => setSubOption(e.target.value)} className="bg-[#0b0f17] border border-white/10 rounded-lg p-2 text-xs text-white">
                  <option value="beginner">Beginner (10 yrs old)</option>
                  <option value="intermediate">Intermediate (College)</option>
                  <option value="expert">Expert (PhD Candidate)</option>
                  <option value="professor">Professor Level</option>
                </select>
              )}

              <button
                onClick={handleRunTool}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-white" />}
                {loading ? "Running Agent..." : "Run AI Agent"}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-[#0b0f17] p-6 rounded-xl border border-white/10 min-h-[400px] overflow-y-auto relative">
            {output && (
              <button
                onClick={handleCopyOutput}
                className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : "Copy Result"}
              </button>
            )}

            {output ? (
              typeof output === 'string' ? (
                <div className="prose prose-invert max-w-none text-sm leading-relaxed font-sans">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {output}
                  </ReactMarkdown>
                </div>
              ) : (
                <pre className="text-xs text-emerald-400 font-mono overflow-x-auto">
                  {JSON.stringify(output, null, 2)}
                </pre>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 space-y-3 py-16">
                <Bot className="h-12 w-12 text-gray-600 animate-pulse" />
                <p className="text-sm font-medium">Click "Run AI Agent" to execute this multi-agent analysis on your research paper repository.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
