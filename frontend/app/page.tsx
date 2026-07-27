'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Search, ShieldCheck, Cpu, ArrowRight, Layers, Database, CheckCircle2, Zap, BrainCircuit, Play } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-grid-pattern">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-transparent blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-blue-500/30 text-blue-400 text-xs font-semibold mb-8"
        >
          <Sparkles className="h-4 w-4 animate-spin" />
          <span>Capstone Production Release • RAG + 12 AI Agents</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight max-w-5xl mx-auto"
        >
          Understand & Query Research Papers with <span className="text-gradient-blue">Grounded AI</span> & Top-3 Citations
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
        >
          Enterprise AI Research Assistant that ingests PDFs, indexes vector embeddings, executes hybrid retrieval (BM25 + Dense), and answers questions strictly from context with zero hallucination.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/chat"
            className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:scale-105 transition-all"
          >
            Try Research Assistant
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/upload"
            className="flex items-center gap-2 px-8 py-4 rounded-xl glass-card text-white font-semibold text-base hover:bg-white/10 transition-all border border-white/10"
          >
            Upload Research PDF
          </Link>
        </motion.div>

        {/* Floating Glassmorphic App Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 relative mx-auto max-w-5xl rounded-2xl glass-panel p-4 shadow-2xl border border-white/10"
        >
          <div className="bg-[#0b0f17] rounded-xl p-6 border border-white/5 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
                <span className="text-xs text-gray-500 font-mono ml-2">ResearchMind RAG Engine v1.0.0</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 font-medium">Grounded • Confidence 98.4%</span>
            </div>

            <div className="space-y-4 font-sans">
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-xs">USER</div>
                <div className="glass-card p-3 rounded-xl text-sm text-gray-200">
                  How does the Transformer model handle long-range dependencies compared to RNNs?
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-600/30 text-purple-400 flex items-center justify-center font-bold text-xs">AI</div>
                <div className="glass-card p-4 rounded-xl text-sm text-gray-200 space-y-3 border-l-4 border-blue-500">
                  <p>
                    Unlike recurrent neural networks (RNNs) which require sequential $\mathcal&#123;O&#125;(N)$ operations, the Transformer relies on self-attention mechanisms allowing constant $\mathcal&#123;O&#125;(1)$ sequential operations to connect arbitrary positions in a sequence [Page 3].
                  </p>
                  
                  {/* Top-3 Citations Preview */}
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Top-3 Grounded Passages:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-xs">
                        <span className="font-bold text-blue-300">Passage 1 • Page 3</span>
                        <p className="text-gray-400 mt-1 line-clamp-2">"Self-attention connects all positions with a constant number of sequentially executed operations..."</p>
                        <div className="mt-1 text-[10px] text-emerald-400 font-mono">Similarity: 0.942</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/20 text-xs">
                        <span className="font-bold text-purple-300">Passage 2 • Page 5</span>
                        <p className="text-gray-400 mt-1 line-clamp-2">"Multi-Head Attention allows the model to jointly attend to information from different representation subspaces..."</p>
                        <div className="mt-1 text-[10px] text-emerald-400 font-mono">Similarity: 0.898</div>
                      </div>
                      <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/20 text-xs">
                        <span className="font-bold text-emerald-300">Passage 3 • Page 7</span>
                        <p className="text-gray-400 mt-1 line-clamp-2">"Table 1 shows maximum path lengths across layer types: Self-Attention O(1) vs Recurrent O(n)..."</p>
                        <div className="mt-1 text-[10px] text-emerald-400 font-mono">Similarity: 0.871</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">Enterprise Features Engineered for Capstone Excellence</h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">Combining advanced retrieval-augmented generation with a multi-agent AI framework.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: ShieldCheck,
              title: "Grounded Top-3 Citations",
              desc: "Every answer strictly cites paper title, exact page number, chunk similarity score, and exact supporting passage.",
              color: "text-emerald-400"
            },
            {
              icon: BrainCircuit,
              title: "12-Agent AI Suite",
              desc: "Dedicated agents for Summarization, Citation generation, Code extraction, Equation explaining, and Research gap detection.",
              color: "text-purple-400"
            },
            {
              icon: Database,
              title: "Multi-Vector Store Support",
              desc: "Switch dynamically between ChromaDB, FAISS, and Qdrant vector databases in real-time through system settings.",
              color: "text-blue-400"
            },
            {
              icon: Layers,
              title: "Hybrid BM25 + Dense Search",
              desc: "Combines sparse term matching with deep transformer embeddings (BAAI/bge, E5, MiniLM) and cross-encoder reranking.",
              color: "text-amber-400"
            },
            {
              icon: FileText,
              title: "PDF Intelligence Pipeline",
              desc: "Parses complex multi-column PDFs, extracts mathematical LaTeX formulas, metadata (authors, year, title), and section headers.",
              color: "text-indigo-400"
            },
            {
              icon: Zap,
              title: "Hallucination Prevention",
              desc: "Automatic confidence scoring and evidence thresholds to ensure the AI responds with 'I don't know' when evidence is absent.",
              color: "text-rose-400"
            }
          ].map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="glass-panel p-8 rounded-2xl border border-white/10 hover:border-blue-500/40 transition-all"
              >
                <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center ${feature.color} mb-6`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Architecture & Workflow Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">End-to-End RAG Architecture</h2>
          <p className="text-gray-400 mt-2">From raw research PDF ingestion to grounded answer generation</p>
        </div>

        <div className="glass-panel p-8 rounded-2xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center items-center">
            {[
              { step: "01", title: "PDF Ingestion", desc: "Text extraction & cleaning" },
              { step: "02", title: "Chunking", desc: "Recursive / Token / Semantic" },
              { step: "03", title: "Embeddings", desc: "BGE / E5 / MiniLM models" },
              { step: "04", title: "Vector DB", desc: "Chroma / FAISS / Qdrant" },
              { step: "05", title: "LLM Generation", desc: "Grounded answer + citations" },
            ].map((st, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 relative">
                <span className="text-xs font-mono font-bold text-blue-400">STEP {st.step}</span>
                <h4 className="text-sm font-bold text-white mt-1">{st.title}</h4>
                <p className="text-xs text-gray-400 mt-1">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
