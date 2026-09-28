'use client';

import React, { useState } from 'react';
import { useCampusFix } from '@/context/CampusFixContext';
import { Incident, CampusBuilding } from '@/types/campusfix';

export const AdminPortal: React.FC = () => {
  const { 
    incidents, 
    departments, 
    locations, 
    recurringPatterns, 
    healthMetrics,
    mergeIncidents,
    setSelectedIncidentForDetail 
  } = useCampusFix();

  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | 'ALL'>('ALL');
  const [mapCategoryFilter, setMapCategoryFilter] = useState<string>('ALL');
  const [activePinIncident, setActivePinIncident] = useState<Incident | null>(null);
  const [mergePrimaryId, setMergePrimaryId] = useState<string>('inc-1042');
  const [selectedMergeSources, setSelectedMergeSources] = useState<string[]>([]);
  const [mergeSuccessMsg, setMergeSuccessMsg] = useState<string | null>(null);

  const filteredMapIncidents = incidents.filter(inc => {
    if (selectedBuilding !== 'ALL' && inc.building !== selectedBuilding) return false;
    if (mapCategoryFilter !== 'ALL' && !inc.category.includes(mapCategoryFilter)) return false;
    return inc.status !== 'CLOSED';
  });

  const criticalFeed = incidents
    .filter(i => i.status !== 'CLOSED')
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 6);

  const mergeCandidates = incidents.filter(
    i => i.status !== 'CLOSED' && i.id !== mergePrimaryId
  ).slice(0, 10);

  const toggleMergeSource = (id: string) => {
    setSelectedMergeSources(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExecuteMerge = () => {
    if (selectedMergeSources.length === 0) return;
    mergeIncidents(mergePrimaryId, selectedMergeSources);
    setMergeSuccessMsg(`Successfully consolidated ${selectedMergeSources.length} reports into ${mergePrimaryId}. Full evidence preserved.`);
    setSelectedMergeSources([]);
    setTimeout(() => setMergeSuccessMsg(null), 5000);
  };

  const deptStats = departments.map(d => ({
    ...d,
    total: incidents.filter(i => i.departmentId === d.id).length,
    active: incidents.filter(i => i.departmentId === d.id && i.status !== 'CLOSED' && i.status !== 'VERIFIED').length,
    critical: incidents.filter(i => i.departmentId === d.id && i.priority === 'critical' && i.status !== 'CLOSED').length,
  }));

  const activeIncidents = incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'VERIFIED');

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = { critical: '#E5482D', high: '#E59B1F', medium: '#2F6FDE', low: '#7A8A7C' };
    return map[priority] || '#8A867D';
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      'SUBMITTED': 'Submitted', 'AI_TRIAGED': 'Triaged', 'ASSIGNED': 'Assigned',
      'IN_PROGRESS': 'In Progress', 'RESOLVED': 'Resolved', 'CLOSED': 'Closed',
      'VERIFIED': 'Verified', 'REOPENED': 'Reopened'
    };
    return map[status] || status;
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* ── Header / Operational Ticker ── */}
      <div className="border-b border-stroke pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-baseline gap-4">
            <h1 className="headline-lg text-ink-primary tracking-tight">Campus Operations</h1>
            <span className="code-base text-ink-tertiary uppercase tracking-wider hidden sm:inline">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface-container-high code-badge text-ink-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              GRID ATC ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex bg-surface-container-high p-0.5 rounded border border-stroke">
              {['Today', '7d', '30d'].map((label, i) => (
                <button key={label} className={`px-2 py-1 code-badge rounded transition-colors ${i === 0 ? 'bg-surface text-ink-primary font-semibold shadow-sm' : 'text-ink-tertiary hover:text-ink-primary'}`}>
                  {label}
                </button>
              ))}
            </div>
            <button className="btn-secondary">
              <span className="material-symbols-outlined text-[16px] text-secondary">rss_feed</span>
              Live Triage Feed
              <span className="w-2 h-2 rounded-full bg-resolved" />
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI Telemetry Strip ── */}
      <section className="grid grid-cols-2 md:grid-cols-4 bg-surface border border-stroke rounded-[10px] overflow-hidden">
        {/* Total Incidents */}
        <div className="p-4 border-r border-stroke flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-caps">Total Incidents</span>
            <span className="code-badge text-secondary font-semibold">+8% wk</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="display-accent text-ink-primary tracking-tight font-medium">{healthMetrics.totalIncidents}</span>
              <span className="code-badge text-ink-tertiary">LOGGED</span>
            </div>
            <svg className="w-16 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 60 20">
              <polyline points="0,15 10,13 20,16 30,8 40,11 50,4 60,7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </svg>
          </div>
          <span className="code-badge text-ink-tertiary mt-1">Rolling 24h intake buffer</span>
        </div>

        {/* Active Incidents */}
        <div className="p-4 border-r border-stroke flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-caps">Active Incidents</span>
            <span className="code-badge text-resolved font-semibold">-3 vs yday</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="display-accent text-ink-primary tracking-tight font-medium">{healthMetrics.activeIncidents}</span>
              <span className="code-badge text-ink-tertiary">IN FLIGHT</span>
            </div>
            <span className="code-badge px-1.5 py-0.5 rounded bg-surface-container text-ink-primary">Queue load {Math.round((healthMetrics.activeIncidents / Math.max(1, healthMetrics.totalIncidents)) * 100)}%</span>
          </div>
          <span className="code-badge text-ink-tertiary mt-1">{activeIncidents.filter(i => i.status === 'ASSIGNED').length} Assigned • {activeIncidents.filter(i => i.status === 'AI_TRIAGED').length} Triaged</span>
        </div>

        {/* Critical Incidents */}
        <div className="p-4 border-r border-stroke flex flex-col justify-between" style={{ background: 'rgba(255,218,214,0.2)' }}>
          <div className="flex items-center justify-between">
            <span className="label-caps font-bold" style={{ color: '#E5482D' }}>Critical Incidents</span>
            <span className="inline-flex items-center gap-1 code-badge" style={{ color: '#E5482D' }}>
              <span className="w-2 h-2 rounded-full bg-critical animate-ping" />
              PRIORITY 0
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="display-accent tracking-tight font-bold" style={{ color: '#E5482D' }}>{String(healthMetrics.criticalIncidents).padStart(2, '0')}</span>
              <span className="code-badge" style={{ color: '#E5482D' }}>ACTIVE</span>
            </div>
            {healthMetrics.slaBreachedIncidents > 0 && (
              <span className="code-badge px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(229,72,45,0.1)', color: '#E5482D' }}>{healthMetrics.slaBreachedIncidents} near breach</span>
            )}
          </div>
          <span className="code-badge text-ink-tertiary mt-1">SLA monitoring active</span>
        </div>

        {/* Resolution Rate */}
        <div className="p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="label-caps">Resolution Rate</span>
            <span className="code-badge text-resolved font-semibold">SLA {healthMetrics.slaScore}%</span>
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="display-accent text-ink-primary tracking-tight font-medium">{healthMetrics.resolutionRateScore}%</span>
              <span className="code-badge text-ink-tertiary">PASS</span>
            </div>
            <span className="code-badge text-ink-tertiary">Ack: {healthMetrics.avgResolutionHours}h</span>
          </div>
          <span className="code-badge text-ink-tertiary mt-1">Median dispatch resolution: {healthMetrics.avgResolutionHours}h</span>
        </div>
      </section>

      {/* ── Main Grid: Priority Queue + Insights ── */}
      <section className="grid grid-cols-12 gap-4">

        {/* LEFT 7 COLS: Priority Queue Table */}
        <div className="col-span-12 xl:col-span-7 panel overflow-hidden flex flex-col">
          <div className="panel-header flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="label-caps text-ink-primary font-bold tracking-wider">Priority Queue</span>
              <span className="code-badge px-1.5 py-0.5 rounded bg-primary text-on-primary">{activeIncidents.length} In-Flight</span>
            </div>
            <div className="flex items-center gap-1.5 code-badge">
              <span className="text-ink-tertiary">Filter:</span>
              {['All', 'Electrical', 'HVAC', 'Plumbing'].map((f, i) => (
                <button key={f} className={`px-1.5 py-0.5 rounded transition-colors ${i === 0 ? 'bg-surface border border-stroke text-ink-primary font-medium' : 'text-ink-tertiary hover:text-ink-primary'}`}>
                  {f} {i === 0 ? `(${activeIncidents.length})` : ''}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="h-9 border-b border-stroke bg-surface table-header text-ink-secondary">
                  <th className="w-8 px-3 text-center">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded-none border-ink-tertiary cursor-pointer" />
                  </th>
                  <th className="w-24 px-2">ID</th>
                  <th className="px-3">Incident & Location</th>
                  <th className="w-28 px-2">Dept</th>
                  <th className="w-24 px-2">Status</th>
                  <th className="w-24 px-2">SLA</th>
                  <th className="w-16 px-2 text-right pr-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stroke">
                {criticalFeed.map(inc => (
                  <tr key={inc.id} className="group cursor-pointer hover:bg-surface-container/50 transition-colors relative"
                    onClick={() => setSelectedIncidentForDetail(inc)}>
                    <td className="px-3 text-center relative" onClick={e => e.stopPropagation()}>
                      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: getPriorityColor(inc.priority) }} />
                      <input type="checkbox" className="w-3.5 h-3.5 rounded-none border-ink-tertiary cursor-pointer" />
                    </td>
                    <td className="px-2 py-2 code-base font-semibold text-ink-primary">{inc.incidentNumber}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span className="body-strong text-ink-primary truncate max-w-[280px]">{inc.title}</span>
                        {inc.duplicateCount > 1 && (
                          <span className="code-badge px-1 py-0.5 rounded" style={{ background: inc.priority === 'critical' ? 'rgba(255,218,214,1)' : '#ede7dd', color: inc.priority === 'critical' ? '#E5482D' : '#14130F' }}>
                            {inc.duplicateCount} merged
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 code-badge text-ink-tertiary">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        {inc.room} • {inc.building}
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded code-badge font-medium bg-surface-container-high text-ink-primary">
                        {inc.departmentName?.split(' ')[0] || 'Facilities'}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span className="inline-flex items-center gap-1 code-badge font-medium" style={{ color: getPriorityColor(inc.priority) }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: getPriorityColor(inc.priority) }} />
                        {getStatusLabel(inc.status)}
                      </span>
                    </td>
                    <td className="px-2 py-2 code-base font-semibold" style={{ color: inc.isSlaBreached ? '#E5482D' : getPriorityColor(inc.priority) }}>
                      {inc.isSlaBreached ? '+BREACH' : `${inc.slaHours}h SLA`}
                    </td>
                    <td className="px-2 py-2 text-right pr-3" onClick={e => e.stopPropagation()}>
                      <button className="text-ink-tertiary hover:text-ink-primary p-1 rounded">
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-3 py-2 bg-surface-container-low border-t border-stroke flex items-center justify-between code-badge text-ink-tertiary">
            <span>Showing top {criticalFeed.length} by priority score</span>
            <div className="flex items-center gap-1.5">
              <button className="px-2 py-1 bg-surface border border-stroke rounded text-ink-primary hover:bg-surface-container">Assign</button>
              <button className="px-2 py-1 bg-surface border border-stroke rounded hover:bg-surface-container" style={{ color: '#E5482D' }}>Escalate</button>
              <button className="px-2 py-1 bg-surface border border-stroke rounded hover:bg-surface-container" style={{ color: '#1F8A5B' }}>Resolve</button>
            </div>
          </div>
        </div>

        {/* RIGHT 5 COLS: Insights + Featured Critical */}
        <div className="col-span-12 xl:col-span-5 flex flex-col gap-4">

          {/* Featured Critical Incident */}
          {criticalFeed[0] && (
            <div className="panel overflow-hidden">
              <div className="h-1 bg-critical w-full" />
              <div className="p-3 border-b border-stroke flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="label-caps font-bold" style={{ color: '#E5482D' }}>Needs Attention Now</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-critical animate-ping" />
                </div>
                <span className="badge-critical">{criticalFeed[0].incidentNumber} • CRITICAL</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <h2 className="headline-sm text-ink-primary tracking-tight">{criticalFeed[0].title}</h2>
                  <p className="text-[13px] mt-0.5" style={{ color: '#E5482D' }}>
                    {criticalFeed[0].description?.slice(0, 100) || 'Risk of system compromise detected.'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2 bg-surface-container-low rounded-md border border-stroke">
                  <div>
                    <span className="label-caps block">Location</span>
                    <span className="code-badge text-ink-primary font-semibold">{criticalFeed[0].room}, {criticalFeed[0].building}</span>
                  </div>
                  <div>
                    <span className="label-caps block">SLA</span>
                    <span className="code-base font-bold" style={{ color: '#E5482D' }}>{criticalFeed[0].slaHours}h limit</span>
                  </div>
                </div>
                {/* AI Triage Badge */}
                <div className="p-2 rounded-md border flex items-center justify-between" style={{ background: 'rgba(47,111,222,0.05)', borderColor: 'rgba(47,111,222,0.2)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">psychology</span>
                    <span className="code-badge">
                      Routing: <span className="font-bold">{criticalFeed[0].departmentName}</span> ({Math.round(criticalFeed[0].aiConfidence * 100)}%)
                    </span>
                  </div>
                  <span className="code-badge text-secondary font-bold">CONFIRMED</span>
                </div>
                {criticalFeed[0].duplicateCount > 1 && (
                  <div className="flex items-center gap-1.5 code-badge text-ink-tertiary">
                    <span className="material-symbols-outlined text-[14px]">call_merge</span>
                    {criticalFeed[0].duplicateCount} student reports collapsed into 1 incident cluster
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Operational Insights */}
          <div className="panel overflow-hidden">
            <div className="panel-header flex items-center justify-between">
              <span className="label-caps text-ink-primary font-bold">Operational Insights</span>
              <span className="code-badge text-ink-tertiary">TELEMETRY AGGREGATION</span>
            </div>
            <div className="divide-y divide-stroke">
              {recurringPatterns.slice(0, 3).map((pattern, i) => (
                <div key={i} className="p-3 flex items-start gap-3">
                  <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5"
                    style={{ color: i === 0 ? '#E59B1F' : i === 1 ? '#2F6FDE' : '#1F8A5B' }}>
                    {i === 0 ? 'history_toggle_off' : i === 1 ? 'water_damage' : 'verified'}
                  </span>
                  <div>
                    <span className="body-strong text-ink-primary">{pattern.title || `${pattern.equipment} — ${pattern.locationName}`}</span>
                    <p className="text-ink-tertiary mt-0.5 text-[12px]">{pattern.recommendation || pattern.recommendedPermanentAction}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Performance */}
          <div className="panel overflow-hidden">
            <div className="panel-header flex items-center justify-between">
              <span className="label-caps text-ink-primary font-bold">Department Load</span>
              <span className="code-badge text-ink-tertiary">REAL-TIME</span>
            </div>
            <div className="divide-y divide-stroke">
              {deptStats.map(dept => (
                <div key={dept.id} className="px-3 py-2 flex items-center justify-between">
                  <div>
                    <span className="body-strong text-ink-primary text-[13px]">{dept.name}</span>
                    <span className="code-badge text-ink-tertiary ml-2">{dept.active} active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {dept.critical > 0 && <span className="badge-critical">{dept.critical} P0</span>}
                    <span className="code-badge text-ink-primary font-semibold">{dept.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Merge Workbench ── */}
      <section className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-secondary">call_merge</span>
            <span className="label-caps text-ink-primary font-bold">Incident Consolidation Workbench</span>
          </div>
          <span className="code-badge text-ink-tertiary">DUPLICATE RESOLVER</span>
        </div>
        <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Primary Target */}
          <div>
            <label className="label-caps block mb-1.5">Primary Target Incident</label>
            <select value={mergePrimaryId} onChange={e => setMergePrimaryId(e.target.value)} className="input-field w-full">
              {incidents.filter(i => i.status !== 'CLOSED').slice(0, 15).map(i => (
                <option key={i.id} value={i.id}>{i.incidentNumber} — {i.title}</option>
              ))}
            </select>
          </div>
          {/* Sources to merge */}
          <div>
            <label className="label-caps block mb-1.5">Select Sources to Merge ({selectedMergeSources.length} selected)</label>
            <div className="max-h-48 overflow-y-auto border border-stroke rounded-md divide-y divide-stroke">
              {mergeCandidates.map(inc => (
                <label key={inc.id} className="flex items-center gap-2 px-3 py-2 hover:bg-surface-container-low cursor-pointer">
                  <input type="checkbox" checked={selectedMergeSources.includes(inc.id)}
                    onChange={() => toggleMergeSource(inc.id)} className="w-3.5 h-3.5 rounded-none border-ink-tertiary" />
                  <span className="code-base font-semibold text-ink-primary">{inc.incidentNumber}</span>
                  <span className="text-ink-tertiary text-[12px] truncate">{inc.title}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4 flex items-center gap-3">
          <button onClick={handleExecuteMerge} disabled={selectedMergeSources.length === 0}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed" style={{ background: '#2F6FDE' }}>
            <span className="material-symbols-outlined text-[16px]">call_merge</span>
            Consolidate {selectedMergeSources.length} Report(s)
          </button>
          {mergeSuccessMsg && (
            <span className="code-badge text-resolved animate-rise">{mergeSuccessMsg}</span>
          )}
        </div>
      </section>

      {/* ── Campus Site Grid (Interactive Map Placeholder) ── */}
      <section className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-ink-primary">layers</span>
            <span className="label-caps text-ink-primary font-bold">Campus Site Grid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex bg-surface p-0.5 rounded border border-stroke code-badge">
              {['All', 'Electrical', 'Water', 'HVAC', 'IT'].map((f, i) => (
                <button key={f} onClick={() => setMapCategoryFilter(i === 0 ? 'ALL' : f)}
                  className={`px-2 py-1 rounded transition-colors ${
                    (i === 0 && mapCategoryFilter === 'ALL') || mapCategoryFilter === f
                      ? 'bg-primary text-on-primary font-medium'
                      : 'text-ink-tertiary hover:text-ink-primary'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Architectural Map */}
        <div className="relative w-full h-[400px] overflow-hidden select-none" style={{ background: '#F6F4EF' }}>
          {/* Grid Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" fill="none" strokeWidth="0.5" stroke="#E4E0D6">
            <pattern id="admin-cad-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#admin-cad-grid)" />
          </svg>

          {/* Building Blocks */}
          <svg className="w-full h-full" fill="none" viewBox="0 0 1000 400">
            {/* Walkways */}
            <rect x="180" y="200" width="640" height="20" fill="#EDE9DE" />
            <rect x="470" y="60" width="24" height="300" fill="#EDE9DE" />

            {/* Block A */}
            <rect x="180" y="80" width="190" height="100" rx="2" fill="#FFFFFF" stroke="#CBC6BD" strokeWidth="1.5" />
            <rect x="180" y="80" width="190" height="18" fill="#F3EDE2" />
            <text x="190" y="94" fontFamily="Geist" fontSize="10" fontWeight="600" fill="#1D1B15" letterSpacing="0.5">BLOCK A — ADMINISTRATIVE</text>

            {/* Block B */}
            <rect x="520" y="70" width="220" height="120" rx="2" fill="#FFFFFF" stroke="#CBC6BD" strokeWidth="1.5" />
            <rect x="520" y="70" width="220" height="18" fill="#F3EDE2" />
            <text x="530" y="84" fontFamily="Geist" fontSize="10" fontWeight="600" fill="#1D1B15" letterSpacing="0.5">BLOCK B — SCIENCE & ENGINEERING</text>

            {/* Block C */}
            <rect x="180" y="250" width="180" height="100" rx="2" fill="#FFFFFF" stroke="#CBC6BD" strokeWidth="1.5" />
            <rect x="180" y="250" width="180" height="18" fill="#F3EDE2" />
            <text x="190" y="264" fontFamily="Geist" fontSize="10" fontWeight="600" fill="#1D1B15" letterSpacing="0.5">BLOCK C — HUMANITIES</text>

            {/* Block D */}
            <rect x="660" y="240" width="190" height="120" rx="2" fill="#FFFFFF" stroke="#CBC6BD" strokeWidth="1.5" />
            <rect x="660" y="240" width="190" height="18" fill="#F3EDE2" />
            <text x="670" y="254" fontFamily="Geist" fontSize="10" fontWeight="600" fill="#1D1B15" letterSpacing="0.5">BLOCK D — STUDENT CENTER</text>

            {/* Library */}
            <rect x="410" y="50" width="80" height="60" rx="2" fill="#FFFFFF" stroke="#CBC6BD" strokeWidth="1.5" />
            <text x="420" y="85" fontFamily="Geist" fontSize="9" fontWeight="600" fill="#1D1B15">LIBRARY</text>

            {/* Incident Pins */}
            {filteredMapIncidents.slice(0, 8).map((inc, i) => {
              const positions = [
                { cx: 680, cy: 150 }, { cx: 320, cy: 140 }, { cx: 450, cy: 85 },
                { cx: 710, cy: 300 }, { cx: 310, cy: 310 }, { cx: 250, cy: 130 },
                { cx: 620, cy: 160 }, { cx: 730, cy: 280 }
              ];
              const pos = positions[i % positions.length];
              const color = getPriorityColor(inc.priority);
              return (
                <g key={inc.id} className="cursor-pointer" onClick={() => setSelectedIncidentForDetail(inc)}>
                  {inc.priority === 'critical' && <circle cx={pos.cx} cy={pos.cy} r="14" fill={color} opacity="0.2" className="animate-ping" />}
                  <circle cx={pos.cx} cy={pos.cy} r="7" fill={color} />
                  <circle cx={pos.cx} cy={pos.cy} r="2.5" fill="#FFFFFF" />
                  <rect x={pos.cx - 25} y={pos.cy - 22} width="50" height="14" rx="2" fill="#1D1C17" />
                  <text x={pos.cx} y={pos.cy - 12} fill="#FFFFFF" fontFamily="JetBrains Mono" fontSize="8" fontWeight="bold" textAnchor="middle">{inc.incidentNumber}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Map Footer */}
        <div className="p-3 border-t border-stroke bg-surface-container-low flex items-center justify-between code-badge text-ink-tertiary">
          <span>{filteredMapIncidents.length} active incidents displayed</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-resolved" /> Timeline Synchronized
          </div>
        </div>
      </section>
    </div>
  );
};
