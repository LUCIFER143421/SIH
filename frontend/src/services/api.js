import axios from 'axios';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Demo Operations
export const loadDemoCase = async () => (await apiClient.post('/demo/load')).data;
export const resetSystem = async () => (await apiClient.post('/demo/reset')).data;

// Graph API
export const fetchGraphData = async (params = {}) => (await apiClient.get('/graph/data', { params })).data;
export const fetchSubgraph = async (entityId, hops = 1) => (await apiClient.get(`/graph/subgraph/${entityId}`, { params: { hops } })).data;
export const fetchPath = async (sourceId, targetId) => (await apiClient.get('/graph/path', { params: { source_id: sourceId, target_id: targetId } })).data;
export const fetchCommunities = async () => (await apiClient.get('/graph/communities')).data;

// Analytics API
export const fetchCentrality = async (topK = 10) => (await apiClient.get('/analytics/centrality', { params: { top_k: topK } })).data;
export const fetchNetworkStats = async () => (await apiClient.get('/analytics/stats')).data;
export const fetchDisruptionSimulation = async (targetEntityId) => (await apiClient.post('/analytics/disruption-simulation', { target_entity_id: targetEntityId })).data;
export const testHypothesis = async (hypothesisId = 'vikram_coordination', customStatement = null) => (await apiClient.post('/analytics/test-hypothesis', { hypothesis_id: hypothesisId, custom_statement: customStatement })).data;
export const fetchHiddenIntermediaries = async () => (await apiClient.get('/analytics/hidden-intermediaries')).data;
export const fetchNextActions = async () => (await apiClient.get('/analytics/next-actions')).data;
export const fetchFinancialFlow = async () => (await apiClient.get('/analytics/financial-flow')).data;

// Alerts API
export const fetchAlerts = async (status = null) => (await apiClient.get('/alerts', { params: { status } })).data;
export const verifyAlert = async (alertId, status, notes = '') => (await apiClient.post(`/alerts/${alertId}/verify`, { alert_id: alertId, status, notes })).data;

// Entity Resolution API
export const fetchResolutionCandidates = async () => (await apiClient.get('/resolution/candidates')).data;
export const mergeEntities = async (candidateId, primaryId, secondaryId) => (await apiClient.post('/resolution/merge', { candidate_id: candidateId, primary_entity_id: primaryId, secondary_entity_id: secondaryId, action: 'MERGE' })).data;
export const dismissCandidate = async (candidateId) => (await apiClient.post(`/resolution/dismiss?candidate_id=${candidateId}`)).data;

// Copilot API
export const queryCopilot = async (query, contextEntityId = null, history = []) => (await apiClient.post('/copilot/query', { query, context_entity_id: contextEntityId, conversation_history: history })).data;

// Entities & Dossier API
export const fetchEntities = async (type = null, search = null) => (await apiClient.get('/entities', { params: { type, search } })).data;
export const fetchEntityDossier = async (entityId) => (await apiClient.get(`/entities/${entityId}/dossier`)).data;
export const fetchDocuments = async () => (await apiClient.get('/documents')).data;
export const fetchDocument = async (docId) => (await apiClient.get(`/documents/${docId}`)).data;
export const fetchSystemInfo = async () => (await apiClient.get('/system-info')).data;

// Ingest API
export const ingestDocument = async (title, sourceType, content, metadata = {}) => (await apiClient.post('/ingest/document', { title, source_type: sourceType, content, metadata })).data;
