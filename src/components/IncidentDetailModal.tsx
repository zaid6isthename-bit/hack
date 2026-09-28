'use client';

import React from 'react';
import { useCampusFix } from '@/context/CampusFixContext';
import { Incident } from '@/types/campusfix';

export function IncidentDetailModal() {
  const { selectedIncidentForDetail, setSelectedIncidentForDetail, departments, reassignDepartment, overridePriority, updateStatus } = useCampusFix();

  if (!selectedIncidentForDetail) return null;
  const inc = selectedIncidentForDetail;

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = { critical: '#E5482D', high: '#E59B1F', medium: '#2F6FDE', low: '#7A8A7C' };
    return map[priority] || '#8A867D';
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink-primary/40 z-50" onClick={() => setSelectedIncidentForDetail(null)} />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[460px] bg-surface border-l border-stroke z-50 flex flex-col shadow-xl overflow-hidden"
        style={{ boxShadow: '0 4px 24px rgba(20,19,15,0.12)' }}>

        {/* Header */}
        <div className="h-14 px-4 border-b border-stroke flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2">
            <span className="code-badge uppercase px-1.5 py-0.5 rounded font-bold"
              style={{ background: 'rgba(255,218,214,1)', color: '#E5482D' }}>
              {inc.incidentNumber}
            </span>
            <span className="label-caps text-ink-tertiary">Triage Inspector</span>
          </div>
          <button onClick={() => setSelectedIncidentForDetail(null)} className="p-1 rounded text-ink-tertiary hover:text-ink-primary hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">

          {/* Headline & Status */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="code-badge px-1.5 py-0.5 rounded font-bold"
                style={{ background: `${getPriorityColor(inc.priority)}12`, color: getPriorityColor(inc.priority), border: `1px solid ${getPriorityColor(inc.priority)}40` }}>
                {inc.priority.toUpperCase()} PRIORITY
              </span>
              <span className="code-badge text-ink-tertiary">Score: {inc.priorityScore}/100</span>
            </div>
            <h3 className="headline-md text-ink-primary">{inc.title}</h3>
            <p className="text-ink-secondary text-[13px] mt-1">{inc.description}</p>
          </div>

          {/* Location & Department */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-surface-container-low rounded-md border border-stroke">
            <div>
              <span className="label-caps block">Location</span>
              <span className="code-badge text-ink-primary font-semibold">{inc.room}, {inc.floor}</span>
              <span className="code-badge text-ink-tertiary block">{inc.building}</span>
            </div>
            <div>
              <span className="label-caps block">Department</span>
              <span className="code-badge text-ink-primary font-semibold">{inc.departmentName}</span>
              <span className="code-badge text-ink-tertiary block">AI Confidence: {Math.round(inc.aiConfidence * 100)}%</span>
            </div>
          </div>

          {/* Evidence Photo */}
          {inc.imageUrl && (
            <div>
              <span className="label-caps block mb-1.5">Evidence Photo</span>
              <div className="relative w-full h-44 bg-surface-container rounded-md overflow-hidden border border-stroke">
                <img src={inc.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-primary-container/80 text-on-primary code-badge rounded text-[10px]">
                  EVIDENCE
                </div>
              </div>
            </div>
          )}

          {/* AI Routing Confidence */}
          <div className="p-3 bg-surface-container-low rounded-md border border-stroke">
            <div className="flex items-center justify-between mb-1">
              <span className="label-caps text-ink-primary font-bold">Automated Dispatch Intelligence</span>
              <span className="code-badge text-secondary font-semibold">{Math.round(inc.aiConfidence * 100)}% MATCH</span>
            </div>
            <p className="text-ink-secondary text-[12px]">
              Natural Language parser classified this incident based on keywords, location history, and equipment telemetry.
            </p>
            <div className="w-full bg-stroke h-1.5 rounded-full overflow-hidden mt-2">
              <div className="bg-secondary h-full rounded-full" style={{ width: `${Math.round(inc.aiConfidence * 100)}%` }} />
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="p-3 bg-surface-container-low rounded-md border border-stroke">
            <span className="label-caps block mb-2">Priority Score Breakdown</span>
            <div className="space-y-1.5">
              {inc.scoreBreakdown && Object.entries(inc.scoreBreakdown).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between code-badge">
                  <span className="text-ink-tertiary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="text-ink-primary font-semibold">{val as number}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <span className="label-caps block mb-2">Activity & Cluster Log</span>
            <div className="relative border-l border-stroke ml-2 pl-4 flex flex-col gap-3">
              {inc.history.slice(0, 6).map((h, i) => (
                <div key={h.id} className="relative">
                  <span className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full"
                    style={{ background: i === 0 ? getPriorityColor(inc.priority) : i === 1 ? '#2F6FDE' : '#7A8A7C' }} />
                  <span className="code-badge text-ink-tertiary block">
                    {new Date(h.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="body-strong text-ink-primary text-[13px]">{h.action}</span>
                  {h.notes && <span className="text-ink-tertiary block text-[12px]">{h.notes}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Admin Actions */}
          <div className="p-3 border border-stroke rounded-md bg-surface-container-low">
            <span className="label-caps text-ink-primary font-bold block mb-2">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <select onChange={e => { if (e.target.value) reassignDepartment(inc.id, e.target.value); }} className="input-field text-[12px]">
                <option value="">Reassign Dept...</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select onChange={e => { if (e.target.value) overridePriority(inc.id, e.target.value as any); }} className="input-field text-[12px]">
                <option value="">Override Priority...</option>
                {['critical', 'high', 'medium', 'low'].map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stroke bg-surface-container-low flex items-center justify-between shrink-0">
          <button onClick={() => setSelectedIncidentForDetail(null)} className="btn-secondary">Close</button>
          <div className="flex items-center gap-2">
            {inc.status !== 'CLOSED' && inc.status !== 'RESOLVED' && (
              <button onClick={() => { updateStatus(inc.id, 'IN_PROGRESS', 'Dispatched by inspector.'); setSelectedIncidentForDetail(null); }}
                className="btn-primary">
                <span className="material-symbols-outlined text-[16px]">check_circle</span> Dispatch
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
