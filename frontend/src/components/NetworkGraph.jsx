import React, { useEffect, useRef, useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  RefreshCw, 
  Sparkles,
  Network
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
  onStartDemo
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState(null);
  const [nodePositions, setNodePositions] = useState({});
  const [layoutMode, setLayoutMode] = useState('circular'); // 'circular' | 'grid' | 'layered'

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];
  const hasNodes = nodes.length > 0;

  // Initialize or update node positions dynamically based on layoutMode
  useEffect(() => {
    if (!hasNodes) return;

    const width = 900;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;
    const newPositions = {};

    if (layoutMode === 'circular') {
      // Primary bridge entities in center, others in orbits
      const centerNodes = nodes.filter(n => n.betweenness > 0.15 || n.id === 'PER_001');
      const outerNodes = nodes.filter(n => !centerNodes.includes(n));

      // Place central entities
      centerNodes.forEach((n, idx) => {
        const angle = (idx / Math.max(centerNodes.length, 1)) * 2 * Math.PI;
        const radius = centerNodes.length > 1 ? 90 : 0;
        newPositions[n.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        };
      });

      // Place outer entities in rings by type/community
      outerNodes.forEach((n, idx) => {
        const ring = (idx % 2 === 0) ? 220 : 310;
        const angle = (idx / outerNodes.length) * 2 * Math.PI;
        newPositions[n.id] = {
          x: centerX + ring * Math.cos(angle) + (Math.sin(idx) * 15),
          y: centerY + ring * Math.sin(angle) + (Math.cos(idx) * 15)
        };
      });
    } else if (layoutMode === 'layered') {
      // Group by entity type layers
      const typeGroups = ['PERSON', 'PHONE', 'VEHICLE', 'ORGANIZATION', 'ACCOUNT', 'LOCATION'];
      typeGroups.forEach((type, colIdx) => {
        const typeNodes = nodes.filter(n => n.type === type);
        const colX = 120 + colIdx * 140;
        typeNodes.forEach((n, rowIdx) => {
          const rowY = 80 + (rowIdx * (420 / Math.max(typeNodes.length, 1)));
          newPositions[n.id] = { x: colX, y: rowY };
        });
      });
    } else {
      // Grid Matrix layout
      const cols = Math.ceil(Math.sqrt(nodes.length));
      nodes.forEach((n, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        newPositions[n.id] = {
          x: 100 + col * 120,
          y: 70 + row * 100
        };
      });
    }

    setNodePositions(newPositions);
  }, [graphData, layoutMode, hasNodes]);

  // Drag Canvas Handlers
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
    setDraggedNode(null);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev * 1.25, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev * 0.8, 0.4));
  const handleFit = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full min-h-[500px] bg-[#070a10] overflow-hidden rounded-2xl border border-intel-800 shadow-2xl flex flex-col select-none">
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
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
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
        </defs>

        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}>
          {/* Edges */}
          {edges.map((edge) => {
            const p1 = nodePositions[edge.source];
            const p2 = nodePositions[edge.target];
            if (!p1 || !p2) return null;

            const isHigh = highlightEdgeIds.includes(edge.id) ||
              (highlightNodeIds.includes(edge.source) && highlightNodeIds.includes(edge.target));

            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            return (
              <g 
                key={edge.id} 
                className="cursor-pointer group"
                onClick={() => {
                  if (onSelectEdge) onSelectEdge(edge);
                  if (edge.document_id && onOpenEvidence) onOpenEvidence(edge.document_id);
                }}
              >
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={isHigh ? '#f59e0b' : '#334155'}
                  strokeWidth={isHigh ? 3 : 1.5}
                  strokeOpacity={isHigh ? 1.0 : 0.65}
                  markerEnd={isHigh ? 'url(#arrow-highlight)' : 'url(#arrow)'}
                  className="transition-all group-hover:stroke-intel-accent group-hover:stroke-width-2"
                />
                {/* Edge Label */}
                <rect
                  x={midX - (edge.label.length * 3.2)}
                  y={midY - 7}
                  width={edge.label.length * 6.4}
                  height={13}
                  fill="#080b11"
                  rx="3"
                  stroke={isHigh ? '#f59e0b' : '#1e293b'}
                  strokeWidth="0.8"
                  opacity="0.9"
                />
                <text
                  x={midX}
                  y={midY + 2.5}
                  textAnchor="middle"
                  fill={isHigh ? '#f59e0b' : '#94a3b8'}
                  fontSize="7.5px"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = nodePositions[node.id];
            if (!pos) return null;

            const isHigh = highlightNodeIds.includes(node.id);
            const color = colorByCommunity
              ? COMMUNITY_COLORS[(node.community_id || 0) % COMMUNITY_COLORS.length]
              : (TYPE_COLORS[node.type] || TYPE_COLORS.DEFAULT);

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                className="cursor-pointer transition-transform duration-75"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDraggedNode(node.id);
                  if (onSelectNode) onSelectNode(node.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectNode) onSelectNode(node.id);
                }}
              >
                {/* Outer Glow on Highlight */}
                {isHigh && (
                  <circle
                    r="26"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    filter="url(#glow-gold)"
                    className="animate-pulse"
                  />
                )}

                {/* Node Circle */}
                <circle
                  r={isHigh ? 20 : (node.betweenness > 0.2 ? 18 : 15)}
                  fill={color}
                  stroke="#080b11"
                  strokeWidth="2.5"
                  className="hover:scale-110 transition-transform"
                />

                {/* Risk Inner Dot */}
                {node.risk_score > 0.75 && (
                  <circle r="4" fill="#ffffff" />
                )}

                {/* Label Box */}
                <rect
                  x={-(node.label.length * 3.4)}
                  y={isHigh ? 23 : 20}
                  width={node.label.length * 6.8}
                  height={14}
                  fill="#080b11"
                  rx="3"
                  stroke={isHigh ? '#f59e0b' : '#1e293b'}
                  strokeWidth="1"
                  opacity="0.95"
                />

                {/* Node Label Text */}
                <text
                  x="0"
                  y={isHigh ? 33 : 30}
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

      {/* Empty State Banner (If 0 Nodes) */}
      {!hasNodes && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-30 bg-intel-950/95 backdrop-blur-md space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-intel-accent/20 border border-intel-accent/40 flex items-center justify-center text-intel-accent shadow-lg shadow-intel-accent/20">
            <Network className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white tracking-tight">Intelligence Graph Ready</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 leading-relaxed">
              Load the synthetic crime syndicate dataset (Operation ShadowNet) to generate and visualize the centralized multi-cluster network.
            </p>
          </div>
          {onStartDemo && (
            <button
              onClick={onStartDemo}
              className="px-5 py-2.5 rounded-xl bg-intel-accent hover:bg-sky-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-intel-accent/30 transition-all active:scale-95 flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>LOAD DEMO INVESTIGATION</span>
            </button>
          )}
        </div>
      )}

      {/* Floating Canvas Controls */}
      {hasNodes && (
        <>
          <div className="absolute top-4 right-4 flex items-center space-x-2 p-1.5 rounded-xl bg-intel-950/95 border border-intel-700 backdrop-blur shadow-2xl z-20">
            {/* Layout Selector */}
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value)}
              className="bg-intel-900 border border-intel-700 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-intel-accent"
            >
              <option value="circular">Circular Hub (Cluster)</option>
              <option value="layered">Layered By Type</option>
              <option value="grid">Grid Matrix</option>
            </select>

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
              title="Reset View"
              className="p-1.5 rounded-lg hover:bg-intel-800 text-slate-300 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleFit}
              title="Recenter"
              className="p-1.5 rounded-lg hover:bg-intel-800 text-slate-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Legend Badge */}
          <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-intel-950/95 border border-intel-800 backdrop-blur text-[11px] space-y-1.5 shadow-2xl z-20">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Entity Legend</div>
            <div className="grid grid-cols-2 gap-x-3.5 gap-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span>
                <span className="text-slate-300 font-medium">Person</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
                <span className="text-slate-300 font-medium">Phone</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span>
                <span className="text-slate-300 font-medium">Vehicle</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></span>
                <span className="text-slate-300 font-medium">Location</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                <span className="text-slate-300 font-medium">Organization</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]"></span>
                <span className="text-slate-300 font-medium">Account</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
