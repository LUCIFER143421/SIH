import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Share2, 
  FileText, 
  AlertTriangle, 
  Layers, 
  Bot, 
  Play, 
  ArrowRight, 
  ShieldAlert,
  Flame,
  Award
} from 'lucide-react';
import { fetchNetworkStats, fetchCentrality, fetchAlerts } from '../services/api';

export default function DashboardView({ onNavigate, onSelectEntity, onStartDemo, isDemoLoading }) {
  const [stats, setStats] = useState({
    total_entities: 0,
    total_relationships: 0,
    total_documents: 0,
    total_alerts: 0,
    total_communities: 0,
    high_risk_entities_count: 0
  });
  const [influential, setInfluential] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);

  useEffect(() => {
    fetchNetworkStats().then(setStats).catch(console.error);
    fetchCentrality(5).then(setInfluential).catch(console.error);
    fetchAlerts().then((data) => setRecentAlerts(data.slice(0, 3))).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full bg-intel-950 p-6 space-y-6 overflow-y-auto select-none">
      {/* Top Banner / Case Overview */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-intel-900 via-intel-950 to-slate-900 border border-intel-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-intel-emerald/20 text-intel-emerald border border-intel-emerald/30">
              ACTIVE CASE #2026-SHADOW-01
            </span>
            <span className="text-[10px] font-mono text-slate-400">Dimapur-Kolkata Contraband Syndicate</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">
            CRIMENET AI Investigation Support Center
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Multi-source intelligence fused across FIRs, CDR communication logs, Hawala banking layering, and port surveillance. Powered by graph analytics and agentic AI reasoning.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => onNavigate('network')}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-lg shadow-intel-accent/20 transition-all active:scale-95"
          >
            <span>Open Network Explorer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-3.5 rounded-xl bg-intel-900 border border-intel-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Entities</span>
            <Users className="w-4 h-4 text-intel-accent" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">{stats.total_entities}</p>
          <span className="text-[10px] text-slate-500">Nodes in graph</span>
        </div>

        <div className="p-3.5 rounded-xl bg-intel-900 border border-intel-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Relationships</span>
            <Share2 className="w-4 h-4 text-intel-purple" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">{stats.total_relationships}</p>
          <span className="text-[10px] text-slate-500">Verified links</span>
        </div>

        <div className="p-3.5 rounded-xl bg-intel-900 border border-intel-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Evidence Docs</span>
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">{stats.total_documents}</p>
          <span className="text-[10px] text-slate-500">FIR/CDR/Bank logs</span>
        </div>

        <div className="p-3.5 rounded-xl bg-intel-900 border border-intel-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Active Alerts</span>
            <AlertTriangle className="w-4 h-4 text-intel-crimson" />
          </div>
          <p className="text-xl font-extrabold text-intel-crimson font-mono">{stats.total_alerts}</p>
          <span className="text-[10px] text-slate-500">Explainable patterns</span>
        </div>

        <div className="p-3.5 rounded-xl bg-intel-900 border border-intel-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">Sub-Clusters</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-extrabold text-white font-mono">{stats.total_communities}</p>
          <span className="text-[10px] text-slate-500">Modularity groups</span>
        </div>

        <div className="p-3.5 rounded-xl bg-intel-900 border border-intel-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-mono uppercase">High Risk</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-xl font-extrabold text-orange-400 font-mono">{stats.high_risk_entities_count}</p>
          <span className="text-[10px] text-slate-500">Score &gt; 75%</span>
        </div>
      </div>

      {/* Main Dashboard Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Influential / Bridge Entities */}
        <div className="p-5 rounded-2xl bg-intel-900 border border-intel-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-intel-gold" />
              <h2 className="text-sm font-bold text-white tracking-tight">TOP INFLUENTIAL & BRIDGE ENTITIES</h2>
            </div>
            <button
              onClick={() => onNavigate('entities')}
              className="text-xs text-intel-accent hover:underline font-mono"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {influential.map((inf, idx) => (
              <div
                key={inf.id}
                onClick={() => onSelectEntity(inf.id)}
                className="p-3 rounded-xl bg-intel-950 border border-intel-800 hover:border-intel-accent/50 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-7 h-7 rounded-lg bg-intel-800 flex items-center justify-center font-mono font-bold text-xs text-slate-300">
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-white">{inf.name}</h3>
                    <p className="text-[11px] text-slate-400">{inf.role}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-500 block uppercase">Influence Index</span>
                  <span className="text-xs font-extrabold text-intel-accent font-mono">
                    {inf.influence_score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Suspicious Pattern Alerts */}
        <div className="p-5 rounded-2xl bg-intel-900 border border-intel-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-intel-crimson" />
              <h2 className="text-sm font-bold text-white tracking-tight">HIGH PRIORITY ANOMALY ALERTS</h2>
            </div>
            <button
              onClick={() => onNavigate('alerts')}
              className="text-xs text-intel-accent hover:underline font-mono"
            >
              Alert Center
            </button>
          </div>

          <div className="space-y-2.5">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-xl bg-red-950/20 border border-red-900/40 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-red-400">{alert.rule_name}</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 font-mono">
                    {Math.round(alert.confidence * 100)}% CONFIDENCE
                  </span>
                </div>
                <h4 className="font-bold text-xs text-slate-200">{alert.title}</h4>
                <p className="text-[11px] text-slate-400 line-clamp-2">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
