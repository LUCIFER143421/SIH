import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './views/DashboardView';
import NetworkExplorerView from './views/NetworkExplorerView';
import TimelineView from './views/TimelineView';
import MoneyFlowView from './views/MoneyFlowView';
import InvestigativeLeadsView from './views/InvestigativeLeadsView';
import EntitiesListView from './views/EntitiesListView';
import CopilotChat from './components/CopilotChat';
import AnomalyAlerts from './components/AnomalyAlerts';
import EntityResolutionModal from './components/EntityResolutionModal';
import IngestionModal from './components/IngestionModal';
import TransparencyView from './components/TransparencyView';
import EvidenceViewer from './components/EvidenceViewer';
import InvestigationStoryModal from './components/InvestigationStoryModal';
import SystemTutorialModal from './components/SystemTutorialModal';
import NewCaseModal from './components/NewCaseModal';
import { 
  loadDemoCase, 
  resetSystem, 
  fetchAlerts, 
  fetchResolutionCandidates,
  fetchSystemInfo,
  fetchGraphData,
  ingestDocument
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState(null);
  const [activeEvidenceDocId, setActiveEvidenceDocId] = useState(null);
  const [copilotInitialQuery, setCopilotInitialQuery] = useState(null);
  const [highlightNodes, setHighlightNodes] = useState([]);
  const [highlightEdges, setHighlightEdges] = useState([]);
  const [refreshKey, setRefreshKey] = useState(1);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [activeCase, setActiveCase] = useState(null);
  
  const [alertCount, setAlertCount] = useState(0);
  const [candidateCount, setCandidateCount] = useState(0);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

  // Check graph data on initial mount without auto-loading demo
  useEffect(() => {
    fetchGraphData().then(data => {
      if (data.nodes && data.nodes.length > 0) {
        refreshCounters();
        if (data.nodes.some(n => n.id === 'PER_001')) {
          setActiveCase({
            name: 'Operation ShadowNet',
            id: 'SIH-26189-SHADOWNET',
            description: 'Dimapur → Kolkata Contraband Transit, Hawala Layering & Corrupt Port Clearance Network',
            isCustom: false
          });
        } else {
          setActiveCase({
            name: 'Active Investigation',
            id: 'CASE-001',
            description: 'Active case file with ingested evidence.',
            isCustom: true
          });
        }
      } else {
        setActiveCase(null);
      }
    }).catch((err) => {
      console.warn('Backend connection issue or graph data not ready:', err);
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
      setActiveCase({
        name: 'Operation ShadowNet',
        id: 'SIH-26189-SHADOWNET',
        description: 'Dimapur → Kolkata Contraband Transit, Hawala Layering & Corrupt Port Clearance Network',
        isCustom: false
      });
      refreshCounters();
      setRefreshKey((prev) => prev + 1);
      setSelectedEntityId('PER_001');
      setHighlightNodes(['PER_001', 'PER_002', 'PER_004', 'ORG_001']);
    } catch (err) {
      console.error('Error starting demo:', err);
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleCreateCase = async (caseData) => {
    try {
      await resetSystem();
      setActiveCase({
        name: caseData.name,
        id: caseData.id,
        description: caseData.description,
        isCustom: true
      });
      setSelectedEntityId(null);
      setHighlightNodes([]);
      setHighlightEdges([]);

      if (caseData.initialFIR) {
        await ingestDocument({
          title: caseData.initialFIR.title,
          content: caseData.initialFIR.content,
          doc_type: 'FIR',
          source: 'Police Station / Investigating Agency'
        });
      }

      refreshCounters();
      setRefreshKey((prev) => prev + 1);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Error creating new case:', err);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset knowledge graph and clear current investigation session?')) {
      await resetSystem();
      setActiveCase(null);
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

  return (
    <div className="flex flex-col h-screen w-screen bg-[#080b11] text-slate-100 overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        onReset={handleReset}
        isDemoLoading={isDemoLoading}
        systemInfo={systemInfo}
        onOpenStoryModal={() => setIsStoryModalOpen(true)}
        onOpenTutorial={() => setIsTutorialModalOpen(true)}
        activeCase={activeCase}
        onOpenNewCase={() => setIsNewCaseModalOpen(true)}
      />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Hierarchical Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alertCount={alertCount}
          candidateCount={candidateCount}
          onOpenTutorial={() => setIsTutorialModalOpen(true)}
        />

        {/* Center Workspace */}
        <main className="flex-1 flex flex-col overflow-hidden bg-intel-950">
          {activeTab === 'dashboard' && (
            <DashboardView
              key={`dashboard-${refreshKey}`}
              onNavigate={setActiveTab}
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                setActiveTab('network');
              }}
              onStartDemo={handleStartDemo}
              isDemoLoading={isDemoLoading}
              onOpenStoryModal={() => setIsStoryModalOpen(true)}
              onOpenTutorial={() => setIsTutorialModalOpen(true)}
              activeCase={activeCase}
              onOpenNewCase={() => setIsNewCaseModalOpen(true)}
            />
          )}

          {activeTab === 'network' && (
            <NetworkExplorerView
              key={`network-${refreshKey}`}
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

          {activeTab === 'timeline' && (
            <TimelineView
              key={`timeline-${refreshKey}`}
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                setActiveTab('network');
              }}
              onOpenEvidence={setActiveEvidenceDocId}
              onAskCopilot={handleAskCopilot}
            />
          )}

          {activeTab === 'financial' && (
            <MoneyFlowView
              key={`financial-${refreshKey}`}
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                setActiveTab('network');
              }}
              onOpenEvidence={setActiveEvidenceDocId}
              onAskCopilot={handleAskCopilot}
            />
          )}

          {activeTab === 'leads' && (
            <InvestigativeLeadsView
              key={`leads-${refreshKey}`}
              onSelectEntity={(id) => {
                setSelectedEntityId(id);
                setActiveTab('network');
              }}
              onOpenEvidence={setActiveEvidenceDocId}
              onAskCopilot={handleAskCopilot}
              onNavigateTab={setActiveTab}
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

          {activeTab === 'documents' && (
            <IngestionModal
              onDocumentIngested={() => {
                refreshCounters();
                setRefreshKey((prev) => prev + 1);
              }}
              onOpenEvidence={setActiveEvidenceDocId}
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

      {/* 3-Minute Guided Investigation Story Modal for SIH Judges */}
      <InvestigationStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
        onNavigateTab={setActiveTab}
      />

      {/* Complete Interactive System & Feature Guide Tutorial */}
      <SystemTutorialModal
        isOpen={isTutorialModalOpen}
        onClose={() => setIsTutorialModalOpen(false)}
        onNavigateTab={setActiveTab}
      />

      {/* New Independent Case Modal */}
      <NewCaseModal
        isOpen={isNewCaseModalOpen}
        onClose={() => setIsNewCaseModalOpen(false)}
        onCreateCase={handleCreateCase}
      />
    </div>
  );
}
