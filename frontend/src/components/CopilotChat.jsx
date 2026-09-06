import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Wrench, 
  FileText, 
  Eye, 
  CornerDownRight, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { queryCopilot } from '../services/api';

export default function CopilotChat({ 
  onHighlightGraph, 
  onOpenEvidence, 
  onSelectEntity,
  initialQuery = null 
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `👋 **Welcome to CRIMENET AI Investigation Copilot.**

I analyze ingested FIRs, CDR communications, banking transfers, and surveillance reports through verified graph algorithms and analytics tools.

**Recommended Questions to Ask:**
- *"Why is Vikram Malhotra considered a high-importance bridge entity?"*
- *"Show the connection between Vikram Malhotra and Apex Logistics."*
- *"What suspicious patterns or anomalies have been detected?"*
- *"Who are the top 3 influential coordinators in this network?"*`,
      toolTraces: [],
      citations: [],
      followups: [
        "Why is Vikram Malhotra important?",
        "Find path between Vikram and Apex Logistics",
        "Show all detected suspicious anomalies"
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await queryCopilot(q);
      
      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        toolTraces: response.tool_traces || [],
        citations: response.evidence_citations || [],
        followups: response.suggested_followups || [],
        highlightNodes: response.highlight_node_ids || [],
        highlightEdges: response.highlight_edge_ids || []
      };

      setMessages((prev) => [...prev, assistantMsg]);
      // NOTE: We intentionally do NOT auto-call onHighlightGraph here because
      // that would navigate the user away from the Copilot tab to the Network tab.
      // The user can click the "Highlight Entities on Graph" button manually.
    } catch (err) {
      console.error('Copilot query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ **Error processing query**: Unable to connect to backend intelligence agent. Please ensure the backend is running.',
          toolTraces: [],
          citations: []
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-intel-950 border border-intel-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-3.5 border-b border-intel-800 bg-intel-900/80 backdrop-blur flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>Investigation Copilot</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                Agentic Tools
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Strictly Grounded • Zero Hallucination • Tool-Orchestrated</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-[11px] text-intel-emerald bg-intel-emerald/10 border border-intel-emerald/20 px-2.5 py-1 rounded-md font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Engine</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-[85%] p-3.5 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-intel-accent text-slate-950 font-medium rounded-tr-none shadow-md shadow-intel-accent/20'
                  : 'bg-intel-900 border border-intel-800 text-slate-200 rounded-tl-none space-y-3'
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed">
                {msg.content}
              </div>

              {/* Tool Traces Accordion */}
              {msg.toolTraces?.length > 0 && (
                <div className="pt-2 border-t border-intel-800 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    <Wrench className="w-3 h-3 text-purple-400" />
                    <span>Agent Tool Calls ({msg.toolTraces.length})</span>
                  </div>
                  <div className="space-y-1">
                    {msg.toolTraces.map((t, tIdx) => (
                      <div key={tIdx} className="p-1.5 px-2 rounded bg-intel-950/80 border border-intel-800 font-mono text-[10px]">
                        <span className="text-purple-300 font-bold">{t.tool_name}()</span>
                        <p className="text-slate-400 text-[9px] mt-0.5">{t.output_summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Citations */}
              {msg.citations?.length > 0 && (
                <div className="pt-2 border-t border-intel-800 space-y-1.5">
                  <div className="flex items-center space-x-1.5 text-[10px] font-mono uppercase text-slate-400 font-semibold">
                    <FileText className="w-3 h-3 text-amber-400" />
                    <span>Evidence Citations ({msg.citations.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {msg.citations.map((c, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => onOpenEvidence && onOpenEvidence(c.id)}
                        className="p-1.5 px-2 rounded bg-intel-950 border border-intel-800 hover:border-amber-500/50 text-left transition-colors flex items-center justify-between"
                      >
                        <div>
                          <span className="font-mono font-bold text-[10px] text-amber-400">{c.id}</span>
                          <span className="block text-[9px] text-slate-400 truncate max-w-[140px]">{c.title}</span>
                        </div>
                        <Eye className="w-3 h-3 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for Graph Highlight */}
              {msg.highlightNodes?.length > 0 && (
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => onHighlightGraph && onHighlightGraph(msg.highlightNodes, msg.highlightEdges)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-mono text-[10px] border border-purple-500/40 transition-colors"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Highlight {msg.highlightNodes.length} Entities on Graph</span>
                  </button>
                </div>
              )}
            </div>

            {/* Suggested Followups */}
            {msg.followups?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1 max-w-[85%]">
                {msg.followups.map((f, fIdx) => (
                  <button
                    key={fIdx}
                    onClick={() => handleSend(f)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-intel-900/90 border border-intel-700 hover:border-intel-accent text-slate-300 hover:text-white text-[10px] transition-all"
                  >
                    <CornerDownRight className="w-2.5 h-2.5 text-intel-accent" />
                    <span>{f}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 p-3 rounded-2xl bg-intel-900 border border-intel-800 text-slate-400 max-w-[50%]">
            <Bot className="w-4 h-4 text-purple-400 animate-spin" />
            <span className="font-mono text-xs">Invoking analytical graph tools...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-intel-800 bg-intel-900/50">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask an investigation question (e.g. 'Why is Vikram Malhotra important?')..."
            className="w-full pl-4 pr-12 py-2.5 bg-intel-950 border border-intel-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-intel-accent text-xs font-mono"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="absolute right-2 p-1.5 rounded-lg bg-intel-accent hover:bg-sky-400 text-slate-950 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
