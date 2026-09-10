import React, { useState } from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  FileText, 
  Cpu, 
  GitMerge, 
  Network, 
  Clock, 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  Target, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

const STORY_STEPS = [
  {
    step: 1,
    title: "1. Fragmented Evidence Ingestion",
    icon: FileText,
    badge: "RAW INTELLIGENCE",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    headline: "Law enforcement receives disconnected multi-source data.",
    body: "Police reports (FIRs), Call Detail Records (CDRs), FIU Suspicious Transaction Reports (STRs), and field surveillance logs arrive as unstructured documents across different jurisdictions.",
    callout: "8 Ingested Evidence Documents: Dimapur PS, DRI Kolkata, Haldia Customs, FIU STR #882, Kolkata Cyber Cell.",
    targetTab: "documents",
    actionPrompt: "View Evidence Records →"
  },
  {
    step: 2,
    title: "2. Automated NLP Entity & Relation Discovery",
    icon: Cpu,
    badge: "HYBRID NLP PIPELINE",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    headline: "CRIMENET AI extracts typed entities and directional relationships.",
    body: "Using spaCy statistical NER and specialized pattern regexes for Indian phone formats (+91), vehicle registrations (NL/AS/WB), and bank accounts (HDFC/AXIS), the system automatically identifies entities and links them with sentence-level citations.",
    callout: "38 Entities Extracted • 37 Verified Relationships Reconstructed with 100% Document Traceability.",
    targetTab: "dashboard",
    actionPrompt: "Review Case Overview →"
  },
  {
    step: 3,
    title: "3. Entity Resolution & Alias Deduplication",
    icon: GitMerge,
    badge: "HUMAN-IN-THE-LOOP",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    headline: "Resolving fragmented aliases into canonical suspects.",
    body: "Criminals use multiple aliases across jurisdictions (e.g., 'Vicky M.', 'V. Malhotra', 'Vikram Malhotra'). The resolution engine flags high-confidence phonetic and token-sort matches for human investigator review.",
    callout: "Resolved: 'V. Malhotra' & 'Vicky M.' confirmed as aliases of Vikram Malhotra (PER_001).",
    targetTab: "resolution",
    actionPrompt: "Open Entity Resolution →"
  },
  {
    step: 4,
    title: "4. Focus Person Network Intelligence",
    icon: Network,
    badge: "EGO-NETWORK VIEW",
    badgeColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    headline: "Simplifying complex graphs into actionable 1-hop / 2-hop views.",
    body: "Instead of overwhelming investigators with an unreadable web of nodes, CRIMENET provides instant Focus Person mode. Investigators can inspect Vikram Malhotra's immediate sphere of influence in a single clean radial perspective.",
    callout: "Vikram Malhotra holds Betweenness Centrality of 0.48, acting as the structural bridge across 3 isolated clusters.",
    targetTab: "network",
    actionPrompt: "Explore Focus Person Graph →"
  },
  {
    step: 5,
    title: "5. Temporal Reconstruction (Time Machine)",
    icon: Clock,
    badge: "NETWORK EVOLUTION",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    headline: "Watch the criminal syndicate form and evolve over time.",
    body: "Scrubbing through time (Jan - Jun 2026) reveals how initial vehicle procurements in January led to high-volume Hawala fund transfers and pre-incident communication surges in February.",
    callout: "February 2026: Activity spike with +340% CDR call frequency and 14 structured deposits into Apex Logistics.",
    targetTab: "timeline",
    actionPrompt: "Launch Time Machine →"
  },
  {
    step: 6,
    title: "6. Explainable Anomaly Detection",
    icon: AlertTriangle,
    badge: "SIGNAL DETECTION",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
    headline: "Automated flagging of AML structuring and burner SIM sharing.",
    body: "CRIMENET computes explainable anomaly alerts without black-box guessing: Hawala smurfing deposits (sub-50k deposits summing to Rs 15L), call frequency bursts, and shared GSM gateway devices.",
    callout: "5 Active Investigative Signals: Structuring, Cross-Community Bridge, Shared SIM, Port Co-occurrence.",
    targetTab: "alerts",
    actionPrompt: "Inspect Anomaly Center →"
  },
  {
    step: 7,
    title: "7. Hypothesis-Driven Investigation",
    icon: HelpCircle,
    badge: "DECISION SUPPORT",
    badgeColor: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    headline: "Test investigative theories against evidence and counter-signals.",
    body: "Investigator tests hypothesis: 'Is Vikram Malhotra coordinating both logistics and Hawala wings?'. The system evaluates supporting signals (4 financial links, 42 calls, surveillance) and explicitly notes potential contradictions.",
    callout: "Assessment: HIGH-VALUE INVESTIGATIVE LEAD (86% Confidence). Shows what could disprove the hypothesis.",
    targetTab: "leads",
    actionPrompt: "Test Investigative Hypotheses →"
  },
  {
    step: 8,
    title: "8. 'What-If' Network Disruption Simulation",
    icon: ShieldAlert,
    badge: "TOPOLOGICAL RESILIENCE",
    badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    headline: "Simulate the structural fallout of neutralizing a key coordinator.",
    body: "Simulates removing Vikram Malhotra from the network graph: structural connectivity drops by 68%, fragmenting the syndicate into disconnected clusters and shifting operational fallback to Rajesh Thapa.",
    callout: "Decision-support simulation identifying critical structural dependencies before enforcement operations.",
    targetTab: "leads",
    actionPrompt: "Run Disruption Simulator →"
  },
  {
    step: 9,
    title: "9. Next Best Investigative Action",
    icon: Target,
    badge: "ACTIONABLE LEADS",
    badgeColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
    headline: "AI recommends what to investigate next and why.",
    body: "Rather than leaving investigators to wonder what to do next, the system ranks prioritized investigative steps (e.g. Subpoena CDR for shared GSM burner +91-98555-66778, Audit Apex Logistics HDFC account).",
    callout: "Top Recommendation: Subpoena CDR for Shared Burner SIM used by 3 suspects.",
    targetTab: "leads",
    actionPrompt: "View Next Best Actions →"
  },
  {
    step: 10,
    title: "10. Evidence Traceability & Responsible AI",
    icon: CheckCircle2,
    badge: "VERIFIED CONCLUSION",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    headline: "From fragmented evidence to explainable investigative leads.",
    body: "Every finding, node, edge, and alert traces back to primary source documents. CRIMENET AI functions strictly as a decision-support copilot where human investigators verify every lead before legal action.",
    callout: "Complete 360° Traceability • Evidence-Grounded AI Guarantee • Ready for SIH 2026 Evaluation.",
    targetTab: "dashboard",
    actionPrompt: "Return to Case Overview →"
  }
];

