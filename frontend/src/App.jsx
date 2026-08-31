import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import NetworkExplorerView from './views/NetworkExplorerView';
import EntitiesListView from './views/EntitiesListView';
import CopilotChat from './components/CopilotChat';
import AnomalyAlerts from './components/AnomalyAlerts';
import EntityResolutionModal from './components/EntityResolutionModal';
import IngestionModal from './components/IngestionModal';
import TransparencyView from './components/TransparencyView';
import EvidenceViewer from './components/EvidenceViewer';
import { 
  loadDemoCase, 
  resetSystem, 
  fetchAlerts, 
  fetchResolutionCandidates,
  fetchSystemInfo,
  fetchGraphData
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('network');
  const [selectedEntityId, setSelectedEntityId] = useState('PER_001');
  const [activeEvidenceDocId, setActiveEvidenceDocId] = useState(null);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState(['PER_001', 'PER_002', 'PER_004', 'ORG_001']);
  const [highlightEdges, setHighlightEdges] = useState([]);
  const [refreshKey, setRefreshKey] = useState(1);
  
  const [alertCount, setAlertCount] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  // Auto-load on initial startup if empty
  useEffect(() => {
    fetchGraphData().then(data => {
      if (!data.nodes || data.nodes.length === 0) {
        handleStartDemo();
      } else {
        refreshCounters();
      }
    }).catch(() => {
      handleStartDemo();
    });
    fetchSystemInfo().then(setSystemInfo).catch(console.error);
  }, []);

  const refreshCounters = () => {
    fetchAlerts().then((a) => setAlertCount(a.length)).catch(console.error);
    fetchResolutionCandidates().then((c) => setCandidateCount(c.length)).catch(console.error);
  };

  const handleStartDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loadDemoCase();
      refreshCounters();
      setRefreshKey((prev) => prev + 1); // Trigger immediate graph re-fetch
      setActiveTab('network');
      setSelectedEntityId('PER_001');
      setHighlightNodes(['PER_001', 'PER_002', 'PER_004', 'ORG_001']);
    } catch (err) {
      console.error('Error starting demo:', err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset knowledge graph and clear current session?')) {
      await resetSystem();
      setSelectedEntityId(null);
      setHighlightNodes([]);
      setHighlightEdges([]);
      setRefreshKey((prev) => prev + 1);
      refreshCounters();
      setActiveTab('dashboard');
    }
  };

  const handleAskCopilot = (query) => {
    setCopilotInitialQuery(query);
    setActiveTab('copilot');
  };

  const handleHighlightGraph = (nodes, edges = []) => {
    setHighlightNodes(nodes);
    setHighlightEdges(edges);
    setActiveTab('network');
  };

  const handleGlobalSearch = (query) => {
    if (query) {
      setActiveTab('entities');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080b11] text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        onStartDemo={handleStartDemo}
        onReset={handleReset}
        onSearch={handleGlobalSearch}
        isDemoLoading={isDemoLoading}
        systemInfo={systemInfo}
      />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alertCount={alertCount}
          candidateCount={candidateCount}
        />

        {/* Center Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-intel-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={setActiveTab}
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                setActiveTab('network');
              }}
              onStartDemo={handleStartDemo}
              isDemoLoading={isDemoLoading}
            />
          )}

          {activeTab === 'network' && (
            <NetworkExplorerView
              selectedEntityId={selectedEntityId}
              onSelectEntity={setSelectedEntityId}
              onOpenEvidence={setActiveEvidenceDocId}
              onAskCopilot={handleAskCopilot}
              onStartDemo={handleStartDemo}
              refreshKey={refreshKey}
              highlightNodeIds={highlightNodes}
              highlightEdgeIds={highlightEdges}
            />
          )}

          {activeTab === 'copilot' && (
            <div className="p-4 h-full">
              <CopilotChat
                onHighlightGraph={handleHighlightGraph}
                onOpenEvidence={setActiveEvidenceDocId}
                onSelectEntity={setSelectedEntityId}
                initialQuery={copilotInitialQuery}
              />
            </div>
          )}

          {activeTab === 'alerts' && (
            <AnomalyAlerts
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                setActiveTab('network');
              }}
              onOpenEvidence={setActiveEvidenceDocId}
              onAskCopilot={handleAskCopilot}
              onHighlightEntities={(eids) => handleHighlightGraph(eids)}
            />
          )}

          {activeTab === 'entities' && (
            <EntitiesListView
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                setActiveTab('network');
              }}
              onAskCopilot={handleAskCopilot}
            />
          )}

          {activeTab === 'resolution' && (
            <EntityResolutionModal
              onResolutionApplied={() => {
                refreshCounters();
                setRefreshKey((prev) => prev + 1);
              }}
            />
          )}

          {activeTab === 'documents' && (
            <IngestionModal
              onDocumentIngested={() => {
                refreshCounters();
                setRefreshKey((prev) => prev + 1);
              }}
              onOpenEvidence={setActiveEvidenceDocId}
            />
          )}

          {activeTab === 'transparency' && (
            <TransparencyView />
          )}
        </main>
      </div>

      {/* Primary Evidence Modal Viewer */}
      {activeEvidenceDocId && (
        <EvidenceViewer
          documentId={activeEvidenceDocId}
          onClose={() => setActiveEvidenceDocId(null)}
        />
      )}
    </div>
  );
}
