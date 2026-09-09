import React, { useState, useEffect } from 'react';
import {
  Shield,
  SearchCheck,
  BarChart2,
  History,
  BookOpen,
  Info,
  Menu,
  X,
  Activity,
} from 'lucide-react';

export type PageTab = 'home' | 'verify' | 'results' | 'history' | 'methodology' | 'about';

interface NavbarProps {
  activePage: PageTab;
  onSelectPage: (page: PageTab) => void;
  hasActiveResult: boolean;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activePage,
  onSelectPage,
  hasActiveResult,
  historyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setServerOnline(Boolean(data?.status === 'ok')))
      .catch(() => setServerOnline(false));
  }, []);

  const navItems: { id: PageTab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { id: 'home', label: 'Home', icon: <Shield size={15} /> },
    { id: 'verify', label: 'Verify', icon: <SearchCheck size={15} /> },
    {
      id: 'results',
      label: 'Results & Dossier',
      icon: <BarChart2 size={15} />,
      disabled: !hasActiveResult,
    },
    {
      id: 'history',
      label: `History ${historyCount > 0 ? `(${historyCount})` : ''}`,
      icon: <History size={15} />,
    },
    { id: 'methodology', label: 'Methodology', icon: <BookOpen size={15} /> },
    { id: 'about', label: 'About', icon: <Info size={15} /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <button
            type="button"
            onClick={() => onSelectPage('home')}
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
              <Shield size={20} />
            </div>
            <div>
              <div className="font-serif font-bold text-lg tracking-tight text-stone-50 flex items-center gap-2">
                <span>TruthLens</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold tracking-wider">
                  Academic v1.0
                </span>
              </div>
              <p className="text-[10px] font-sans text-stone-400 tracking-wide hidden sm:block">
                Evidence-Grounded Misinformation & Verification Platform
              </p>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    onSelectPage(item.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-stone-800 text-amber-300 shadow-xs font-semibold'
                      : item.disabled
                      ? 'text-stone-600 cursor-not-allowed opacity-50'
                      : 'text-stone-300 hover:text-stone-50 hover:bg-stone-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Header Status */}
          <div className="hidden lg:flex items-center gap-3">
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-800/80 border border-stone-700/60 text-[11px] font-mono text-stone-300"
              title="Server & Gemini 3.8 Flash Grounding Status"
            >
              <Activity
                size={12}
                className={serverOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}
              />
              <span>{serverOnline ? 'Gemini 3.8 Grounded' : 'Initializing...'}</span>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-800 bg-stone-900 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                type="button"
                disabled={item.disabled}
                onClick={() => {
                  onSelectPage(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-800 text-amber-300 font-semibold'
                    : item.disabled
                    ? 'text-stone-600 opacity-50'
                    : 'text-stone-300 hover:bg-stone-800/60'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </span>
                {item.disabled && (
                  <span className="text-[10px] text-stone-500 font-mono">Requires verification</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
