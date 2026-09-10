import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Database, 
  Network, 
  Lock, 
  Server, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { fetchSystemInfo } from '../services/api';
import MetricTooltip from './MetricTooltip';

export default function TransparencyView() {
  const [sysInfo, setSysInfo] = useState(null);

  useEffect(() => {
    fetchSystemInfo().then(setSysInfo).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col h-full bg-intel-950 p-6 space-y-6 overflow-y-auto select-none">
      {/* Header */}
      <div className="border-b border-intel-800 pb-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-6 h-6 text-intel-emerald" />
          <h1 className="text-lg font-extrabold text-white tracking-tight">AI TRANSPARENCY, RESPONSIBLE AI & CONFLICTING EVIDENCE</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Explainable AI principles, evidence-grounding constraints, and non-deterministic conflict verification.
        </p>
      </div>

      {/* Responsible AI: What AI Does vs What AI Does NOT Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 shadow-lg">
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>What CRIMENET AI Does (Decision Support)</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 leading-relaxed font-mono">
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Extracts structured entities and directional links from unstructured FIRs/CDRs.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Recommends alias deduplication candidates with explicit similarity scoring.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="flex items-center">
                <span>Detects mathematical anomalies: Betweenness bridges, CDR surges, and Hawala structuring.</span>
                <MetricTooltip term="betweenness" />
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Requires human investigator verification for every finding before legal action.</span>
            </li>
          </ul>
        </div>

        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-3 shadow-lg">
          <div className="flex items-center space-x-2 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
            <XCircle className="w-4 h-4" />
            <span>What CRIMENET AI Does NOT Do</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200 leading-relaxed font-mono">
            <li className="flex items-start space-x-2">
              <span className="text-red-400 font-bold">✕</span>
              <span>Does NOT determine legal guilt or declare suspects "confirmed criminals".</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 font-bold">✕</span>
              <span>Does NOT replace sworn law enforcement officers or judicial proceedings.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 font-bold">✕</span>
              <span>Does NOT transmit sensitive case records to public cloud LLM servers.</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-red-400 font-bold">✕</span>
              <span>Does NOT fabricate facts or output ungrounded speculative accusations.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Conflicting Evidence Engine Demo */}
      <div className="p-5 rounded-2xl bg-intel-900 border border-intel-700 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-intel-800 pb-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Conflicting Evidence Engine (Responsible AI Case Demonstration)
            </h2>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            UNRESOLVED CONTRADICTION
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-intel-950 border border-intel-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-intel-accent">Evidence Record A: DOC_SURV_003</span>
              <span className="text-[10px] font-mono text-slate-400">Feb 10, 2026</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Field surveillance log places suspect <strong>Rajesh Thapa (PER_002)</strong> at Haldia Port Terminal 4 meeting Customs Inspector S. K. Roy.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-intel-950 border border-intel-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold font-mono text-amber-400">Evidence Record B: DOC_CDR_004</span>
              <span className="text-[10px] font-mono text-slate-400">Feb 10, 2026</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Cell tower triangulation on phone +91-98111-22334 logs active tower ping near Guwahati Transit Yard at the exact same timestamp.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1.5 text-slate-300">
          <div className="text-[11px] font-mono font-bold text-amber-300 uppercase">AI Handling & Non-Autonomous Guardrail:</div>
          <p className="leading-relaxed">
            CRIMENET AI recognizes this spatial-temporal contradiction. Rather than hallucinating or picking one source, the system flags the conflict as <strong>UNRESOLVED</strong> and recommends human verification (investigating whether a clone SIM / courier handover occurred).
          </p>
        </div>
      </div>

      {/* Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-intel-900 border border-intel-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">INFERENCE ENGINE</span>
          <p className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Cpu className="w-4 h-4 text-intel-accent" />
            <span>Local Open-Weight LLM</span>
          </p>
          <span className="text-[11px] font-mono text-intel-emerald">100% Offline / Private</span>
        </div>

        <div className="p-4 rounded-2xl bg-intel-900 border border-intel-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">KNOWLEDGE GRAPH</span>
          <p className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Network className="w-4 h-4 text-purple-400" />
            <span>In-Memory NetworkX MultiGraph</span>
          </p>
          <span className="text-[11px] font-mono text-slate-300">Pluggable Graph Store Interface (Current: NetworkX)</span>
        </div>

        <div className="p-4 rounded-2xl bg-intel-900 border border-intel-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">DATABASE STORAGE</span>
          <p className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Database className="w-4 h-4 text-amber-400" />
            <span>SQLite WAL Embedded</span>
          </p>
          <span className="text-[11px] font-mono text-slate-300">Zero Cloud Transmission</span>
        </div>

        <div className="p-4 rounded-2xl bg-intel-900 border border-intel-800 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400">DECISION SUPPORT COMPLIANCE</span>
          <p className="text-sm font-bold text-white flex items-center space-x-1.5">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Human-in-the-Loop</span>
          </p>
          <span className="text-[11px] font-mono text-slate-300">No Definitive Guilt Claims</span>
        </div>
      </div>
    </div>
  );
}
