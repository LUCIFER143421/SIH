import React from 'react';
import { 
  LayoutDashboard, 
  Network, 
  Bot, 
  AlertTriangle, 
  Users, 
  GitMerge, 
  FileText, 
  Sliders, 
  Info,
  Clock
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, alertCount, candidateCount }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'network', label: 'Network Explorer', icon: Network },
    { id: 'copilot', label: 'Investigation Copilot', icon: Bot, isWow: true },
    { id: 'alerts', label: 'Suspicious Alerts', icon: AlertTriangle, badge: alertCount },
    { id: 'entities', label: 'Entities & Dossiers', icon: Users },
    { id: 'resolution', label: 'Entity Resolution', icon: GitMerge, badge: candidateCount },
    { id: 'documents', label: 'Ingestion & Docs', icon: FileText },
    { id: 'transparency', label: 'AI Transparency & Eval', icon: Info },
  ];

  return (
    <aside className="w-64 border-r border-intel-800 bg-intel-950 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Intelligence Workspace
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-intel-accent/15 text-intel-accent border border-intel-accent/30 shadow-sm'
                  : 'text-slate-300 hover:bg-intel-900 hover:text-white border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-intel-accent' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.isWow && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  AGENTIC
                </span>
              )}

              {item.badge > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-intel-crimson/20 text-intel-crimson border border-intel-crimson/40">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Case Overview Card in Sidebar */}
      <div className="p-3 m-3 rounded-xl bg-intel-900/60 border border-intel-800 text-xs">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-slate-200">Active Case</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-intel-emerald/20 text-intel-emerald font-mono">ACTIVE</span>
        </div>
        <p className="text-slate-300 font-medium truncate">Op ShadowNet</p>
        <p className="text-[11px] text-slate-400 mt-1">Dimapur-Kolkata Contraband Syndicate</p>
      </div>
    </aside>
  );
}
