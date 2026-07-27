'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Sparkles, BookOpen, MessageSquare, UploadCloud, BarChart3, Bot, Settings, Shield, User, LogOut, LogIn } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Research Chat', href: '/chat', icon: MessageSquare },
    { name: 'Upload PDFs', href: '/upload', icon: UploadCloud },
    { name: 'AI Multi-Agent', href: '/tools', icon: Bot },
    { name: 'Evaluation', href: '/admin', icon: Shield },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-white/10 px-6 py-3.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight flex items-center gap-1.5">
              ResearchMind <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI</span>
            </span>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide">Enterprise Research Assistant</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Controls & Auth */}
        <div className="flex items-center gap-3">
          {/* Light / Dark Mode Switcher */}
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
                <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px]">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="truncate max-w-[100px]">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all hover:scale-[1.02]"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
