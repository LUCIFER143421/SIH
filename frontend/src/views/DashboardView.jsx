import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  Network, 
  Sparkles, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  TrendingUp,
  Compass,
  Play,
  CreditCard,
  Phone,
  Target,
  BookOpen
} from 'lucide-react';
import { fetchNetworkStats, fetchAlerts, fetchCentrality } from '../services/api';
import MetricTooltip from '../components/MetricTooltip';

export default function DashboardView({ 
  onNavigate, 
  onSelectEntity, 
  onStartDemo, 
  isDemoLoading, 
  onOpenStoryModal,
  onOpenTutorial,
  activeCase,
  onOpenNewCase
}) {
  const [stats, setStats] = useState({
    total_entities: 0,
    total_relationships: 0,
    total_documents: 0,
    total_alerts: 0,
    total_communities: 0,
    high_risk_entities_count: 0
  });
  const [influentialEntities, setInfluentialEntities] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchNetworkStats().then(setStats).catch(console.error),
      fetchCentrality(4).then(setInfluentialEntities).catch(console.error),
      fetchAlerts().then((a) => setActiveAlerts(a.slice(0, 3))).catch(console.error)
    ]).finally(() => setLoading(false));
  }, []);

  const hasData = stats.total_entities > 0;
  const currentCaseName = activeCase?.name || (hasData ? 'Operation ShadowNet' : 'New Investigation Workspace');
  const currentCaseId = activeCase?.id || (hasData ? 'SIH-26189-SHADOWNET' : 'CASE-NEW-001');
  const currentCaseDesc = activeCase?.description || (
    hasData 
      ? 'Dimapur → Kolkata Contraband Transit, Hawala Layering & Corrupt Port Clearance Network'
      : 'Active investigation workspace. Ingest incident records, FIRs, or CDR dumps to reconstruct multi-modal intelligence graphs.'
  );

  return (
    <div className="flex-1 overflow-y-auto bg-intel-950 p-6 space-y-6 select-none">
      {/* Top Case Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-intel-900 via-intel-900/90 to-intel-950 border border-intel-700/80 p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold border ${
                hasData 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {hasData ? 'ACTIVE INVESTIGATION' : 'WORKSPACE READY'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Case ID: {currentCaseId}
              </span>
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight uppercase">
              {currentCaseName}
            </h1>
            <p className="text-xs text-slate-300 font-mono">
              {currentCaseDesc}
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {onOpenStoryModal && hasData && activeCase?.name === 'Operation ShadowNet' && (
              <button
                onClick={onOpenStoryModal}
                className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-xl shadow-intel-accent/25 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>START DEMO STORY (3 MIN)</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-intel-900 hover:bg-intel-800 text-intel-accent border border-intel-700/80 font-mono text-xs transition-colors shadow-sm active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>Feature Guide (Tutorial)</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('network')}
              className="flex items-center space-x-1.5 px-3.5 py-2.5 rounded-xl bg-intel-800 hover:bg-intel-700 text-slate-200 border border-intel-700 font-mono text-xs transition-colors"
            >
              <span>Explore Graph →</span>
            </button>
          </div>
        </div>

        {/* Live Case Counts Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-intel-800">
          <div className="p-3 rounded-xl bg-intel-950/80 border border-intel-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-white font-mono">{stats.total_documents}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Evidence Records</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-intel-950/80 border border-intel-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-white font-mono">{stats.total_entities}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Resolved Entities</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-intel-950/80 border border-intel-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-white font-mono">{stats.total_relationships}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Reconstructed Links</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-intel-950/80 border border-intel-800 flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-lg font-black text-white font-mono">{stats.total_alerts}</div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Active Anomalies</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Investigation Brief & Why This Matters */}
      {stats.total_entities > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: AI Investigation Brief */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-intel-900 border border-intel-700/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 rounded-md bg-intel-gold/20 text-intel-gold border border-intel-gold/30">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-xs font-mono font-bold text-intel-gold uppercase tracking-wider">
                  AI Investigation Executive Brief
                </h2>
              </div>
              <span className="text-[10.5px] font-mono text-slate-400">
                Generated by CRIMENET Copilot
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
              {activeCase?.name === 'Operation ShadowNet' ? (
                <>
                  <p className="font-semibold text-sm text-white">
                    CRIMENET AI identified a highly coordinated syndicate linking North-East transport logistics, Kolkata Hawala desks, and corrupt customs clearance at Haldia Port.
                  </p>
                  <p className="text-slate-300">
                    <strong>Vikram Malhotra (PER_001)</strong> emerges as the primary high-value investigative lead. He operates as the central structural bridge across three isolated syndicate clusters and shows synchronized activity surges during the contraband shipment window in February 2026.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-semibold text-sm text-white">
                    CRIMENET AI reconstructed an intelligence graph containing {stats.total_entities} entities and {stats.total_relationships} relationships across {stats.total_documents} evidence records.
                  </p>
                  <p className="text-slate-300">
                    {influentialEntities.length > 0 ? (
                      <>
                        <strong>{influentialEntities[0].name} ({influentialEntities[0].id})</strong> emerges as the top ranked lead with influence score {influentialEntities[0].influence_score}.
                      </>
                    ) : (
                      <>Ingested records have been indexed into the investigation workspace.</>
                    )}
                  </p>
                </>
              )}
            </div>

            {/* "Why This Matters" / Key Analytical Signals */}
            {activeCase?.name === 'Operation ShadowNet' ? (
              <div className="space-y-2 pt-2 border-t border-intel-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                  Why This Lead Matters (Key Analytical Signals)
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-intel-accent">
                      <span className="w-2 h-2 rounded-full bg-intel-accent" />
                      <span>1. Cross-Community Bridge</span>
                      <MetricTooltip term="betweenness" />
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Holds top Betweenness Centrality (0.48), directly bridging logistics, Hawala, and tech rings.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>2. Financial Structuring</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Receiver of Rs 15,00,000 RTGS payout following 14 structured sub-50k deposits into Apex Logistics.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>3. Pre-Incident Call Surge</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      +340% communication volume spike with transport and finance coordinators between Feb 12-16.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-purple-400">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>4. Shared Gateway SIM</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Concurrent hardware usage of shared burner SIM +91-98555-66778 with logistics head and courier.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-2 border-t border-intel-800">
                <div className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                  Case Network Topology
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-intel-accent">
                      <span className="w-2 h-2 rounded-full bg-intel-accent" />
                      <span>Graph Density</span>
                      <MetricTooltip term="density" />
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Network density score: {stats.density || 0.0} across {stats.total_communities || 1} clusters.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>High Risk Leads</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      {stats.high_risk_entities_count || 0} entities flagged with elevated risk indicators.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-between">
              {influentialEntities.length > 0 && (
                <button
                  onClick={() => {
                    onSelectEntity(influentialEntities[0].id);
                    onNavigate('network');
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-md shadow-intel-accent/20"
                >
                  <span>Investigate {influentialEntities[0].name} (Focus Mode) →</span>
                </button>
              )}

              <button
                onClick={() => onNavigate('leads')}
                className="text-xs font-mono text-intel-accent hover:underline flex items-center space-x-1 ml-auto"
              >
                <span>Test Investigative Hypothesis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Col: Top Ranked Leads & Next Action */}
          <div className="space-y-4">
            {/* Top Leads Box */}
            <div className="p-5 rounded-3xl bg-intel-900 border border-intel-700/80 space-y-3 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <span>Priority Investigative Leads</span>
                  <MetricTooltip term="influence" />
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Ranked by Influence</span>
              </div>

              <div className="space-y-2">
                {loading ? (
                  <div className="p-4 text-center text-slate-500 text-xs font-mono">
                    Loading ranked leads...
                  </div>
                ) : influentialEntities.length > 0 ? (
                  influentialEntities.map((ent, idx) => (
                    <button
                      key={ent.id}
                      onClick={() => {
                        onSelectEntity(ent.id);
                        onNavigate('network');
                      }}
                      className="w-full p-2.5 rounded-xl bg-intel-950 hover:bg-intel-800/80 border border-intel-800 text-left transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white group-hover:text-intel-accent flex items-center space-x-1.5">
                          <span className="text-slate-500 font-mono text-[10px]">#{idx + 1}</span>
                          <span>{ent.name}</span>
                        </div>
                        <div className="text-[10.5px] text-slate-400 font-mono">
                          {ent.role || ent.type} • Score: {ent.influence_score}
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-intel-accent transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-500 text-xs">
                    No entities ranked yet. Ingest documents or load the demo investigation.
                  </div>
                )}
              </div>
            </div>

            {/* Quick Jump to Next Action */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-teal-500/15 via-intel-900 to-intel-950 border border-teal-500/30 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-teal-300 uppercase">
                <Target className="w-3.5 h-3.5" />
                <span>Recommended Next Step</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Subpoena CDR records for shared burner SIM (+91-98555-66778) used concurrently by 3 key suspects.
              </p>
              <button
                onClick={() => onNavigate('leads')}
                className="text-[11px] font-mono text-teal-300 hover:underline flex items-center space-x-1 pt-1"
              >
                <span>View All Recommended Actions →</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Investigation State after Reset */
        <div className="p-12 rounded-3xl bg-intel-900/60 border border-intel-800 text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-intel-950 border border-intel-800 flex items-center justify-center text-intel-accent shadow-xl">
            <FileText className="w-8 h-8" />
          </div>
          
          <div className="max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-black text-white font-mono">
              Investigation Workspace Ready
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              No active evidence records, suspects, or phone logs currently indexed. Ingest raw FIRs, CDR manifests, or financial intelligence reports to begin automated network reconstruction.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('documents')}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-xl shadow-intel-accent/20 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Ingest FIR / Evidence Document →</span>
            </button>

            {onOpenNewCase && (
              <button
                onClick={onOpenNewCase}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-intel-900 hover:bg-intel-800 text-intel-accent border border-intel-700 font-mono text-xs transition-all active:scale-95"
              >
                <span>+ Create Custom Case Title</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                onClick={onOpenTutorial}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-intel-900 hover:bg-intel-800 text-teal-300 border border-teal-500/40 font-mono text-xs transition-all active:scale-95 shadow-lg shadow-teal-500/10"
              >
                <BookOpen className="w-4 h-4" />
                <span>System Guide (Tutorial)</span>
              </button>
            )}

            {onStartDemo && (
              <button
                onClick={onStartDemo}
                disabled={isDemoLoading}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-intel-800 hover:bg-intel-700 text-slate-200 border border-intel-700 font-mono text-xs transition-all active:scale-95 disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>{isDemoLoading ? 'Loading Scenario...' : 'Load Sample Case (Operation ShadowNet)'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
