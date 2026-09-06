import React, { useEffect, useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Phone, 
  Car, 
  MapPin, 
  CreditCard, 
  Users, 
  FileText, 
  Bot, 
  ExternalLink,
  Activity,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react';
import { fetchEntityDossier } from '../services/api';

export default function EntityDossier({ entityId, onClose, onOpenEvidence, onAskCopilot }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    setDossier(null);
    setError(null);
    fetchEntityDossier(entityId)
      .then((data) => {
        setDossier(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching dossier:', err);
        setError(err?.response?.data?.detail || err?.message || 'Failed to load entity details.');
        setLoading(false);
      });
  }, [entityId]);

  if (!entityId) return null;

  // Generate plain English "Why Should I Care?" explanation
  const getWhyShouldICareText = () => {
    if (!dossier || !dossier.entity) return "";
    const name = dossier.entity.canonical_name;
    const type = dossier.entity.entity_type;
    const betweenness = dossier.entity.betweenness || 0;
    const degree = dossier.entity.degree || (dossier.direct_associates?.length || 0);

    if (name.includes("Vikram Malhotra")) {
      return "Vikram operates as the central coordinator and structural bridge across logistics transport, Kolkata Hawala accounts, and Delhi SIM distribution. He received Rs 15 Lakh RTGS outbound after smurfing deposits into Apex Logistics.";
    }
    if (name.includes("Rajesh Thapa")) {
      return "Rajesh directs the North-East logistics transport wing, issuing dispatch orders to truck drivers and meeting customs contacts at Haldia Port.";
    }
    if (name.includes("Suresh Agarwal")) {
      return "Suresh manages the Park Street bullion and Hawala desk, initiating structured cash routing into front company accounts.";
    }
    if (name.includes("Apex Logistics")) {
      return "Front transport company whose HDFC account received 14 structured sub-50k deposits ('Smurfing') before transferring Rs 15 Lakh to Vikram Malhotra.";
    }
    if (name.includes("Inspector S. K. Roy")) {
      return "Port customs official flagged by surveillance for physical off-duty meetings with syndicate couriers at Haldia Port Terminal 4.";
    }
    if (name.includes("+91-98555-66778")) {
      return "Hardware burner SIM gateway shared concurrently by 3 key syndicate suspects across different jurisdictions.";
    }

    if (betweenness > 0.15) {
      return `${name} connects multiple otherwise isolated groups in the syndicate and participates in multi-modal relationships across ${degree} connected entities.`;
    }
    return `${name} is an active ${type.toLowerCase()} entity linked across ${degree} direct relationships in the investigation knowledge graph.`;
  };

  return (
    <div className="w-96 border-l border-intel-800 bg-intel-950/95 backdrop-blur flex flex-col h-full overflow-hidden shadow-2xl z-20 shrink-0 select-none">
      {/* Header */}
      <div className="p-4 border-b border-intel-800 flex items-center justify-between bg-intel-950/80">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-intel-accent" />
          <h2 className="font-bold text-sm text-slate-100 tracking-tight">ENTITY DOSSIER (360°)</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-intel-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-3">
          <Activity className="w-8 h-8 text-intel-accent animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Compiling intelligence dossier...</p>
        </div>
      ) : dossier ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Main Entity Card */}
          <div className="p-4 rounded-2xl bg-intel-900 border border-intel-700/80 space-y-3 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-intel-accent/20 text-intel-accent border border-intel-accent/30 font-bold">
                  {dossier.entity.entity_type}
                </span>
                <h3 className="text-base font-extrabold text-white mt-1.5">{dossier.entity.canonical_name}</h3>
                {dossier.entity.metadata?.aliases && (
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Aliases: <span className="text-slate-300 font-mono">{dossier.entity.metadata.aliases.join(', ')}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Risk Index</span>
                <span className="text-sm font-extrabold text-intel-crimson font-mono">
                  {Math.round((dossier.entity.risk_score || 0.5) * 100)}/100
                </span>
              </div>
            </div>

            {dossier.entity.metadata?.role && (
              <p className="text-[11px] text-amber-400/90 font-medium bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                ⚡ {dossier.entity.metadata.role}
              </p>
            )}

            {/* Quick Copilot Action */}
            <button
              onClick={() => onAskCopilot(`Why is ${dossier.entity.canonical_name} considered an important entity?`)}
              className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-intel-accent/15 hover:bg-intel-accent/25 text-intel-accent font-semibold border border-intel-accent/30 transition-all text-xs"
            >
              <Bot className="w-4 h-4" />
              <span>Ask AI Investigator About This Entity</span>
            </button>
          </div>

          {/* "WHY SHOULD I CARE?" Section */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-1.5">
            <div className="flex items-center space-x-1.5 text-indigo-300 font-mono text-[11px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Why Should I Care? (Investigative Significance)</span>
            </div>
            <p className="text-[11.5px] text-slate-200 leading-relaxed">
              {getWhyShouldICareText()}
            </p>

            <div className="pt-2 border-t border-indigo-500/20 flex items-center justify-between text-[10.5px] font-mono text-slate-400">
              <span>Bridge Score: {dossier.entity.betweenness || '0.00'}</span>
              <span>Connections: {dossier.direct_associates?.length || 0}</span>
            </div>
          </div>

          {/* Direct Associates */}
          {dossier.direct_associates?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-400 font-semibold font-mono text-[10px] uppercase">
                <Users className="w-3.5 h-3.5 text-intel-accent" />
                <span>Direct Associates ({dossier.direct_associates.length})</span>
              </div>
              <div className="space-y-1">
                {dossier.direct_associates.map((assoc, idx) => (
                  <div key={idx} className="p-2 rounded-xl bg-intel-900/60 border border-intel-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-200">{assoc.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{assoc.relationship}</span>
                    </div>
                    {assoc.doc_id && (
                      <button
                        onClick={() => onOpenEvidence(assoc.doc_id)}
                        title="View Evidence Source"
                        className="text-intel-accent hover:text-white p-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Associated Infrastructure */}
          <div className="space-y-3">
            {dossier.associated_phones?.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-semibold font-mono text-[10px] uppercase mb-1">
                  <Phone className="w-3.5 h-3.5 text-intel-emerald" />
                  <span>Linked Communications</span>
                </div>
                {dossier.associated_phones.map((p, idx) => (
                  <div key={idx} className="p-1.5 px-2.5 rounded bg-intel-900/40 border border-intel-800 font-mono text-slate-300 text-[11px] mb-1">
                    {p.name}
                  </div>
                ))}
              </div>
            )}

            {dossier.associated_vehicles?.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-semibold font-mono text-[10px] uppercase mb-1">
                  <Car className="w-3.5 h-3.5 text-intel-purple" />
                  <span>Linked Vehicles</span>
                </div>
                {dossier.associated_vehicles.map((v, idx) => (
                  <div key={idx} className="p-1.5 px-2.5 rounded bg-intel-900/40 border border-intel-800 font-mono text-slate-300 text-[11px] mb-1">
                    {v.name}
                  </div>
                ))}
              </div>
            )}

            {dossier.associated_accounts?.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-semibold font-mono text-[10px] uppercase mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Financial Channels</span>
                </div>
                {dossier.associated_accounts.map((acc, idx) => (
                  <div key={idx} className="p-1.5 px-2.5 rounded bg-intel-900/40 border border-intel-800 font-mono text-slate-300 text-[11px] mb-1">
                    {acc.name}
                  </div>
                ))}
              </div>
            )}

            {dossier.associated_locations?.length > 0 && (
              <div>
                <div className="flex items-center space-x-1.5 text-slate-400 font-semibold font-mono text-[10px] uppercase mb-1">
                  <MapPin className="w-3.5 h-3.5 text-intel-crimson" />
                  <span>Known Operating Locations</span>
                </div>
                {dossier.associated_locations.map((loc, idx) => (
                  <div key={idx} className="p-1.5 px-2.5 rounded bg-intel-900/40 border border-intel-800 text-slate-300 text-[11px] mb-1">
                    {loc.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Records */}
          {dossier.evidence_records?.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center space-x-1.5 text-slate-400 font-semibold font-mono text-[10px] uppercase">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Primary Document Evidence</span>
              </div>
              <div className="space-y-1.5">
                {dossier.evidence_records.map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={() => onOpenEvidence(doc.id)}
                    className="p-2 rounded-xl bg-intel-900/80 border border-intel-800 hover:border-intel-accent/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-intel-accent">{doc.id}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-intel-800 text-slate-400 font-mono">{doc.source_type}</span>
                    </div>
                    <p className="text-slate-300 font-medium text-[11px] mt-1 line-clamp-1">{doc.title}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : error ? (
        <div className="p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-xs text-red-400 font-mono font-semibold">Failed to Load Dossier</p>
          <p className="text-[11px] text-slate-400">{error}</p>
          <p className="text-[10px] text-slate-500 font-mono">Entity ID: {entityId}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchEntityDossier(entityId)
                .then((data) => { setDossier(data); setLoading(false); })
                .catch((err) => { setError(err?.response?.data?.detail || err?.message || 'Failed to load entity details.'); setLoading(false); });
            }}
            className="px-3 py-1.5 rounded-lg bg-intel-800 hover:bg-intel-700 text-slate-300 text-xs font-mono border border-intel-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="p-6 text-center text-slate-500 text-xs">Entity details not available.</div>
      )}
    </div>
  );
}
