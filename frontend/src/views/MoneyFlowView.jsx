import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ArrowRight, 
  ShieldAlert, 
  FileText, 
  Sparkles, 
  Building2, 
  User, 
  ExternalLink,
  Layers,
  ArrowDown
} from 'lucide-react';
import { fetchFinancialFlow } from '../services/api';

export default function MoneyFlowView({ onSelectEntity, onOpenEvidence, onAskCopilot }) {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialFlow()
      .then((data) => {
        setFinancialData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading financial flow:', err);
        setLoading(false);
      });
  }, []);

  const layeringSteps = [
    {
      step: 1,
      entityId: "PER_004",
      name: "Suresh Agarwal",
      type: "PERSON / HAWALA OPERATOR",
      role: "Hawala Desk Operator (Park Street)",
      action: "Initiates Hawala cash deposits into front company accounts",
      amount: "Rs 15,00,000 (Aggregated)",
      badge: "ORIGIN OF ILLICIT FUNDS",
      badgeColor: "bg-red-500/20 text-red-400 border-red-500/30",
      docId: "DOC_INTEL_002"
    },
    {
      step: 2,
      entityId: "ORG_001",
      name: "Apex Logistics Pvt Ltd",
      type: "ORGANIZATION / FRONT ENTITY",
      role: "Front Transport Company (Dir. Neha Sen)",
      action: "Receives 14 structured deposits of Rs 49,000 each (Smurfing)",
      amount: "14 x Rs 49,000 Deposits",
      badge: "SMURFING CONSOLIDATION",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      docId: "DOC_BANK_005"
    },
    {
      step: 3,
      entityId: "ACC_001",
      name: "HDFC-CA-9988221100",
      type: "CURRENT ACCOUNT",
      role: "HDFC Corporate Pool (Apex Logistics)",
      action: "Consolidates deposits and executes single high-value RTGS transfer",
      amount: "Rs 15,00,000 (RTGS Outbound)",
      badge: "BANKING LAYERING CHANNEL",
      badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      docId: "DOC_BANK_005"
    },
    {
      step: 4,
      entityId: "ACC_002",
      name: "AXIS-SB-4455667788",
      type: "SAVINGS ACCOUNT",
      role: "Axis Bank Personal Account",
      action: "Destination account receiving layered RTGS payout",
      amount: "Rs 15,00,000 Received",
      badge: "PAYOUT RECEIVER",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      docId: "DOC_BANK_005"
    },
    {
      step: 5,
      entityId: "PER_001",
      name: "Vikram Malhotra",
      type: "PERSON / KINGPIN",
      role: "Syndicate Coordinator",
      action: "Account holder and ultimate beneficiary of Hawala transfer chain",
      amount: "Beneficiary Payout",
      badge: "FINAL DESTINATION",
      badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      docId: "DOC_INTEL_008"
    }
  ];

  return (
    <div className="flex flex-col h-full bg-intel-950 overflow-y-auto select-none p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-intel-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Financial Intelligence: Hawala Layering & Fund Structuring</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                AML FLOW ANALYSIS
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Reconstruction of money routing from Hawala desk through corporate front accounts to the syndicate coordinator.
            </p>
          </div>
        </div>

        <button
          onClick={() => onAskCopilot && onAskCopilot("Explain the financial transactions linking Suresh Agarwal, Apex Logistics, and Vikram Malhotra.")}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-intel-900 hover:bg-intel-800 text-intel-accent border border-intel-700 font-mono text-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask AI Investigator About Fund Flow →</span>
        </button>
      </div>

      {/* AML Alert Flag Summary Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
            Detected Financial Structuring (FIU STR #882 / AML Rule 4.2)
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            14 cash deposits of Rs 49,000 were structured consecutively into Apex Logistics (HDFC-CA-9988221100) specifically to avoid the mandatory Rs 50,000 CTR / PAN reporting threshold ("Smurfing"), followed by an immediate single RTGS transfer of Rs 15,00,000 to Vikram Malhotra's Axis Bank savings account.
          </p>
        </div>
      </div>

      {/* Flow Diagram (Horizontal Stepper on Desktop / Vertical on Mobile) */}
      <div className="space-y-3">
        <div className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">
          Multi-Hop Hawala Transfer Chain (A → B → C → D → E)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {layeringSteps.map((step, idx) => (
            <div
              key={step.step}
              className="relative p-4 rounded-2xl bg-intel-900 border border-intel-700/80 hover:border-intel-accent/60 transition-all flex flex-col justify-between space-y-3 shadow-lg group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold border ${step.badgeColor}`}>
                    {step.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    Step {step.step}
                  </span>
                </div>

                <div>
                  <button
                    onClick={() => onSelectEntity && onSelectEntity(step.entityId)}
                    className="text-sm font-bold text-white group-hover:text-intel-accent text-left transition-colors truncate w-full"
                  >
                    {step.name}
                  </button>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {step.type}
                  </div>
                </div>

                <p className="text-[11.5px] text-slate-300 leading-snug">
                  {step.action}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-intel-800">
                <div className="text-[11px] font-mono font-bold text-intel-gold">
                  {step.amount}
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={() => onOpenEvidence && onOpenEvidence(step.docId)}
                    className="text-[10px] font-mono text-intel-accent hover:underline flex items-center space-x-1"
                  >
                    <FileText className="w-3 h-3" />
                    <span>{step.docId}</span>
                  </button>

                  <button
                    onClick={() => onSelectEntity && onSelectEntity(step.entityId)}
                    className="text-[10px] font-mono text-slate-400 hover:text-white"
                  >
                    Dossier →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Structured Account Comparison & Audit Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="p-5 rounded-2xl bg-intel-900 border border-intel-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <Building2 className="w-4 h-4 text-intel-accent" />
              <span>Front Entity: Apex Logistics Pvt Ltd</span>
            </h3>
            <span className="text-[11px] font-mono text-amber-400">Risk Score: 0.90</span>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 font-mono">
            <div>• Registered Account: HDFC-CA-9988221100</div>
            <div>• Authorized Signatory: Neha Sen (Director)</div>
            <div>• Registered Address: Park Street Plaza Office, Kolkata</div>
            <div>• Consignment Cargo: Escort vehicle WB-02-CD-5678 (Mahindra Bolero)</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-intel-900 border border-intel-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
              <User className="w-4 h-4 text-purple-400" />
              <span>Kingpin Receiver: Vikram Malhotra</span>
            </h3>
            <span className="text-[11px] font-mono text-purple-400">Risk Score: 0.94</span>
          </div>

          <div className="text-xs text-slate-300 space-y-1.5 font-mono">
            <div>• Personal Account: AXIS-SB-4455667788</div>
            <div>• Primary Burner SIM: +91-98765-43210 (Airtel)</div>
            <div>• Escort Vehicle: NL-01-AB-1234 (Toyota Fortuner)</div>
            <div>• Network Centrality: 0.48 Betweenness (Top Structural Bridge)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