export default function InvestigationStoryModal({ isOpen, onClose, onNavigateTab }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const current = STORY_STEPS[currentStepIndex];
  const IconComponent = current.icon;

  const handleNext = () => {
    if (currentStepIndex < STORY_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleAction = () => {
    if (onNavigateTab && current.targetTab) {
      onNavigateTab(current.targetTab);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-intel-900 border border-intel-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-intel-800 flex items-center justify-between bg-intel-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded-lg bg-intel-accent/20 border border-intel-accent/40 text-intel-accent">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-intel-accent uppercase font-bold tracking-wider">
                SIH 2026 Demo Walkthrough (3-Minute Overview)
              </div>
              <h2 className="text-base font-extrabold text-white">
                CRIMENET AI Investigation Story
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-intel-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicator Bar */}
        <div className="px-6 pt-3 pb-1 bg-intel-950/40 border-b border-intel-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Step {currentStepIndex + 1} of {STORY_STEPS.length}</span>
          <div className="flex items-center space-x-1.5">
            {STORY_STEPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStepIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStepIndex 
                    ? 'w-6 bg-intel-accent' 
                    : idx < currentStepIndex 
                    ? 'w-2 bg-emerald-500/80' 
                    : 'w-2 bg-intel-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Step Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold border ${current.badgeColor}`}>
              {current.badge}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Case: Operation ShadowNet
            </span>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-intel-800 border border-intel-700 flex items-center justify-center text-intel-accent shrink-0 mt-0.5">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {current.title}
              </h3>
              <p className="text-sm font-semibold text-intel-accent mt-0.5">
                {current.headline}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {current.body}
          </p>

          <div className="p-3.5 rounded-xl bg-intel-950 border border-intel-800 text-xs text-slate-200 flex items-center space-x-2.5">
            <div className="w-2 h-2 rounded-full bg-intel-gold animate-pulse shrink-0" />
            <span className="font-mono text-[11.5px] leading-snug">
              {current.callout}
            </span>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 py-4 bg-intel-950 border-t border-intel-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-intel-800 text-slate-300 hover:text-white hover:bg-intel-800 disabled:opacity-30 disabled:pointer-events-none font-mono text-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleAction}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-intel-800 hover:bg-intel-700 text-intel-accent border border-intel-700 font-mono text-xs transition-colors"
            >
              <span>{current.actionPrompt}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center space-x-1 px-4 py-1.5 rounded-lg bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-lg shadow-intel-accent/20"
            >
              <span>{currentStepIndex === STORY_STEPS.length - 1 ? 'Finish Story' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
