'use client';

import React, { useState } from 'react';
import { useCampusFix } from '@/context/CampusFixContext';
import { Incident } from '@/types/campusfix';
import { DEMO_EVIDENCE_IMAGES } from '@/lib/demo-images';

export const StaffPortal: React.FC = () => {
  const { 
    incidents, 
    departments,
    currentUser,
    updateStatus, 
    submitResolution,
    reassignDepartment,
    overridePriority,
    setSelectedIncidentForDetail
  } = useCampusFix();

  const [activeTab, setActiveTab] = useState<'queue' | 'resolved'>('queue');
  const [resolvingIncident, setResolvingIncident] = useState<Incident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [afterImageKey, setAfterImageKey] = useState('acWaterLeakAfter');

  const assignedIncidents = incidents.filter(
    i => i.status !== 'CLOSED' && i.status !== 'VERIFIED' && i.status !== 'RESOLVED'
  ).sort((a, b) => b.priorityScore - a.priorityScore);

  const resolvedIncidents = incidents.filter(
    i => i.status === 'RESOLVED' || i.status === 'VERIFIED' || i.status === 'CLOSED'
  );

  const handleResolve = () => {
    if (!resolvingIncident || !resolutionNotes.trim()) return;
    const afterImg = DEMO_EVIDENCE_IMAGES[afterImageKey as keyof typeof DEMO_EVIDENCE_IMAGES] || '';
    submitResolution(resolvingIncident.id, resolutionNotes, afterImg);
    setResolvingIncident(null);
    setResolutionNotes('');
  };

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

  const visibleIncidents = activeTab === 'queue' ? assignedIncidents : resolvedIncidents;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* ── Header ── */}
      <div className="border-b border-stroke pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-baseline gap-4">
            <h1 className="headline-lg text-ink-primary tracking-tight">Field Operations</h1>
            <span className="code-base text-ink-tertiary uppercase tracking-wider hidden sm:inline">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-high code-badge text-ink-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-resolved" />
              ON SHIFT — {currentUser.name}
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'My Queue', value: assignedIncidents.length, color: '#2F6FDE', sub: 'Active tasks' },
          { label: 'Critical', value: assignedIncidents.filter(i => i.priority === 'critical').length, color: '#E5482D', sub: 'Requires immediate' },
          { label: 'Resolved Today', value: resolvedIncidents.filter(i => i.resolvedAt).length, color: '#1F8A5B', sub: 'Completed' },
          { label: 'Avg Response', value: '2.4h', color: '#E59B1F', sub: 'This week' },
        ].map((stat, i) => (
          <div key={i} className="panel p-3">
            <span className="label-caps">{stat.label}</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="display-accent tracking-tight font-medium" style={{ color: stat.color, fontSize: '28px' }}>{stat.value}</span>
              <span className="code-badge text-ink-tertiary">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tab Switcher ── */}
      <div className="flex items-center gap-1 bg-surface-container-high p-0.5 rounded-md w-fit border border-stroke">
        {[
          { key: 'queue' as const, label: 'Active Queue', count: assignedIncidents.length },
          { key: 'resolved' as const, label: 'Resolved', count: resolvedIncidents.length },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 code-badge rounded transition-colors ${
              activeTab === tab.key ? 'bg-surface text-ink-primary font-semibold shadow-sm' : 'text-ink-tertiary hover:text-ink-primary'
            }`}>
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* ── Incident Table ── */}
      <div className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="label-caps text-ink-primary font-bold">{activeTab === 'queue' ? 'Dispatch Queue' : 'Completed Resolutions'}</span>
            <span className="code-badge px-1.5 py-0.5 rounded bg-primary text-on-primary">{visibleIncidents.length}</span>
          </div>
          <span className="code-badge text-ink-tertiary">SORTED BY PRIORITY</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-9 border-b border-stroke bg-surface table-header text-ink-secondary">
                <th className="w-24 px-3">ID</th>
                <th className="px-3">Incident & Location</th>
                <th className="w-24 px-3">Priority</th>
                <th className="w-28 px-3">Dept</th>
                <th className="w-24 px-3">Status</th>
                <th className="w-40 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {visibleIncidents.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center code-badge text-ink-tertiary">
                  {activeTab === 'queue' ? 'No active incidents in your queue.' : 'No resolved incidents yet.'}
                </td></tr>
              ) : (
                visibleIncidents.slice(0, 12).map(inc => (
                  <tr key={inc.id} className="group cursor-pointer hover:bg-surface-container/50 transition-colors relative"
                    onClick={() => setSelectedIncidentForDetail(inc)}>
                    <td className="px-3 py-2 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: getPriorityColor(inc.priority) }} />
                      <span className="code-base font-semibold text-ink-primary">{inc.incidentNumber}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="body-strong text-ink-primary truncate block max-w-[300px]">{inc.title}</span>
                      <div className="flex items-center gap-1 mt-0.5 code-badge text-ink-tertiary">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        {inc.room} • {inc.building}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 code-badge font-medium" style={{ color: getPriorityColor(inc.priority) }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: getPriorityColor(inc.priority) }} />
                        {inc.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="code-badge text-ink-primary">{inc.departmentName?.split(' ')[0]}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 code-badge" style={{ color: getPriorityColor(inc.priority) }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: getPriorityColor(inc.priority) }} />
                        {getStatusLabel(inc.status)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {activeTab === 'queue' && (
                          <>
                            {inc.status === 'AI_TRIAGED' && (
                              <button onClick={() => updateStatus(inc.id, 'IN_PROGRESS', 'Staff acknowledged and started work.')}
                                className="btn-secondary h-7 px-2 text-[11px]">
                                <span className="material-symbols-outlined text-[14px]">play_arrow</span> Start
                              </button>
                            )}
                            {(inc.status === 'IN_PROGRESS' || inc.status === 'ASSIGNED' || inc.status === 'REOPENED') && (
                              <button onClick={() => setResolvingIncident(inc)}
                                className="btn-primary h-7 px-2 text-[11px]" style={{ background: '#1F8A5B' }}>
                                <span className="material-symbols-outlined text-[14px]">check_circle</span> Resolve
                              </button>
                            )}
                          </>
                        )}
                        <button className="text-ink-tertiary hover:text-ink-primary p-1 rounded">
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Resolution Modal ── */}
      {resolvingIncident && (
        <div className="fixed inset-0 bg-ink-primary/30 z-50 flex items-center justify-center p-4" onClick={() => setResolvingIncident(null)}>
          <div className="bg-surface border border-stroke rounded-[14px] w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 4px 12px rgba(20,19,15,0.06)' }}>
            <div className="p-4 border-b border-stroke flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-resolved">task_alt</span>
                  <span className="headline-sm text-ink-primary">Submit Resolution</span>
                </div>
                <span className="code-badge text-ink-tertiary mt-1 block">{resolvingIncident.incidentNumber} • {resolvingIncident.title}</span>
              </div>
              <button onClick={() => setResolvingIncident(null)} className="text-ink-tertiary hover:text-ink-primary p-1 rounded">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="label-caps block mb-1.5">Resolution Notes</label>
                <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)} rows={3}
                  className="w-full px-3 py-2.5 rounded-md border border-stroke bg-surface text-ink-primary text-[13px] leading-5 resize-none focus:border-ink-primary focus:outline-none"
                  placeholder="Describe the work performed..." />
              </div>
              <div>
                <label className="label-caps block mb-1.5">After-Fix Evidence Photo</label>
                <select value={afterImageKey} onChange={e => setAfterImageKey(e.target.value)} className="input-field w-full">
                  {Object.keys(DEMO_EVIDENCE_IMAGES).filter(k => k.includes('After')).map(k => (
                    <option key={k} value={k}>{k.replace(/([A-Z])/g, ' $1').trim()}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label-caps block mb-1.5">Reassign Department</label>
                <select onChange={e => { if (e.target.value) reassignDepartment(resolvingIncident.id, e.target.value); }} className="input-field w-full">
                  <option value="">Keep current ({resolvingIncident.departmentName})</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2 pt-2 border-t border-stroke">
                <button onClick={() => setResolvingIncident(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
                <button onClick={handleResolve} disabled={!resolutionNotes.trim()} className="btn-primary flex-1 justify-center disabled:opacity-40" style={{ background: '#1F8A5B' }}>
                  <span className="material-symbols-outlined text-[16px]">check_circle</span> Submit Resolution
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
