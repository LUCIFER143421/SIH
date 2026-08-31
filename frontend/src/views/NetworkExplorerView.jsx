import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Layers, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import NetworkGraph from '../components/NetworkGraph';
import EntityDossier from '../components/EntityDossier';
import TemporalSlider from '../components/TemporalSlider';
import { fetchGraphData } from '../services/api';

export default function NetworkExplorerView({ 
  selectedEntityId, 
  onSelectEntity, 
  onOpenEvidence, 
  onAskCopilot,
  onStartDemo,
  refreshKey = 0,
  highlightNodeIds = [],
  highlightEdgeIds = []
}) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [], total_nodes: 0, total_edges: 0 });
  const [filterType, setFilterType] = useState('ALL');
  const [colorByCommunity, setColorByCommunity] = useState(false);
  const [minConfidence, setMinConfidence] = useState(0.0);
  const [dateTo, setDateTo] = useState(null);
  const [localHighlightNodes, setLocalHighlightNodes] = useState(highlightNodeIds);
  const [localHighlightEdges, setLocalHighlightEdges] = useState(highlightEdgeIds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGraph();
  }, [filterType, minConfidence, dateTo, refreshKey]);

  useEffect(() => {
    setLocalHighlightNodes(highlightNodeIds);
    setLocalHighlightEdges(highlightEdgeIds);
  }, [highlightNodeIds, highlightEdgeIds]);

  const loadGraph = () => {
    setLoading(true);
    const params = {
      min_confidence: minConfidence,
    };
    if (filterType !== 'ALL') {
      params.node_type = filterType;
    }
    if (dateTo) {
      params.date_to = dateTo;
    }

    fetchGraphData(params)
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching graph data:', err);
        setLoading(false);
      });
  };

  const handleDateRangeChange = (from, to) => {
    setDateTo(to);
  };

  const handleFindPathPrompt = () => {
    onAskCopilot('Show the connection path between Vikram Malhotra and Apex Logistics.');
  };

  return (
    <div className="flex flex-col h-full bg-intel-950 overflow-hidden select-none min-h-0">
      {/* Top Filter Bar */}
      <div className="h-12 border-b border-intel-800 bg-intel-950/90 px-5 flex items-center justify-between z-10 shrink-0 text-xs">
        <div className="flex items-center space-x-4">
          {/* Node Type Filter */}
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-intel-accent" />
            <span className="text-slate-400 font-mono">Entity Filter:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-intel-900 border border-intel-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-intel-accent"
            >
              <option value="ALL">All Entity Types</option>
              <option value="PERSON">Persons</option>
              <option value="PHONE">Phone Numbers</option>
              <option value="VEHICLE">Vehicles</option>
              <option value="LOCATION">Locations</option>
              <option value="ORGANIZATION">Organizations</option>
              <option value="ACCOUNT">Bank Accounts</option>
            </select>
          </div>

          {/* Color by Community Toggle */}
          <button
            onClick={() => setColorByCommunity(!colorByCommunity)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-mono transition-all ${
              colorByCommunity
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                : 'bg-intel-900 text-slate-400 border-intel-800 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Community Clusters</span>
          </button>
        </div>

        {/* Quick Intelligence Action */}
        <div className="flex items-center space-x-2">
          <button
            onClick={loadGraph}
            title="Refresh Graph Data"
            className="p-1 rounded-lg hover:bg-intel-800 text-slate-400 hover:text-white border border-intel-800 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleFindPathPrompt}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-intel-900 hover:bg-intel-800 text-slate-200 border border-intel-700 font-mono transition-colors text-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-intel-gold" />
            <span>Find Path (Vikram ↔ Apex)</span>
          </button>

          <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-intel-900 border border-intel-800">
            {graphData.total_nodes || 0} Nodes • {graphData.total_edges || 0} Edges
          </span>
        </div>
      </div>

      {/* Main Workspace (Graph Canvas + Entity Dossier Drawer) */}
      <div className="flex-1 flex overflow-hidden relative min-h-0 min-w-0">
        <div className="flex-1 h-full relative min-h-0 min-w-0 p-3">
          <NetworkGraph
            graphData={graphData}
            onSelectNode={(id) => onSelectEntity(id)}
            onSelectEdge={(edgeData) => {}}
            highlightNodeIds={localHighlightNodes}
            highlightEdgeIds={localHighlightEdges}
            colorByCommunity={colorByCommunity}
            onOpenEvidence={onOpenEvidence}
            onStartDemo={onStartDemo}
          />
        </div>

        {selectedEntityId && (
          <EntityDossier
            entityId={selectedEntityId}
            onClose={() => onSelectEntity(null)}
            onOpenEvidence={onOpenEvidence}
            onAskCopilot={onAskCopilot}
          />
        )}
      </div>

      {/* Bottom Temporal Slider */}
      <TemporalSlider onDateRangeChange={handleDateRangeChange} />
    </div>
  );
}
