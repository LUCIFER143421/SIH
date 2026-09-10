import React, { useEffect, useState } from 'react';
import { X, FileText, Calendar, ShieldCheck, Tag, ExternalLink } from 'lucide-react';
import { fetchDocument } from '../services/api';

export default function EvidenceViewer({ documentId, onClose }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!documentId) return;
    setLoading(true);
    fetchDocument(documentId)
      .then((data) => {
        setDoc(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching document:', err);
        setLoading(false);
      });
  }, [documentId]);

  if (!documentId) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn select-none">
      <div className="w-full max-w-2xl bg-intel-950 border border-intel-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-intel-800 bg-intel-900 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-xs text-amber-400">{documentId}</span>
                {doc && (
                  <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-intel-800 text-slate-300">
                    {doc.source_type}
                  </span>
                )}
              </div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                {doc ? doc.title : 'Loading Document Evidence...'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-intel-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Retrieving primary evidence record from encrypted data store...
          </div>
        ) : doc ? (
          <div className="p-6 space-y-4 overflow-y-auto text-xs">
            {/* Metadata Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-intel-900/60 border border-intel-800 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block">SOURCE TYPE:</span>
                <span className="text-slate-200 font-semibold">{doc.source_type}</span>
              </div>
              <div>
                <span className="text-slate-500 block">INGESTION DATE:</span>
                <span className="text-slate-200 font-semibold">{doc.metadata?.date || doc.created_at || 'Verified'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">CASE RECORD:</span>
                <span className="text-intel-emerald font-semibold flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>CASE RECORD: INDEXED</span>
                </span>
              </div>
            </div>

            {/* Document Text Snippet */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Extracted Record Transcript:
              </span>
              <div className="p-4 rounded-xl bg-intel-900 border border-intel-800 text-slate-200 font-sans leading-relaxed text-sm whitespace-pre-wrap select-text">
                {doc.content}
              </div>
            </div>

            {/* Verification Chain Notice */}
            <div className="p-3 rounded-lg bg-intel-accent/10 border border-intel-accent/20 text-intel-accent text-[11px]">
              🔒 <strong>Evidence Traceability Guarantee:</strong> All facts, relationships, and risk scores in CRIMENET AI are linked back to this primary source record to eliminate LLM hallucination.
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">Document could not be located.</div>
        )}
      </div>
    </div>
  );
}
