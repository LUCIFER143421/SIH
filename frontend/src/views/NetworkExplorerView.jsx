import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  Layers, 
  Sparkles,
  RefreshCw,
  User,
  Network,
  Eye,
  Sliders,
  X,
  ArrowRight,
  GitFork
} from 'lucide-react';
import NetworkGraph from '../components/NetworkGraph';
import EntityDossier from '../components/EntityDossier';
import TemporalSlider from '../components/TemporalSlider';
import { fetchGraphData, fetchEntities } from '../services/api';

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
  const [graphMode, setGraphMode] = useState('focus'); // 'focus' | 'full'
  const [focusPerson, setFocusPerson] = useState(selectedEntityId || '');
  const [focusDepth, setFocusDepth] = useState(1);
  const [availablePersons, setAvailablePersons] = useState([]);
  
  const [filterType, setFilterType] = useState('ALL');
  const [colorByCommunity, setColorByCommunity] = useState(false);
  const [dateTo, setDateTo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Relationship Visibility Filters
  const [relFilters, setRelFilters] = useState({
    COMMUNICATION: true,
    FINANCIAL: true,
    EMPLOYMENT: true,
    LOCATION: true,
    VEHICLE: true,
    OWNERSHIP: true
  });

  // Sync focusPerson when selectedEntityId changes from outside (e.g., global search)
  useEffect(() => {
    if (selectedEntityId && selectedEntityId !== focusPerson) {
      setFocusPerson(selectedEntityId);
      setGraphMode('focus'); // Switch to focus mode to center the searched entity
    }
  }, [selectedEntityId]);

  useEffect(() => {
    loadGraph();
    fetchEntities('PERSON').then((persons) => {
      setAvailablePersons(persons);
      if (persons && persons.length > 0 && !focusPerson) {
        setFocusPerson(persons[0].id);
      }
    }).catch(console.error);
  }, [filterType, dateTo, refreshKey]);

  const loadGraph = () => {
    setLoading(true);
    const params = {};
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

  const [showPathModal, setShowPathModal] = useState(false);
  const [pathSource, setPathSource] = useState('');
  const [pathTarget, setPathTarget] = useState('');

  const handleDateRangeChange = (from, to) => {
    setDateTo(to);
  };

  const toggleRelFilter = (cat) => {
    setRelFilters(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleExecutePathSearch = () => {
    const srcNode = graphData.nodes.find(n => n.id === pathSource) || { label: pathSource };
    const tgtNode = graphData.nodes.find(n => n.id === pathTarget) || { label: pathTarget };
    const srcLabel = srcNode.label || srcNode.id || 'Source Entity';
    const tgtLabel = tgtNode.label || tgtNode.id || 'Target Entity';
    setShowPathModal(false);
    onAskCopilot(`Trace the shortest connection path between ${srcLabel} and ${tgtLabel}.`);
  };

  const handleQuickDemoPath = (srcName, tgtName) => {
    setShowPathModal(false);
    onAskCopilot(`Show the connection path between ${srcName} and ${tgtName}.`);
  };

  return (
    <div className="flex flex-col h-full bg-intel-950 overflow-hidden select-none min-h-0">
      {/* Top Controls Bar */}
      <div className="h-14 border-b border-intel-800 bg-intel-950/90 px-5 flex items-center justify-between z-10 shrink-0 text-xs">
        {/* Left: Mode Switcher (Focus Person vs Full Network) */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center p-1 rounded-xl bg-intel-900 border border-intel-800 font-mono">
            <button
              onClick={() => setGraphMode('focus')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                graphMode === 'focus'
                  ? 'bg-intel-accent text-slate-950 font-bold shadow-md shadow-intel-accent/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>FOCUS PERSON</span>
            </button>

            <button
              onClick={() => setGraphMode('full')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                graphMode === 'full'
                  ? 'bg-intel-accent text-slate-950 font-bold shadow-md shadow-intel-accent/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>FULL NETWORK</span>
            </button>
          </div>

          {/* Conditional Controls based on Mode */}
          {graphMode === 'focus' ? (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400 font-mono">Target:</span>
              <select
                value={focusPerson}
                onChange={(e) => {
                  setFocusPerson(e.target.value);
                  onSelectEntity(e.target.value);
                }}
                className="bg-intel-900 border border-intel-700 rounded-lg px-2.5 py-1 text-slate-200 font-mono text-xs focus:outline-none focus:border-intel-accent"
              >
                {availablePersons.length > 0 ? (
                  availablePersons.map((p) => (
                    <option key={p.id} value={p.id}>{p.canonical_name} ({p.id})</option>
                  ))
                ) : (
                  <option value="">No Persons Indexed</option>
                )}
              </select>

              <div className="flex items-center p-0.5 rounded-lg bg-intel-900 border border-intel-800 font-mono text-[11px]">
                <button
                  onClick={() => setFocusDepth(1)}
                  className={`px-2 py-0.5 rounded transition-all ${focusDepth === 1 ? 'bg-intel-800 text-intel-accent font-bold' : 'text-slate-400'}`}
                >
                  1 HOP
                </button>
                <button
                  onClick={() => setFocusDepth(2)}
                  className={`px-2 py-0.5 rounded transition-all ${focusDepth === 2 ? 'bg-intel-800 text-intel-accent font-bold' : 'text-slate-400'}`}
                >
                  2 HOPS
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-intel-accent" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="bg-intel-900 border border-intel-700 rounded-lg px-2 py-1 text-slate-200 font-mono text-xs focus:outline-none"
                >
                  <option value="ALL">All Entity Types</option>
                  <option value="PERSON">Persons</option>
                  <option value="PHONE">Phones</option>
                  <option value="VEHICLE">Vehicles</option>
                  <option value="LOCATION">Locations</option>
                  <option value="ORGANIZATION">Organizations</option>
                  <option value="ACCOUNT">Accounts</option>
                </select>
              </div>

              <button
                onClick={() => setColorByCommunity(!colorByCommunity)}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border font-mono text-xs transition-all ${
                  colorByCommunity
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-intel-900 text-slate-400 border-intel-800 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Clusters</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          {graphData.nodes.length > 0 && (
            <button
              onClick={() => {
                if (!pathSource && graphData.nodes.length > 0) {
                  setPathSource(focusPerson || graphData.nodes[0].id);
                }
                if (!pathTarget && graphData.nodes.length > 1) {
                  setPathTarget(graphData.nodes[1].id);
                }
                setShowPathModal(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-intel-900 hover:bg-intel-800 text-slate-200 border border-intel-700 font-mono text-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-intel-gold" />
              <span>Find Network Path</span>
            </button>
          )}

          <button
            onClick={loadGraph}
            title="Refresh Data"
            className="p-1.5 rounded-lg hover:bg-intel-800 text-slate-400 hover:text-white border border-intel-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 rounded bg-intel-900 border border-intel-800">
            {graphData.total_nodes || 0} Nodes • {graphData.total_edges || 0} Edges
          </span>
        </div>
      </div>

      {/* Relationship Type Visibility Bar in Full Mode */}
      {graphMode === 'full' && (
        <div className="h-9 border-b border-intel-800/70 bg-intel-950/60 px-5 flex items-center space-x-4 text-[11px] font-mono text-slate-400 shrink-0">
          <span className="text-slate-500">Show Relationships:</span>
          {Object.keys(relFilters).map((cat) => (
            <label key={cat} className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-200">
              <input
                type="checkbox"
                checked={relFilters[cat]}
                onChange={() => toggleRelFilter(cat)}
                className="rounded bg-intel-900 border-intel-700 text-intel-accent focus:ring-0"
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      )}

      {/* Main Workspace (Graph Canvas + 360° Entity Dossier Drawer) */}
      <div className="flex-1 flex overflow-hidden relative min-h-0 min-w-0">
        <div className="flex-1 h-full relative min-h-0 min-w-0 p-3">
          <NetworkGraph
            graphData={graphData}
            onSelectNode={(id) => onSelectEntity(id)}
            onSelectEdge={(edgeData) => {}}
            highlightNodeIds={highlightNodeIds}
            highlightEdgeIds={highlightEdgeIds}
            colorByCommunity={colorByCommunity}
            onOpenEvidence={onOpenEvidence}
            onStartDemo={onStartDemo}
            mode={graphMode}
            focusPersonId={focusPerson}
            focusDepth={focusDepth}
            relationshipTypeFilters={relFilters}
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

      {/* Interactive Path Search Modal */}
      {showPathModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="w-full max-w-lg bg-intel-950 border border-intel-700 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-intel-800 pb-3">
              <div className="flex items-center space-x-2">
                <GitFork className="w-5 h-5 text-intel-gold" />
                <h3 className="text-sm font-bold text-white">Find Network Connection Path</h3>
              </div>
              <button
                onClick={() => setShowPathModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-intel-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select any two entities in the criminal intelligence network to compute and explain the shortest multi-hop connection chain.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Source Entity</label>
                <select
                  value={pathSource}
                  onChange={(e) => setPathSource(e.target.value)}
                  className="w-full bg-intel-900 border border-intel-700 rounded-lg p-2 text-slate-200 font-mono text-xs focus:border-intel-accent outline-none"
                >
                  {graphData.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Target Entity</label>
                <select
                  value={pathTarget}
                  onChange={(e) => setPathTarget(e.target.value)}
                  className="w-full bg-intel-900 border border-intel-700 rounded-lg p-2 text-slate-200 font-mono text-xs focus:border-intel-accent outline-none"
                >
                  {graphData.nodes.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.label} ({n.type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-intel-800/80">
              <button
                type="button"
                onClick={() => handleQuickDemoPath('Vikram Malhotra', 'Apex Logistics Pvt Ltd')}
                className="text-[11px] font-mono text-intel-gold hover:underline flex items-center space-x-1"
              >
                <span>⚡ Quick Demo: Vikram → Apex Logistics</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPathModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-intel-800 text-xs font-mono text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecutePathSearch}
                  className="px-4 py-1.5 rounded-lg bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold text-xs font-mono transition-all"
                >
                  Find Path with Copilot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
