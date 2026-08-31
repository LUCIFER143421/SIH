import React, { useEffect, useState } from 'react';
import { Users, Filter, Search, ShieldAlert, ArrowUpRight, Bot } from 'lucide-react';
import { fetchEntities } from '../services/api';

export default function EntitiesListView({ onSelectEntity, onAskCopilot }) {
  const [entities, setEntities] = useState([]);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [typeFilter, searchTerm]);

  const loadData = () => {
    setLoading(true);
    fetchEntities(typeFilter === 'ALL' ? null : typeFilter, searchTerm || null)
      .then((data) => {
        setEntities(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading entities:', err);
        setLoading(false);
      });
  };

  return (
    <div className="flex flex-col h-full bg-intel-950 p-6 space-y-5 overflow-y-auto select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-intel-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-intel-accent" />
            <h1 className="text-lg font-extrabold text-white tracking-tight">INDEXED ENTITIES & INTELLIGENCE DOSSIERS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete registry of all indexed persons, phone numbers, vehicles, locations, organizations, and financial accounts.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search entity..."
            className="px-3 py-1.5 text-xs bg-intel-900 border border-intel-700 rounded-lg text-slate-200 font-mono focus:outline-none focus:border-intel-accent"
          />

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-intel-900 border border-intel-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono text-xs focus:outline-none focus:border-intel-accent"
          >
            <option value="ALL">All Types</option>
            <option value="PERSON">Persons</option>
            <option value="PHONE">Phones</option>
            <option value="VEHICLE">Vehicles</option>
            <option value="LOCATION">Locations</option>
            <option value="ORGANIZATION">Organizations</option>
            <option value="ACCOUNT">Accounts</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-intel-800 bg-intel-900 overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs font-mono">
          <thead className="text-[10px] text-slate-400 uppercase bg-intel-950 border-b border-intel-800">
            <tr>
              <th className="p-3">Entity ID</th>
              <th className="p-3">Canonical Name / Value</th>
              <th className="p-3">Type</th>
              <th className="p-3">Role / Metadata</th>
              <th className="p-3">Risk Score</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-intel-800 text-slate-300">
            {loading ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Retrieving entity records...
                </td>
              </tr>
            ) : entities.length > 0 ? (
              entities.map((e) => (
                <tr key={e.id} className="hover:bg-intel-950/60 transition-colors">
                  <td className="p-3 font-bold text-intel-accent">{e.id}</td>
                  <td className="p-3 font-bold text-white font-sans">{e.canonical_name}</td>
                  <td className="p-3">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-intel-800 text-slate-300 font-mono">
                      {e.entity_type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400 font-sans text-[11px]">
                    {e.metadata?.role || e.metadata?.make || e.metadata?.carrier || e.metadata?.city || '—'}
                  </td>
                  <td className="p-3 font-bold text-intel-crimson">
                    {Math.round((e.risk_score || 0.5) * 100)}/100
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => onSelectEntity(e.id)}
                      className="px-2.5 py-1 rounded bg-intel-800 hover:bg-intel-700 text-slate-200 text-[11px] transition-colors"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => onAskCopilot(`Provide intelligence summary on ${e.canonical_name}`)}
                      className="p-1 rounded bg-intel-accent/20 hover:bg-intel-accent/30 text-intel-accent transition-colors"
                      title="Ask Copilot"
                    >
                      <Bot className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No entities matched query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
