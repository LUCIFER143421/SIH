import React, { useState } from 'react';
import { ShieldAlert, Play, RotateCcw, Search, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Navbar({ onStartDemo, onReset, onSearch, isDemoLoading, activeSearch, systemInfo }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <header className="h-16 border-b border-intel-800 bg-intel-950/90 backdrop-blur px-5 flex items-center justify-between z-30 shrink-0">
      {/* Brand & Tagline */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-intel-accent to-blue-700 flex items-center justify-center shadow-lg shadow-intel-accent/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-extrabold text-lg tracking-tight text-white">CRIMENET <span className="text-intel-accent font-mono">AI</span></h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-intel-800 border border-intel-700 font-mono text-slate-300">SIH 2026 #26189</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Criminal Network Intelligence & Investigation Support</p>
        </div>
      </div>

      {/* Global Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-6">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (!e.target.value) onSearch('');
            }}
            placeholder="Search person, phone, vehicle, account, FIR..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-intel-900/90 border border-intel-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-intel-accent transition-all font-mono"
          />
        </div>
      </form>

      {/* Action Controls & Model Status */}
      <div className="flex items-center space-x-3">
        {/* Model Status Badge */}
        <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-md bg-intel-900 border border-intel-800 text-xs">
          <Cpu className="w-3.5 h-3.5 text-intel-emerald animate-pulse" />
          <span className="text-slate-400">Local AI Engine:</span>
          <span className="text-intel-emerald font-mono font-medium">ONLINE (Ollama/CPU)</span>
        </div>

        {/* Start Demo Button */}
        <button
          onClick={onStartDemo}
          disabled={isDemoLoading}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-intel-accent hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-intel-accent/25 active:scale-95 disabled:opacity-50"
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isDemoLoading ? 'animate-spin' : ''}`} />
          <span>{isDemoLoading ? 'INITIALIZING DEMO...' : 'START DEMO INVESTIGATION'}</span>
        </button>

        {/* Reset System Button */}
        <button
          onClick={onReset}
          title="Reset Graph & Database"
          className="p-2 rounded-lg bg-intel-900 hover:bg-intel-800 border border-intel-700 text-slate-300 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
