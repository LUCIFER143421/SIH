import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Calendar, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import NetworkGraph from '../components/NetworkGraph';
import { fetchGraphData } from '../services/api';

const TIMELINE_MILESTONES = [
  {
    monthIndex: 0,
    monthKey: "2026-01-31",
    label: "January 2026",
    headline: "Contraband Interception at Dimapur",
    summary: "Dimapur Police intercept Tata cargo truck AS-01-XY-9821 near Dimapur Market. Escort vehicle NL-01-AB-1234 registered to Vikram Malhotra observed.",
    surgeNote: "Initial logistics nodes and driver Amit Kumar active.",
    activeEntitiesCount: 8,
    activeRelationsCount: 6,
    supportingDoc: "DOC_FIR_001"
  },
  {
    monthIndex: 1,
    monthKey: "2026-02-28",
    label: "February 2026",
    headline: "Hawala Structuring & Communication Burst (+340%)",
    summary: "Intensive 42-call burst recorded between Vikram Malhotra, Rajesh Thapa, and Suresh Agarwal. 14 structured deposits into Apex Logistics account followed by Rs 15L RTGS outbound to Vikram Malhotra.",
    surgeNote: "⚠️ Major activity spike: Hawala channel linked to logistics network.",
    activeEntitiesCount: 22,
    activeRelationsCount: 19,
    supportingDoc: "DOC_BANK_005"
  },
  {
    monthIndex: 2,
    monthKey: "2026-03-31",
    label: "March 2026",
    headline: "Cyber SIM Racket & Patna Safehouse Sighting",
    summary: "Cyber Cell raids uncover 300+ counterfeit SIMs distributed via Metro Telecom. Shared GSM gateway +91-98555-66778 identified. Amit Kumar & Tariq Ahmed sighted at Guwahati-Patna transit.",
    surgeNote: "Delhi tech cell and cross-border couriers fully integrated into syndicate.",
    activeEntitiesCount: 34,
    activeRelationsCount: 31,
    supportingDoc: "DOC_FIR_006"
  },
  {
    monthIndex: 3,
    monthKey: "2026-06-30",
    label: "April - June 2026",
    headline: "Centralized Multi-Cluster Syndicate Consolidation",
    summary: "Intelligence assessment confirms Vikram Malhotra operates as the central bridge interconnecting North-East Logistics, Kolkata Hawala, Haldia Port, and Delhi Tech cells.",
    surgeNote: "Full syndicate graph active with 38 entities and 37 relationships.",
    activeEntitiesCount: 38,
    activeRelationsCount: 37,
    supportingDoc: "DOC_INTEL_008"
  }
];

