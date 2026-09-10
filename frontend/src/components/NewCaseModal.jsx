import React, { useState } from 'react';
import { FolderPlus, X, FileText, Sparkles, CheckCircle2 } from 'lucide-react';

export default function NewCaseModal({ isOpen, onClose, onCreateCase }) {
  const [caseName, setCaseName] = useState('');
  const [caseId, setCaseId] = useState('');
  const [description, setDescription] = useState('');
  const [initialFIRTitle, setInitialFIRTitle] = useState('');
  const [initialFIRContent, setInitialFIRContent] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caseName.trim()) return;

    onCreateCase({
      name: caseName.trim(),
      id: caseId.trim() || `CASE-${Date.now().toString().slice(-6)}`,
      description: description.trim() || 'Custom independent law enforcement investigation session.',
      initialFIR: initialFIRTitle && initialFIRContent ? {
        title: initialFIRTitle.trim(),
        content: initialFIRContent.trim()
      } : null
    });

    setCaseName('');
    setCaseId('');
    setDescription('');
    setInitialFIRTitle('');
    setInitialFIRContent('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none animate-fadeIn">
      <div className="relative w-full max-w-lg bg-intel-950 border border-intel-700 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-intel-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-intel-accent/20 border border-intel-accent/40 text-intel-accent">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white font-mono">Create New Investigation Case</h2>
              <p className="text-[11px] text-slate-400">Initialize a new independent investigation workspace from scratch.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-intel-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold text-slate-300">
              Case Name / Title <span className="text-intel-accent">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Operation RedStorm (Highway Contraband)"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-intel-900 border border-intel-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-intel-accent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                Custom Case ID
              </label>
              <input
                type="text"
                placeholder="e.g., FIR-DEL-2026-88"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-intel-900 border border-intel-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-intel-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">
                Classification / Agency
              </label>
              <input
                type="text"
                disabled
                value="CRIMENET AI • MHA PS 26189"
                className="w-full px-3.5 py-2 rounded-xl bg-intel-900/60 border border-intel-800 text-xs font-mono text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">
              Case Objective / Brief
            </label>
            <textarea
              rows={2}
              placeholder="Summary of suspected syndicate activity, jurisdictions, and operational scope..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-intel-900 border border-intel-700 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-intel-accent resize-none"
            />
          </div>

          {/* Optional First Document Ingestion */}
          <div className="p-3.5 rounded-2xl bg-intel-900/80 border border-intel-800 space-y-2.5">
            <div className="flex items-center space-x-2 text-xs font-mono text-intel-accent font-bold">
              <FileText className="w-3.5 h-3.5" />
              <span>Optional: Ingest Initial FIR / Incident Report</span>
            </div>

            <input
              type="text"
              placeholder="FIR Title (e.g. FIR #01/2026 - Initial Transit Intercept)"
              value={initialFIRTitle}
              onChange={(e) => setInitialFIRTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-intel-950 border border-intel-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-intel-accent"
            />

            <textarea
              rows={2}
              placeholder="Paste raw police FIR narrative text here (entities will be extracted automatically)..."
              value={initialFIRContent}
              onChange={(e) => setInitialFIRContent(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-intel-950 border border-intel-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-intel-accent resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-intel-900 hover:bg-intel-800 text-slate-300 text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-lg shadow-intel-accent/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Case Workspace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
