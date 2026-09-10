import React, { useEffect, useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2,
  RotateCcw,
  RefreshCw, 
  Sparkles,
  Network,
  User,
  Phone,
  Car,
  MapPin,
  Building2,
  CreditCard,
  FileText,
  X
} from 'lucide-react';

const TYPE_COLORS = {
  PERSON: '#38bdf8',       // Sky Blue
  PHONE: '#10b981',        // Emerald
  VEHICLE: '#a855f7',      // Purple
  LOCATION: '#ef4444',     // Crimson
  ORGANIZATION: '#f59e0b', // Amber
  ACCOUNT: '#06b6d4',      // Cyan
  DEFAULT: '#94a3b8'       // Slate
};

const COMMUNITY_COLORS = [
  '#38bdf8', '#f59e0b', '#10b981', '#a855f7', '#ef4444', '#ec4899', '#14b8a6'
];

export default function NetworkGraph({ 
  graphData, 
  onSelectNode, 
  onSelectEdge,
  highlightNodeIds = [], 
  highlightEdgeIds = [],
  colorByCommunity = false,
  onOpenEvidence,
  onStartDemo,
  // Focus Person Props
  mode = 'full', // 'full' | 'focus'
  focusPersonId = 'PER_001',
  focusDepth = 1, // 1 or 2
  // Filter Props
  relationshipTypeFilters = {
    COMMUNICATION: true,
    FINANCIAL: true,
    EMPLOYMENT: true,
    LOCATION: true,
    VEHICLE: true,
    OWNERSHIP: true
  }
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState(null);
  const [nodeDragStart, setNodeDragStart] = useState(null);
  const [hasDraggedNode, setHasDraggedNode] = useState(false);
  const [nodePositions, setNodePositions] = useState({});
  const [layoutMode, setLayoutMode] = useState('circular'); // 'circular' | 'layered' | 'grid'
  const [selectedEdgeData, setSelectedEdgeData] = useState(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      setTimeout(() => handleFit(), 80);
      return next;
    });
  };

  const rawNodes = graphData?.nodes || [];
  const rawEdges = graphData?.edges || [];

  // Filter edges based on relationship types
  const getRelationCategory = (relType) => {
    const t = (relType || '').toUpperCase();
    if (t.includes('CALL') || t.includes('COMMUNICAT')) return 'COMMUNICATION';
    if (t.includes('MONEY') || t.includes('TRANSFERRED') || t.includes('BANK')) return 'FINANCIAL';
    if (t.includes('WORK') || t.includes('ASSOCIATED') || t.includes('MEET') || t.includes('SEEN')) return 'EMPLOYMENT';
    if (t.includes('LOCATED') || t.includes('VISITED')) return 'LOCATION';
    if (t.includes('VEHICLE') || t.includes('USES') && !t.includes('SIM')) return 'VEHICLE';
    if (t.includes('OWNS')) return 'OWNERSHIP';
    return 'COMMUNICATION';
  };

  // Compute Visible Subgraph based on Mode (Full vs Focus Person 1-Hop / 2-Hop)
  let visibleNodes = rawNodes;
  let visibleEdges = rawEdges;

  if (mode === 'focus' && focusPersonId) {
    const directNeighborIds = new Set([focusPersonId]);
    const secondHopNeighborIds = new Set();
    const activeEdgeIds = new Set();

    // 1-Hop
    rawEdges.forEach((e) => {
      if (e.source === focusPersonId) {
        directNeighborIds.add(e.target);
        activeEdgeIds.add(e.id);
      } else if (e.target === focusPersonId) {
        directNeighborIds.add(e.source);
        activeEdgeIds.add(e.id);
      }
    });

    // 2-Hop
    if (focusDepth >= 2) {
      rawEdges.forEach((e) => {
        if (directNeighborIds.has(e.source) && !directNeighborIds.has(e.target)) {
          secondHopNeighborIds.add(e.target);
          activeEdgeIds.add(e.id);
        } else if (directNeighborIds.has(e.target) && !directNeighborIds.has(e.source)) {
          secondHopNeighborIds.add(e.source);
          activeEdgeIds.add(e.id);
        } else if (directNeighborIds.has(e.source) && directNeighborIds.has(e.target)) {
          activeEdgeIds.add(e.id);
        }
      });
    }

    const allAllowedIds = new Set([...directNeighborIds, ...secondHopNeighborIds]);
    visibleNodes = rawNodes.filter((n) => allAllowedIds.has(n.id));
    visibleEdges = rawEdges.filter((e) => allAllowedIds.has(e.source) && allAllowedIds.has(e.target));
  } else {
    // In Full mode, apply relationship type checkboxes
    visibleEdges = rawEdges.filter((e) => {
      const cat = getRelationCategory(e.label);
      return relationshipTypeFilters[cat] !== false;
    });
    const connectedNodeIds = new Set();
    visibleEdges.forEach((e) => {
      connectedNodeIds.add(e.source);
      connectedNodeIds.add(e.target);
    });
    // Keep nodes that are connected or highlighted
    visibleNodes = rawNodes.filter((n) => connectedNodeIds.has(n.id) || highlightNodeIds.includes(n.id) || rawNodes.length < 15);
  }

  const hasNodes = visibleNodes.length > 0;

  // Initialize node layout positions
  useEffect(() => {
    if (!hasNodes) return;

    const width = 850;
    const height = 520;
    const centerX = width / 2;
    const centerY = height / 2;
    const newPositions = {};

    if (mode === 'focus' && focusPersonId) {
      // Focus person at exact center
      newPositions[focusPersonId] = { x: centerX, y: centerY };

      const directNodes = visibleNodes.filter((n) => n.id !== focusPersonId);
      directNodes.forEach((n, idx) => {
        const angle = (idx / Math.max(directNodes.length, 1)) * 2 * Math.PI;
        const radius = directNodes.length > 8 ? 200 : 170;
        newPositions[n.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });
    } else if (layoutMode === 'circular') {
      // Primary bridge entities in center, others in orbits
      const centerNodes = visibleNodes.filter(n => n.betweenness > 0.15 || n.id === 'PER_001');
      const outerNodes = visibleNodes.filter(n => !centerNodes.includes(n));

      centerNodes.forEach((n, idx) => {
        const angle = (idx / Math.max(centerNodes.length, 1)) * 2 * Math.PI;
        const radius = centerNodes.length > 1 ? 85 : 0;
        newPositions[n.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });

      outerNodes.forEach((n, idx) => {
        const ring = (idx % 2 === 0) ? 210 : 290;
        const angle = (idx / outerNodes.length) * 2 * Math.PI;
        newPositions[n.id] = {
          x: centerX + ring * Math.cos(angle) + (Math.sin(idx) * 12),
          y: centerY + ring * Math.sin(angle) + (Math.cos(idx) * 12)
        };
      });
    } else if (layoutMode === 'layered') {
      const typeGroups = ['PERSON', 'PHONE', 'VEHICLE', 'ORGANIZATION', 'ACCOUNT', 'LOCATION'];
      typeGroups.forEach((type, colIdx) => {
        const typeNodes = visibleNodes.filter(n => n.type === type);
        const colX = 100 + colIdx * 135;
        typeNodes.forEach((n, rowIdx) => {
          const rowY = 80 + (rowIdx * (390 / Math.max(typeNodes.length, 1)));
          newPositions[n.id] = { x: colX, y: rowY };
        });
      });
    } else {
      const cols = Math.ceil(Math.sqrt(visibleNodes.length));
      visibleNodes.forEach((n, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        newPositions[n.id] = {
          x: 90 + col * 125,
          y: 70 + row * 95
        };
      });
    }

    setNodePositions(newPositions);
  }, [graphData, layoutMode, mode, focusPersonId, focusDepth, hasNodes]);

  // Drag canvas handlers
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.id === 'canvas-bg') {
      setIsDraggingCanvas(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDraggingCanvas) {
      setPanOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    } else if (draggedNode) {
      if (nodeDragStart) {
        const dist = Math.hypot(e.clientX - nodeDragStart.x, e.clientY - nodeDragStart.y);
        if (dist > 4) {
          setHasDraggedNode(true);
        }
      }
      const svg = e.currentTarget.getBoundingClientRect();
      const clientX = (e.clientX - svg.left - panOffset.x) / zoomLevel;
      const clientY = (e.clientY - svg.top - panOffset.y) / zoomLevel;
      setNodePositions(prev => ({
        ...prev,
        [draggedNode]: { x: clientX, y: clientY }
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDraggingCanvas(false);
    if (draggedNode) {
      if (!hasDraggedNode) {
        if (onSelectNode) onSelectNode(draggedNode);
      }
      setDraggedNode(null);
      setNodeDragStart(null);
      setHasDraggedNode(false);
    }
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev * 0.8, 0.4));
  const handleFit = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className={`${
      isFullscreen 
        ? 'fixed inset-0 z-50 w-screen h-screen bg-[#070a10] overflow-hidden flex flex-col select-none animate-fadeIn' 
        : 'relative w-full h-full min-h-[480px] bg-[#070a10] overflow-hidden rounded-2xl border border-intel-800 shadow-2xl flex flex-col select-none'
    }`}>
      {/* Fullscreen Mode Top Banner */}
      {isFullscreen && (
        <div className="absolute top-4 left-4 z-30 flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl bg-intel-950/95 border border-intel-700 text-xs font-mono text-slate-200 backdrop-blur shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white">Full Screen Graph Mode</span>
          <span className="text-slate-400 text-[10.5px]">| Press ESC or click minimize to exit</span>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        id="canvas-bg"
        className="w-full h-full cursor-grab active:cursor-grabbing flex-1"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={(e) => {
          if (e.deltaY < 0) handleZoomIn();
          else handleZoomOut();
        }}
      >
        <defs>
          <filter id="glow-gold" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#f59e0b" floodOpacity="0.9" />
          </filter>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#38bdf8" floodOpacity="0.8" />
          </filter>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#475569" />
          </marker>
          <marker
            id="arrow-highlight"
            viewBox="0 0 10 10"
            refX="24"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
          </marker>
          <marker
            id="arrow-hover"
            viewBox="0 0 10 10"
            refX="24"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" />
          </marker>
        </defs>

        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          {/* Edges */}
          {visibleEdges.map((edge) => {
            const p1 = nodePositions[edge.source];
            const p2 = nodePositions[edge.target];
            if (!p1 || !p2) return null;

            const isHigh = highlightEdgeIds.includes(edge.id) ||
              (highlightNodeIds.includes(edge.source) && highlightNodeIds.includes(edge.target));
            const isHovered = hoveredEdgeId === edge.id;
            const isSelected = selectedEdgeData?.id === edge.id;

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            // Show label in focus mode, or on hover, or when selected/highlighted
            const showLabel = mode === 'focus' || isHigh || isHovered || isSelected;

            return (
              <g 
                key={edge.id} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEdgeId(edge.id)}
                onMouseLeave={() => setHoveredEdgeId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEdgeData(edge);
                  if (onSelectEdge) onSelectEdge(edge);
                }}
              >
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isHigh || isSelected ? '#f59e0b' : isHovered ? '#38bdf8' : '#334155'}
                  strokeWidth={isHigh || isSelected ? 3 : isHovered ? 2.5 : 1.5}
                  strokeOpacity={isHigh || isSelected || isHovered ? 1.0 : 0.6}
                  markerEnd={isHigh || isSelected ? 'url(#arrow-highlight)' : isHovered ? 'url(#arrow-hover)' : 'url(#arrow)'}
                />

                {/* Edge Label Pill */}
                {showLabel && (
                  <g>
                    <rect
                      x={midX - (edge.label.length * 3.2)}
                      y={midY - 7}
                      width={edge.label.length * 6.4}
                      height={13}
                      fill="#080b11"
                      rx="3"
                      stroke={isHigh || isSelected ? '#f59e0b' : isHovered ? '#38bdf8' : '#1e293b'}
                      strokeWidth="0.8"
                      opacity="0.95"
                    />
                    <text
                      x={midX}
                      y={midY + 2.5}
                      textAnchor="middle"
                      fill={isHigh || isSelected ? '#f59e0b' : isHovered ? '#38bdf8' : '#94a3b8'}
                      fontSize="7.5px"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {edge.label}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {visibleNodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isHigh = highlightNodeIds.includes(node.id) || (mode === 'focus' && node.id === focusPersonId);
            const isCenterFocus = mode === 'focus' && node.id === focusPersonId;
            const color = colorByCommunity
              ? COMMUNITY_COLORS[(node.community_id || 0) % COMMUNITY_COLORS.length]
              : (TYPE_COLORS[node.type] || TYPE_COLORS.DEFAULT);

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className={`cursor-pointer ${draggedNode === node.id ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNode(node.id);
                  setNodeDragStart({ x: e.clientX, y: e.clientY });
                  setHasDraggedNode(false);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {/* Outer Glow */}
                {isHigh && (
                  <circle
                    r={isCenterFocus ? "28" : "24"}
                    fill="none"
                    stroke={isCenterFocus ? "#38bdf8" : "#f59e0b"}
                    strokeWidth="3"
                    filter={isCenterFocus ? "url(#glow-blue)" : "url(#glow-gold)"}
                    className="animate-pulse"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r={isCenterFocus ? 22 : (node.betweenness > 0.2 ? 18 : 15)}
                  fill={color}
                  stroke="#080b11"
                  strokeWidth="2.5"
                  className="hover:scale-110 transition-transform"
                />

                {/* Risk Dot */}
                {node.risk_score > 0.75 && (
                  <circle r="3.5" fill="#ffffff" />
                )}

                {/* Label Box */}
                <rect
                  x={-(node.label.length * 3.4)}
                  y={isCenterFocus ? 26 : 21}
                  width={node.label.length * 6.8}
                  height={14}
                  fill="#080b11"
                  rx="3"
                  stroke={isHigh ? (isCenterFocus ? '#38bdf8' : '#f59e0b') : '#1e293b'}
                  strokeWidth="1"
                  opacity="0.95"
                />

                {/* Node Label Text */}
                <text
                  x="0"
                  y={isCenterFocus ? 36 : 31}
                  textAnchor="middle"
                  fill="#f8fafc"
                  fontSize="8.5px"
                  fontFamily="Plus Jakarta Sans, sans-serif"
                  fontWeight="bold"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected Edge Inspector Popover */}
      {selectedEdgeData && (
        <div className="absolute top-16 left-6 p-4 rounded-xl bg-intel-950/95 border border-intel-700 shadow-2xl backdrop-blur text-xs space-y-2.5 z-30 max-w-sm animate-fade-in">
          <div className="flex items-center justify-between border-b border-intel-800 pb-1.5">
            <span className="font-mono text-[10.5px] font-bold text-intel-accent uppercase">
              Relationship Inspector
            </span>
            <button
              onClick={() => setSelectedEdgeData(null)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="flex items-center space-x-1.5 text-white font-bold">
              <span>{selectedEdgeData.source}</span>
              <span className="text-intel-gold">➔ [{selectedEdgeData.label}] ➔</span>
              <span>{selectedEdgeData.target}</span>
            </div>
            <div className="text-slate-400">Confidence: {Math.round((selectedEdgeData.confidence || 1.0) * 100)}%</div>
            {selectedEdgeData.timestamp && (
              <div className="text-slate-400">Date Logged: {selectedEdgeData.timestamp}</div>
            )}
          </div>

          {selectedEdgeData.document_id && (
            <button
              onClick={() => {
                if (onOpenEvidence) onOpenEvidence(selectedEdgeData.document_id);
              }}
              className="w-full flex items-center justify-center space-x-1 py-1.5 rounded-lg bg-intel-800 hover:bg-intel-700 text-intel-accent border border-intel-700 font-mono text-[11px] transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Source Evidence ({selectedEdgeData.document_id})</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Canvas Controls */}
      {hasNodes && (
        <div className="absolute top-4 right-4 flex items-center space-x-2 p-1.5 rounded-xl bg-intel-950/95 border border-intel-700 backdrop-blur shadow-2xl z-20">
          {mode === 'full' && (
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              className="bg-intel-900 border border-intel-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-intel-accent"
            >
              <option value="circular">Circular Hub (Cluster)</option>
              <option value="layered">Layered By Type</option>
              <option value="grid">Grid Matrix</option>
            </select>
          )}

          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="p-1.5 rounded-lg hover:bg-intel-800 text-slate-300 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="p-1.5 rounded-lg hover:bg-intel-800 text-slate-300 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            title="Center / Reset View"
            className="p-1.5 rounded-lg hover:bg-intel-800 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Full Screen (Esc)" : "Expand to Full Screen"}
            className={`p-1.5 rounded-lg transition-colors ${
              isFullscreen 
                ? 'bg-intel-accent/20 text-intel-accent border border-intel-accent/40 shadow-md' 
                : 'hover:bg-intel-800 text-slate-300'
            }`}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Legend Badge */}
      {hasNodes && (
        <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-intel-950/95 border border-intel-800 backdrop-blur text-[11px] space-y-1.5 shadow-2xl z-20">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            {mode === 'focus' ? 'Focus Ego Network' : 'Entity Type Legend'}
          </div>
          <div className="grid grid-cols-3 gap-x-3.5 gap-y-1 text-[10.5px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
              <span className="text-slate-300">Person</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              <span className="text-slate-300">Phone</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span>
              <span className="text-slate-300">Vehicle</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
              <span className="text-slate-300">Location</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
              <span className="text-slate-300">Org</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></span>
              <span className="text-slate-300">Account</span>
            </div>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {!hasNodes && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-3 z-10 bg-intel-950/80">
          <div className="w-12 h-12 rounded-2xl bg-intel-900 border border-intel-800 flex items-center justify-center text-slate-500">
            <Network className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white font-mono">No Graph Entities Available</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              {mode === 'focus'
                ? 'No direct or multi-hop connections found for the selected entity under current filters.'
                : 'No entities or relationships match current visibility filters. Adjust filters or load the demo investigation.'}
            </p>
          </div>
          {onStartDemo && (
            <button
              onClick={onStartDemo}
              className="px-4 py-2 rounded-xl bg-intel-accent hover:bg-sky-400 text-slate-950 font-bold font-mono text-xs transition-all shadow-md shadow-intel-accent/20"
            >
              Load Demo Investigation
            </button>
          )}
        </div>
      )}
    </div>
  );
}
