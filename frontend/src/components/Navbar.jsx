import React from 'react';
import { 
  Shield, 
  RotateCcw, 
  Play, 
  FolderPlus,
  BookOpen
} from 'lucide-react';

export default function Navbar({ onReset, isDemoLoading, systemInfo, onOpenStoryModal, onOpenTutorial, activeCase, onOpenNewCase }) {
  const isCustomOrEmpty = !activeCase || activeCase.isCustom || activeCase.entityCount === 0;

  return (
    <header className="h-16 bg-[#080b11] border-b border-intel-800 px-6 flex items-center justify-between z-20 select-none shrink-0">
      {/* Left: Branding & Case Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-intel-accent/20 border border-intel-accent/40 flex items-center justify-center text-intel-accent shadow-lg shadow-intel-accent/20">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold tracking-tight text-white font-mono">
                CRIMENET <span className="text-intel-accent">AI</span>
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-intel-accent/15 text-intel-accent border border-intel-accent/30 font-bold">
                SIH 26189
              </span>
            </div>
            <div className="text-[10.5px] text-slate-400 font-mono">
              AI Investigation Command Center • MHA
            </div>
          </div>
        </div>

        {/* Vertical Separator */}
        <div className="h-6 w-px bg-intel-800 hidden md:block" />

        {/* Case Badge */}
        <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-xl bg-intel-900 border border-intel-800 text-xs font-mono">
          <span className={`w-2 h-2 rounded-full ${activeCase?.name ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-slate-400">Case:</span>
          <span className="text-white font-bold">
            {activeCase?.name || 'No Active Case (Workspace Ready)'}
          </span>
        </div>

        {/* Persistent Demo / Synthetic Data Disclaimer */}
        {!isCustomOrEmpty && (
          <div 
            title="Simulated case file with fictional entities for demonstration. AI-generated leads require human investigator verification."
            className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[10.5px] font-mono text-amber-300"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="font-semibold">SYNTHETIC DEMO DATA</span>
            <span className="text-amber-400/80">• Fictional Case • Human Verification Required</span>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3">
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            title="System & Feature Guide (Tutorial)"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-intel-900 hover:bg-intel-800 text-teal-300 hover:text-white border border-teal-500/40 font-mono text-xs transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden sm:inline">Feature Guide</span>
          </button>
        )}

        {onOpenNewCase && (
          <button
            onClick={onOpenNewCase}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-intel-900 hover:bg-intel-800 text-intel-accent hover:text-sky-300 border border-intel-700 font-mono text-xs transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Case</span>
          </button>
        )}

        {onOpenStoryModal && activeCase?.name === 'Operation ShadowNet' && (
          <button
            onClick={onOpenStoryModal}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-md shadow-intel-accent/20 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>DEMO STORY (3 MIN)</span>
          </button>
        )}

        <button
          onClick={onReset}
          title="Reset / Clear Case Workspace"
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-intel-900 hover:bg-intel-800 text-slate-400 hover:text-white border border-intel-800 font-mono text-xs transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
    </header>
  );
}
