import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Clock, 
  CreditCard, 
  Target, 
  Users,
  FileText, 
  GitMerge, 
  AlertTriangle, 
  Bot, 
  ShieldCheck, 
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, alertCount = 0, candidateCount = 0, onOpenTutorial }) {
  const navSections = [
    {
      groupTitle: 'INVESTIGATE',
      items: [
        { id: 'dashboard', label: 'Case Overview', icon: LayoutDashboard },
        { id: 'network', label: 'Network Intelligence', icon: Network },
        { id: 'timeline', label: 'Time Machine', icon: Clock },
        { id: 'financial', label: 'Money Flow (Hawala)', icon: CreditCard },
        { id: 'leads', label: 'Investigative Leads', icon: Target },
        { id: 'entities', label: 'Entity Registry', icon: Users }
      ]
    },
    {
      groupTitle: 'VERIFY',
      items: [
        { id: 'documents', label: 'Evidence Records', icon: FileText },
        { id: 'resolution', label: 'Entity Resolution', icon: GitMerge, badge: candidateCount },
        { id: 'alerts', label: 'Anomaly Center', icon: AlertTriangle, badge: alertCount, badgeColor: 'bg-red-500/30 text-red-300 border-red-500/40' }
      ]
    },
    {
      groupTitle: 'ASSIST',
      items: [
        { id: 'copilot', label: 'AI Investigator', icon: Bot },
        { id: 'transparency', label: 'AI Transparency', icon: ShieldCheck }
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#080b11] border-r border-intel-800/80 flex flex-col justify-between select-none shrink-0">
      <div className="p-4 space-y-5 overflow-y-auto">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1.5">
            <div className="px-3 text-[10px] font-mono uppercase tracking-wider font-bold text-slate-500">
              {section.groupTitle}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                      isActive
                        ? 'bg-intel-accent/15 text-intel-accent border border-intel-accent/40 font-bold shadow-md shadow-intel-accent/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-intel-900 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-intel-accent' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${item.badgeColor || 'bg-amber-500/20 text-amber-300 border-amber-500/40'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Responsible AI & Tutorial Link */}
      <div className="p-4 border-t border-intel-800/80 bg-intel-950/60 space-y-2 text-[11px] font-mono">
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-intel-900 hover:bg-intel-800 text-teal-300 hover:text-white border border-teal-500/40 font-mono text-xs transition-colors shadow-sm active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-400" />
            <span>Feature Guide & Tutorial</span>
          </button>
        )}

        <div className="flex items-center justify-between text-slate-400 pt-1">
          <span className="text-[10px] text-slate-500">SIH 2026 PS 26189</span>
          <span className="text-[10px] text-emerald-400 font-bold">MHA Prototype</span>
        </div>

        <div className="p-2.5 rounded-xl bg-intel-900 border border-intel-800 text-slate-400 text-[10.5px] leading-snug">
          🛡️ <strong>Decision-Support Mode:</strong> Human verification required before formal legal action.
        </div>
      </div>
    </aside>
  );
}
