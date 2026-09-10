import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, Cpu, Eye, Sparkles } from 'lucide-react';
import { ingestDocument, fetchDocuments } from '../services/api';

const SAMPLE_RECORDS = [
  {
    title: 'FIR #304/2026 - Guwahati Narcotics Intercept',
    sourceType: 'FIR',
    content: 'On 05 March 2026, Guwahati Transit Yard officers intercepted driver Amit Kumar operating vehicle AS-01-XY-9821. Amit Kumar stated he received dispatch calls from Rajesh Thapa via phone +91-98111-22334. Transactions linked to Axis Bank account AXIS-SB-4455667788 held by Vikram Malhotra.'
  },
  {
    title: 'FIR #412/2026 - Siliguri Highway Interception',
    sourceType: 'FIR',
    content: 'On 18 March 2026, Siliguri Special Task Force intercepted Mahindra Bolero WB-02-CD-5678 driven by suspect Deepak Chawla near Siliguri Junction Depot. The suspect admitted receiving direct transport instructions from Rajesh Thapa via burner phone +91-98111-22334. Field search revealed a consignment manifest referencing Apex Logistics Pvt Ltd and destination coordinator Vikram Malhotra using phone +91-98765-43210.'
  },
  {
    title: 'FIR #509/2026 - Kolkata Port Hawala Intercept',
    sourceType: 'FIR',
    content: 'On 24 March 2026, Kolkata Police Crime Branch apprehended cash courier Tariq Ahmed near Haldia Port Terminal 4. Courier was in possession of Rs 12,00,000 unaccounted cash received from Suresh Agarwal at Park Street Plaza Office. Interrogation logs confirm funds were scheduled for deposit into HDFC account HDFC-CA-9988221100 before wire transfer to Axis Bank account AXIS-SB-4455667788 held by Vikram Malhotra. Customs Inspector S. K. Roy was observed meeting Tariq Ahmed prior to apprehension.'
  },
  {
    title: 'INTEL #88/2026 - Karol Bagh Tech Arcade SIM Raid',
    sourceType: 'INTEL',
    content: 'Cyber Cell raid at Karol Bagh Tech Arcade in New Delhi uncovered a counterfeit SIM card racket managed by Mohit Verma through Metro Telecom Solutions. Seized hardware logs confirm shared GSM gateway line +91-98555-66778 was actively used to coordinate cash transits towards Patna Safehouse Flat 3B and Dimapur Market Warehouse with courier Tariq Ahmed and logistics head Rajesh Thapa.'
  }
];

