import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Bot, 
  ExternalLink, 
  Filter,
  Sparkles
} from 'lucide-react';
import { fetchAlerts, verifyAlert } from '../services/api';

export default function AnomalyAlerts({ 
  onSelectEntity, 
  onOpenEvidence, 
  onAskCopilot, 
  onHighlightEntities 
}) {
  const [alerts, setAlerts] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = () => {
    setLoading(true);
    fetchAlerts()
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching alerts:', err);
        setLoading(false);
      });
  };

  const handleVerify = async (alertId, status) => {
    try {
      await verifyAlert(alertId, status);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, status } : a))
      );
    } catch (err) {
      console.error('Error updating alert:', err);
    }
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filterSeverity === 'ALL') return true;
    return a.severity === filterSeverity;
  });

  return (
    <div className="flex flex-col h-full bg-intel-950 p-6 space-y-5 overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-intel-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 text-intel-crimson" />
            <h1 className="text-lg font-extrabold text-white tracking-tight">SUSPICIOUS PATTERN & ANOMALY CENTER</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explainable heuristic & statistical alerts. Decision-support output requiring human verification.
          </p>
        </div>

        {/* Severity Filters */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>
          {['ALL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                filterSeverity === sev
                  ? 'bg-intel-accent text-slate-950 shadow-md'
                  : 'bg-intel-900 border border-intel-800 text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12 text-slate-400 text-xs font-mono">
          Scanning graph topology and transaction streams for anomalies...
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all space-y-3.5 ${
                alert.severity === 'HIGH'
                  ? 'bg-red-950/20 border-red-900/50 hover:border-red-500/50'
                  : 'bg-amber-950/20 border-amber-900/50 hover:border-amber-500/50'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        alert.severity === 'HIGH'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {alert.severity} PRIORITY
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{alert.rule_name}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white leading-tight">{alert.title}</h3>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    alert.status === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : alert.status === 'DISMISSED'
                      ? 'bg-slate-800 text-slate-500'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  }`}
                >
                  {alert.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

              {/* Affected Entities */}
              {alert.entity_ids?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                    Flagged Entities / Suspects:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {alert.entity_ids.map((eid, eIdx) => (
                      <button
                        key={eIdx}
                        onClick={() => onSelectEntity && onSelectEntity(eid)}
                        className="px-2 py-0.5 rounded bg-intel-900 border border-intel-700 hover:border-intel-accent text-[11px] font-mono text-slate-200 transition-colors"
                      >
                        {eid}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Records */}
              {alert.evidence_document_ids?.length > 0 && (
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold">Supporting Evidence:</span>
                  <div className="flex items-center space-x-1.5">
                    {alert.evidence_document_ids.map((did, dIdx) => (
                      <button
                        key={dIdx}
                        onClick={() => onOpenEvidence && onOpenEvidence(did)}
                        className="flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono hover:bg-amber-500/20 transition-all"
                      >
                        <FileText className="w-3 h-3" />
                        <span>{did}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-intel-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onAskCopilot(`Investigate anomaly alert: ${alert.title}`)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-intel-accent/15 hover:bg-intel-accent/25 text-intel-accent text-xs font-semibold border border-intel-accent/30 transition-all"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Investigate</span>
                  </button>

                  <button
                    onClick={() => onHighlightEntities && onHighlightEntities(alert.entity_ids)}
                    className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-intel-900 hover:bg-intel-800 text-slate-300 text-xs border border-intel-700 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Highlight</span>
                  </button>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleVerify(alert.id, 'VERIFIED')}
                    title="Confirm Alert as Verified finding"
                    className="p-1 rounded-lg hover:bg-emerald-950 text-emerald-400 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleVerify(alert.id, 'DISMISSED')}
                    title="Dismiss as False Positive"
                    className="p-1 rounded-lg hover:bg-red-950 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-xs">No alerts found for this filter.</div>
      )}
    </div>
  );
}
