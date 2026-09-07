import React, { useState } from 'react';
import { HelpCircle, Info } from 'lucide-react';

const METRIC_DEFINITIONS = {
  betweenness: {
    title: "Betweenness Centrality",
    text: "How much this person acts as a bridge connecting otherwise separate groups in the network."
  },
  pagerank: {
    title: "PageRank / Influence Score",
    text: "How central or important this person is, based on who they're connected to."
  },
  influence: {
    title: "Influence Score (PageRank)",
    text: "How central or important this person is, based on who they're connected to."
  },
  community: {
    title: "Community / Cluster (Louvain)",
    text: "A group of entities that interact closely with each other, separate from other groups."
  },
  cluster: {
    title: "Community / Cluster",
    text: "A group of entities that interact closely with each other, separate from other groups."
  },
  degree: {
    title: "Degree / Connection Count",
    text: "How many direct connections this entity has."
  },
  density: {
    title: "Graph Density",
    text: "The proportion of possible connections in the network that are actually present."
  }
};

export default function MetricTooltip({ term, text, title, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const def = (term && METRIC_DEFINITIONS[term.toLowerCase()]) || {
    title: title || "Metric Info",
    text: text || "Graph intelligence metric for criminal network analysis."
  };

  return (
    <span 
      className={`relative inline-flex items-center group cursor-help ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
      }}
    >
      <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-intel-accent transition-colors ml-1 inline shrink-0" />
      
      {isOpen && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 p-2.5 rounded-xl bg-intel-900 border border-intel-700 text-slate-200 text-[11px] font-sans shadow-2xl z-50 pointer-events-none text-left leading-tight backdrop-blur-md">
          <span className="block font-bold text-intel-accent font-mono text-[10.5px] uppercase tracking-wider mb-1">
            {def.title}
          </span>
          <span className="block text-slate-300 font-normal">
            {def.text}
          </span>
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-intel-700" />
        </span>
      )}
    </span>
  );
}
