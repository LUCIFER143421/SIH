import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  ShieldAlert, 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  Play, 
  Activity, 
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { 
  testHypothesis, 
  fetchDisruptionSimulation, 
  fetchHiddenIntermediaries, 
  fetchNextActions 
} from '../services/api';
import MetricTooltip from '../components/MetricTooltip';

export default function InvestigativeLeadsView({ onSelectEntity, onOpenEvidence, onAskCopilot, onNavigateTab }) {
  const [activeTab, setActiveTab] = useState('hypothesis'); // 'hypothesis' | 'simulator' | 'gaps' | 'next_actions'
  
  // Hypothesis State
  const [selectedHypothesisId, setSelectedHypothesisId] = useState('vikram_coordination');
  const [hypothesisResult, setHypothesisResult] = useState(null);
  const [testingHypothesis, setTestingHypothesis] = useState(false);

  // Disruption Simulation State
  const [simTargetNode, setSimTargetNode] = useState('PER_001');
  const [simulationResult, setSimulationResult] = useState(null);
  const [runningSimulation, setRunningSimulation] = useState(false);

  // Hidden Gaps & Next Actions
  const [gaps, setGaps] = useState([]);
  const [nextActions, setNextActions] = useState([]);

  useEffect(() => {
    runHypothesisTest(selectedHypothesisId);
    runSimulation(simTargetNode);
    fetchHiddenIntermediaries().then(setGaps).catch(console.error);
    fetchNextActions().then(setNextActions).catch(console.error);
  }, []);

  const runHypothesisTest = (hypId) => {
    setTestingHypothesis(true);
    testHypothesis(hypId)
      .then((res) => {
        setHypothesisResult(res);
        setTestingHypothesis(false);
      })
      .catch((err) => {
        console.error(err);
        setTestingHypothesis(false);
      });
  };

  const runSimulation = (nodeId) => {
    setRunningSimulation(true);
    fetchDisruptionSimulation(nodeId)
      .then((res) => {
        setSimulationResult(res);
        setRunningSimulation(false);
      })
      .catch((err) => {
        console.error(err);
        setRunningSimulation(false);
      });
  };

  return (
    <div className="flex flex-col h-full bg-intel-950 overflow-hidden select-none">
      {/* Top Navigation Tabs */}
      <div className="h-14 border-b border-intel-800 bg-intel-950/90 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Investigative Reasoning & Hypothesis Testing</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                DECISION SUPPORT
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Evaluate theories, simulate network vulnerability, and identify next investigative steps.
            </p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-intel-900 border border-intel-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('hypothesis')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'hypothesis'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hypothesis Testing
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'simulator'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Disruption Simulator
          </button>

          <button
            onClick={() => setActiveTab('gaps')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'gaps'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Network Gaps ({gaps.length})
          </button>

          <button
            onClick={() => setActiveTab('next_actions')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeTab === 'next_actions'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Next Best Actions ({nextActions.length})
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* --- TAB 1: HYPOTHESIS TESTING --- */}
        {activeTab === 'hypothesis' && (
          <div className="space-y-6">
            {/* Hypothesis Selector Bar */}
            <div className="p-4 rounded-2xl bg-intel-900 border border-intel-800 space-y-3">
              <div className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
                Select Investigative Hypothesis to Test
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'vikram_coordination', label: '1. Vikram Malhotra Coordinates Logistics & Hawala' },
                  { id: 'port_customs_collusion', label: '2. Customs Inspector S. K. Roy Facilitates Port Clearance' },
                  { id: 'shell_company_laundering', label: '3. Apex Logistics & Horizon Gold Are Layering Shells' }
                ].map((hyp) => (
                  <button
                    key={hyp.id}
                    onClick={() => {
                      setSelectedHypothesisId(hyp.id);
                      runHypothesisTest(hyp.id);
                    }}
                    className={`p-3 rounded-xl border text-left font-mono text-xs transition-all ${
                      selectedHypothesisId === hyp.id
                        ? 'bg-indigo-500/20 border-indigo-500/60 text-white font-bold shadow-md'
                        : 'bg-intel-950 border-intel-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {hyp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Evaluation Result */}
            {hypothesisResult && (
              <div className="p-6 rounded-2xl bg-intel-900 border border-intel-700 space-y-5 shadow-2xl">
                {/* Result Header */}
                <div className="flex items-start justify-between border-b border-intel-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {hypothesisResult.assessment}
                      </span>
                      <span className="text-xs font-mono text-slate-400">
                        Confidence: <strong className="text-white">{hypothesisResult.confidence_percent}%</strong> (Based on Multi-Modal Correlation)
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-white mt-1">
                      {hypothesisResult.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => onAskCopilot && onAskCopilot(`Explain the evidence behind the hypothesis: "${hypothesisResult.title}"`)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-intel-800 hover:bg-intel-700 text-intel-accent border border-intel-700 font-mono text-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask AI Investigator →</span>
                  </button>
                </div>

                {/* Supporting vs Contradictory Evidence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Supporting Signals */}
                  <div className="p-4 rounded-xl bg-intel-950 border border-intel-800 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Supporting Evidence Signals ({hypothesisResult.supporting_signals?.length})</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      {hypothesisResult.supporting_signals?.map((sig, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contradictory / Unverified Signals */}
                  <div className="p-4 rounded-xl bg-intel-950 border border-intel-800 space-y-3">
                    <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
                      <AlertCircle className="w-4 h-4" />
                      <span>Uncertainties & Contradictions</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
                      {hypothesisResult.contradicting_signals?.map((sig, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{sig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* What could disprove this */}
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5 text-xs text-slate-300">
                  <div className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
                    Falsification Criteria (What Could Disprove This Hypothesis?)
                  </div>
                  <p className="leading-relaxed">
                    {hypothesisResult.what_could_disprove}
                  </p>
                </div>

                {/* Supporting Documents */}
                <div className="flex items-center justify-between pt-2 border-t border-intel-800 text-xs font-mono">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <span>Cited Evidence Sources:</span>
                    <div className="flex items-center space-x-2">
                      {hypothesisResult.supporting_documents?.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => onOpenEvidence && onOpenEvidence(doc.id)}
                          className="px-2 py-0.5 rounded bg-intel-800 hover:bg-intel-700 text-intel-accent border border-intel-700 flex items-center space-x-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>{doc.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="text-slate-400">
                    Recommended Next Step: <strong className="text-intel-accent">{hypothesisResult.recommended_action}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: NETWORK DISRUPTION SIMULATOR --- */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-intel-900 border border-intel-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Topological Network Disruption Simulator ("What-If" Analysis)
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Simulate how the criminal network fragments if a key coordinator or infrastructure node is neutralized.
                  </p>
                </div>

                {/* Select Suspect Node */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono text-slate-400">Target Node:</span>
                  <select
                    value={simTargetNode}
                    onChange={(e) => {
                      setSimTargetNode(e.target.value);
                      runSimulation(e.target.value);
                    }}
                    className="bg-intel-950 border border-intel-700 rounded-lg px-3 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    <option value="PER_001">Vikram Malhotra (Kingpin / Bridge)</option>
                    <option value="PER_002">Rajesh Thapa (Logistics Head)</option>
                    <option value="PER_004">Suresh Agarwal (Hawala Operator)</option>
                    <option value="PER_006">Mohit Verma (Burner SIM Vendor)</option>
                    <option value="PER_007">Tariq Ahmed (Cash & Port Courier)</option>
                  </select>

                  <button
                    onClick={() => runSimulation(simTargetNode)}
                    className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-lg shadow-rose-500/20"
                  >
                    SIMULATE REMOVAL
                  </button>
                </div>
              </div>
            </div>

            {/* Simulation Metrics Dashboard */}
            {runningSimulation ? (
              <div className="p-16 flex flex-col items-center justify-center space-y-3 rounded-2xl bg-intel-900 border border-intel-800">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span className="font-mono text-xs text-slate-400">Simulating network fragmentation impact...</span>
              </div>
            ) : simulationResult ? (
              <div className="p-6 rounded-2xl bg-intel-900 border border-intel-700 space-y-6 shadow-2xl">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center">
                      <span>Estimated Fragmentation</span>
                      <MetricTooltip term="density" />
                    </div>
                    <div className="text-2xl font-black text-rose-400 font-mono">
                      {simulationResult.fragmentation_percent}%
                    </div>
                    <div className="text-[10px] text-slate-500">Structural connectivity drop</div>
                  </div>

                  <div className="p-4 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center">
                      <span>Isolated Sub-Clusters</span>
                      <MetricTooltip term="cluster" />
                    </div>
                    <div className="text-2xl font-black text-amber-400 font-mono">
                      {simulationResult.after_components} Clusters
                    </div>
                    <div className="text-[10px] text-slate-500">From {simulationResult.before_components} connected core</div>
                  </div>

                  <div className="p-4 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center">
                      <span>Directly Severed Associates</span>
                      <MetricTooltip term="degree" />
                    </div>
                    <div className="text-2xl font-black text-intel-accent font-mono">
                      {simulationResult.affected_direct_neighbors_count} Nodes
                    </div>
                    <div className="text-[10px] text-slate-500">Immediate first-hop dependencies</div>
                  </div>

                  <div className="p-4 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                    <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center">
                      <span>Primary Fallback Bridge</span>
                      <MetricTooltip term="betweenness" />
                    </div>
                    <div className="text-base font-bold text-emerald-400 truncate">
                      {simulationResult.primary_fallback_bridge}
                    </div>
                    <div className="text-[10px] text-slate-500">New central coordinator</div>
                  </div>
                </div>

                {/* Plain English Summary */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-1 text-xs text-slate-300">
                  <div className="text-[11px] font-mono font-bold text-rose-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Topological Disruption Impact</span>
                  </div>
                  <p className="leading-relaxed">
                    {simulationResult.plain_english_summary}
                  </p>
                </div>

                {/* Remaining Critical Bridges */}
                <div className="space-y-3">
                  <div className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center">
                    <span>New Successor Bridge Nodes (Post-Disruption Network)</span>
                    <MetricTooltip term="betweenness" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {simulationResult.remaining_bridges?.map((b, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-intel-950 border border-intel-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">{b.name}</span>
                          <span className="text-[10px] font-mono text-intel-accent">Score: {b.new_betweenness}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{b.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs rounded-2xl bg-intel-900 border border-intel-800">
                Select a suspect node and click "SIMULATE REMOVAL" to calculate disruption fragmentation.
              </div>
            )}
          </div>
        )}

        {/* --- TAB 3: NETWORK GAPS (HIDDEN INTERMEDIARIES) --- */}
        {activeTab === 'gaps' && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
              Detected Unobserved Intermediaries & Structural Gaps ({gaps.length})
            </div>

            {gaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gaps.map((gap) => (
                  <div key={gap.id} className="p-5 rounded-2xl bg-intel-900 border border-intel-700/80 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {gap.gap_type}
                      </span>
                      <span className="text-xs font-mono text-slate-400">Confidence: {Math.round(gap.confidence * 100)}%</span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {gap.cluster_a} ⟷ {gap.cluster_b}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                        {gap.why_suspicious}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-intel-950 border border-intel-800 text-xs text-slate-300 space-y-1">
                      <div className="text-[10.5px] font-mono font-bold text-intel-accent uppercase">Suggested Investigative Lead:</div>
                      <p className="text-[11.5px]">{gap.suggested_lead}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500 text-xs rounded-2xl bg-intel-900 border border-intel-800">
                No unobserved network gaps detected in current graph topology.
              </div>
            )}
          </div>
        )}

        {/* --- TAB 4: NEXT BEST INVESTIGATIVE ACTIONS --- */}
        {activeTab === 'next_actions' && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
              AI-Ranked Next Best Investigative Actions
            </div>

            {nextActions.length > 0 ? (
              <div className="space-y-3">
                {nextActions.map((action, idx) => (
                  <div
                    key={action.id}
                    className="p-4 rounded-2xl bg-intel-900 border border-intel-700/80 flex items-start justify-between space-x-4 shadow-lg hover:border-intel-accent/50 transition-all"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-400 flex items-center justify-center font-mono font-bold text-xs shrink-0 mt-0.5">
                        #{idx + 1}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold ${
                            action.priority === 'HIGH' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {action.priority} PRIORITY
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            Target: <strong className="text-slate-200">{action.target_entity}</strong> ({action.target_type})
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-white">
                          {action.title}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {action.why}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (action.action_category === 'FINANCIAL_SUBPOENA' && onNavigateTab) {
                          onNavigateTab('financial');
                        } else if (action.supporting_doc && onOpenEvidence) {
                          onOpenEvidence(action.supporting_doc);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-intel-800 hover:bg-intel-700 text-intel-accent border border-intel-700 font-mono text-xs whitespace-nowrap shrink-0 transition-colors"
                    >
                      {action.action_button_label} →
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-16 text-center text-slate-500 text-xs rounded-2xl bg-intel-900 border border-intel-800">
                No recommended investigative actions generated yet. Ingest documents or load the demo investigation.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