export default function TimelineView({ onSelectEntity, onOpenEvidence, onAskCopilot }) {
  const [currentStep, setCurrentStep] = useState(1); // Default to Feb (surge)
  const [isPlaying, setIsPlaying] = useState(false);
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], total_nodes: 0, total_edges: 0 });
  const [loading, setLoading] = useState(false);

  const activeMilestone = TIMELINE_MILESTONES[currentStep];

  useEffect(() => {
    loadTimelineGraph(activeMilestone.monthKey);
  }, [currentStep]);

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < TIMELINE_MILESTONES.length - 1) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return prev;
          }
        });
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const loadTimelineGraph = (dateTo) => {
    setLoading(true);
    fetchGraphData({ date_to: dateTo })
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching timeline graph data:', err);
        setLoading(false);
      });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <div className="flex flex-col h-full bg-intel-950 overflow-hidden select-none">
      {/* Top Banner */}
      <div className="h-14 border-b border-intel-800 bg-intel-950/90 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Time Machine: Syndicate Network Evolution</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                TEMPORAL RECONSTRUCTION
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Scrub through timeline to observe how nodes, calls, and financial paths emerged chronologically.
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-intel-800 hover:bg-intel-700 text-slate-200 border border-intel-700'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY EVOLUTION'}</span>
          </button>

          <button
            onClick={handleReset}
            title="Reset to Beginning"
            className="p-1.5 rounded-lg bg-intel-900 hover:bg-intel-800 text-slate-400 hover:text-white border border-intel-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <div className="px-3 py-1 rounded bg-intel-900 border border-intel-800 font-mono text-xs text-slate-300">
            {graphData.total_nodes} Nodes • {graphData.total_edges} Edges Active
          </div>
        </div>
      </div>

      {/* Main Workspace (Graph on Left + Temporal Insights Card on Right) */}
      <div className="flex-1 flex overflow-hidden min-h-0 min-w-0 p-4 gap-4">
        {/* Left: Interactive Canvas */}
        <div className="flex-1 h-full relative rounded-2xl border border-intel-800 overflow-hidden bg-[#070a10] shadow-2xl">
          <NetworkGraph
            graphData={graphData}
            onSelectNode={(id) => onSelectEntity && onSelectEntity(id)}
            onOpenEvidence={onOpenEvidence}
          />
        </div>

        {/* Right: Chronological Milestone Narrative Card */}
        <div className="w-96 flex flex-col space-y-4 shrink-0 overflow-y-auto pr-1">
          {/* Active Period Card */}
          <div className="p-5 rounded-2xl bg-intel-900 border border-intel-700 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-intel-accent/20 text-intel-accent border border-intel-accent/40">
                {activeMilestone.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Stage {currentStep + 1} of {TIMELINE_MILESTONES.length}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                {activeMilestone.headline}
              </h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {activeMilestone.summary}
              </p>
            </div>

            {/* AI Contextual Insight Callout */}
            <div className="p-3 rounded-xl bg-intel-950 border border-intel-800 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-intel-gold font-mono font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI TEMPORAL INTERPRETATION</span>
              </div>
              <p className="text-[11.5px] text-slate-300">
                {activeMilestone.surgeNote}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-1 flex items-center justify-between">
              {activeMilestone.supportingDoc && (
                <button
                  onClick={() => onOpenEvidence && onOpenEvidence(activeMilestone.supportingDoc)}
                  className="flex items-center space-x-1 text-xs font-mono text-intel-accent hover:underline"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View {activeMilestone.supportingDoc}</span>
                </button>
              )}

              <button
                onClick={() => onAskCopilot && onAskCopilot(`What happened during ${activeMilestone.label} in Operation ShadowNet?`)}
                className="px-3 py-1 rounded-lg bg-intel-800 hover:bg-intel-700 text-slate-200 border border-intel-700 font-mono text-[11px] transition-colors"
              >
                Ask AI Investigator →
              </button>
            </div>
          </div>

          {/* Chronological Steps Selector */}
          <div className="p-4 rounded-2xl bg-intel-900 border border-intel-800 space-y-2.5">
            <div className="text-[11px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              Investigation Stages
            </div>

            <div className="space-y-2">
              {TIMELINE_MILESTONES.map((m, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(idx);
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    idx === currentStep
                      ? 'bg-intel-accent/15 border-intel-accent/50 text-white shadow-md'
                      : 'bg-intel-950/60 border-intel-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold font-mono">
                      {m.label}
                    </div>
                    <div className="text-[11px] truncate max-w-[220px]">
                      {m.headline}
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${idx === currentStep ? 'bg-intel-accent animate-ping' : 'bg-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Timeline Step Slider */}
      <div className="h-16 border-t border-intel-800 bg-intel-950/90 px-8 flex items-center justify-between z-10 shrink-0">
        <div className="w-full flex items-center space-x-6">
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
            Timeline Scrubber:
          </span>
          <div className="flex-1 flex items-center space-x-3">
            {TIMELINE_MILESTONES.map((m, idx) => (
              <React.Fragment key={idx}>
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(idx);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl border font-mono text-xs transition-all text-center flex flex-col items-center ${
                    idx === currentStep
                      ? 'bg-intel-accent text-slate-950 font-bold border-intel-accent shadow-lg shadow-intel-accent/20'
                      : idx < currentStep
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-intel-900 text-slate-400 border-intel-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] font-bold">{m.label}</span>
                  <span className="text-[9px] opacity-80">{m.activeEntitiesCount} Nodes Active</span>
                </button>
                {idx < TIMELINE_MILESTONES.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
