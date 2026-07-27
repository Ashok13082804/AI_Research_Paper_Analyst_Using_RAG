import Link from 'next/link';
import { Sparkles, Github, ShieldCheck, Database, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#070a11] text-gray-400 py-12 px-6 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-white">ResearchMind AI</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Enterprise-grade RAG and Multi-Agent AI Research Paper QA platform. Grounded answers with top-3 page-level citations.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Core Technology</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Cpu className="h-3.5 w-3.5 text-blue-400" /> LangChain & LangGraph</li>
            <li className="flex items-center gap-2"><Database className="h-3.5 w-3.5 text-purple-400" /> ChromaDB / FAISS / Qdrant</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Groundedness Guardrails</li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform Pages</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard Analytics</Link></li>
            <li><Link href="/chat" className="hover:text-blue-400 transition-colors">Interactive RAG Chat</Link></li>
            <li><Link href="/upload" className="hover:text-blue-400 transition-colors">PDF Indexing Pipeline</Link></li>
            <li><Link href="/tools" className="hover:text-blue-400 transition-colors">Multi-Agent AI Suite</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Capstone Status</h4>
          <div className="glass-panel p-4 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Grounding Score</span>
              <span className="text-emerald-400 font-bold">96.4%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Citations Required</span>
              <span className="text-blue-400 font-bold">Top-3 Passages</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Hallucination Rate</span>
              <span className="text-purple-400 font-bold">&lt; 1.8%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 mt-10 pt-6 text-center text-xs text-gray-500">
        © 2026 ResearchMind AI Platform. Grounded RAG Research QA System. Built with Next.js 15 & FastAPI.
      </div>
    </footer>
  );
}