export default function IngestionModal({ onDocumentIngested, onOpenEvidence }) {
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState('FIR');
  const [content, setContent] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [docList, setDocList] = useState([]);
  const [sampleIndex, setSampleIndex] = useState(0);

  useEffect(() => {
    loadDocs();
  }, []);

  const loadDocs = () => {
    fetchDocuments().then(setDocList).catch(console.error);
  };

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || ingesting) return;

    setIngesting(true);
    try {
      const res = await ingestDocument(title, sourceType, content);
      setLastResult(res);
      setTitle('');
      setContent('');
      loadDocs();
      if (onDocumentIngested) onDocumentIngested();
    } catch (err) {
      console.error('Ingestion error:', err);
    } finally {
      setIngesting(false);
    }
  };

  const loadNextSample = () => {
    const sample = SAMPLE_RECORDS[sampleIndex];
    setTitle(sample.title);
    setSourceType(sample.sourceType);
    setContent(sample.content);
    setSampleIndex((prev) => (prev + 1) % SAMPLE_RECORDS.length);
  };

  return (
    <div className="flex flex-col h-full bg-intel-950 p-6 space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-intel-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Upload className="w-6 h-6 text-intel-accent" />
            <h1 className="text-lg font-extrabold text-white tracking-tight">DATA INGESTION & NLP EXTRACTION PIPELINE</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ingest unstructured FIRs, CDR dumps, and intelligence reports. Automatically extracts entities, types, and typed relationships.
          </p>
        </div>

        <button
          onClick={loadNextSample}
          className="px-3.5 py-1.5 rounded-lg bg-intel-900 border border-intel-700 hover:border-intel-accent text-xs font-mono text-intel-accent transition-colors flex items-center space-x-1.5 shadow-sm active:scale-95"
          title="Click to cycle between 4 different pre-formatted sample FIR & Intel reports"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Insert Sample #{((sampleIndex) % SAMPLE_RECORDS.length) + 1} ({SAMPLE_RECORDS[sampleIndex].sourceType})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ingestion Form */}
        <form onSubmit={handleIngest} className="space-y-4 p-4 rounded-xl bg-intel-900 border border-intel-800">
          <h2 className="text-sm font-bold text-slate-200">Ingest New Document</h2>
          
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">UPLOAD FROM DISK (OPTIONAL)</label>
              <input
                type="file"
                accept=".txt,.json,.csv,.log,.md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (!title) {
                      setTitle(file.name.replace(/\.[^/.]+$/, ''));
                    }
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setContent(event.target.result || '');
                    };
                    reader.readAsText(file);
                  }
                }}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-intel-800 file:text-intel-accent hover:file:bg-intel-700 cursor-pointer bg-intel-950 border border-intel-700 rounded-lg p-1.5"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">DOCUMENT TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. FIR #402/2026 - Dimapur Narcotics Intercept"
                className="w-full px-3 py-2 text-xs bg-intel-950 border border-intel-700 rounded-lg text-slate-200 focus:outline-none focus:border-intel-accent font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">SOURCE TYPE</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-intel-950 border border-intel-700 rounded-lg text-slate-200 focus:outline-none focus:border-intel-accent font-mono"
              >
                <option value="FIR">FIR / Police Incident Report</option>
                <option value="CDR">Call Detail Record (CDR) Dump</option>
                <option value="BANK">Financial / STR Transaction Report</option>
                <option value="SURVEILLANCE">Field Surveillance Observation</option>
                <option value="INTEL">Intelligence Agency Intercept</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">UNSTRUCTURED RECORD TEXT</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Paste raw police report or CDR text..."
                className="w-full px-3 py-2 text-xs bg-intel-950 border border-intel-700 rounded-lg text-slate-200 focus:outline-none focus:border-intel-accent font-sans leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={ingesting}
              className="w-full py-2.5 rounded-lg bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Cpu className="w-4 h-4" />
              <span>{ingesting ? 'EXTRACTING ENTITIES & BUILDING GRAPH...' : 'RUN NLP INGESTION PIPELINE'}</span>
            </button>
          </div>
        </form>

        {/* Live Extraction Results & Ingested Document List */}
        <div className="space-y-4">
          {lastResult && (
            <div className="p-4 rounded-xl bg-intel-emerald/10 border border-intel-emerald/30 space-y-3 animate-fadeIn">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>NLP Knowledge Extraction Completed</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-intel-950/60 border border-intel-800">
                  <span className="text-slate-400 text-[10px] block">ENTITIES DISCOVERED</span>
                  <span className="text-white font-bold text-sm">{lastResult.extracted_entities_count}</span>
                </div>
                <div className="p-2 rounded bg-intel-950/60 border border-intel-800">
                  <span className="text-slate-400 text-[10px] block">RELATIONSHIPS FORMED</span>
                  <span className="text-white font-bold text-sm">{lastResult.extracted_relationships_count}</span>
                </div>
              </div>
            </div>
          )}

          {/* Ingested Documents List */}
          <div className="p-4 rounded-xl bg-intel-900 border border-intel-800 space-y-3">
            <h3 className="text-xs font-mono uppercase text-slate-400 font-semibold">
              Currently Ingested Case Documents ({docList.length})
            </h3>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {docList.length > 0 ? (
                docList.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => onOpenEvidence && onOpenEvidence(d.id)}
                    className="p-2.5 rounded-lg bg-intel-950 border border-intel-800 hover:border-intel-accent/50 cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono font-bold text-intel-accent">{d.id}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-intel-800 text-slate-400 font-mono">
                          {d.source_type}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium text-xs mt-0.5">{d.title}</p>
                    </div>
                    <Eye className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No documents ingested in this session. Add an FIR or Intel report above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
