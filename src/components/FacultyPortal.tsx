'use client';

import React from 'react';
import { useCampusFix } from '@/context/CampusFixContext';

export const FacultyPortal: React.FC = () => {
  const { incidents, currentUser, setSelectedIncidentForDetail } = useCampusFix();

  const facultyRelevant = incidents.filter(i =>
    i.building === 'Block A' || i.building === 'Block B' || i.category.includes('IT') || i.category.includes('Electrical')
  ).sort((a, b) => b.priorityScore - a.priorityScore);

  const activeIssues = facultyRelevant.filter(i => i.status !== 'CLOSED' && i.status !== 'VERIFIED');
  const resolvedIssues = facultyRelevant.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED' || i.status === 'VERIFIED');

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = { critical: '#E5482D', high: '#E59B1F', medium: '#2F6FDE', low: '#7A8A7C' };
    return map[priority] || '#8A867D';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

      {/* Header */}
      <div className="border-b border-stroke pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-baseline gap-4">
            <h1 className="headline-lg text-ink-primary tracking-tight">Faculty Dashboard</h1>
            <span className="code-base text-ink-tertiary uppercase tracking-wider hidden sm:inline">
              Academic Infrastructure
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-high code-badge text-ink-primary">
            <span className="material-symbols-outlined text-[14px]">school</span>
            {currentUser.name}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Department Issues', value: activeIssues.length, color: '#2F6FDE' },
          { label: 'Critical', value: activeIssues.filter(i => i.priority === 'critical').length, color: '#E5482D' },
          { label: 'Resolved', value: resolvedIssues.length, color: '#1F8A5B' },
          { label: 'Avg SLA', value: '4.2h', color: '#E59B1F' },
        ].map((stat, i) => (
          <div key={i} className="panel p-3">
            <span className="label-caps">{stat.label}</span>
            <span className="display-accent block mt-1 tracking-tight font-medium" style={{ color: stat.color, fontSize: '28px' }}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Issues Table */}
      <div className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="label-caps text-ink-primary font-bold">Academic Zone Issues</span>
            <span className="code-badge px-1.5 py-0.5 rounded bg-primary text-on-primary">{activeIssues.length} Active</span>
          </div>
          <span className="code-badge text-ink-tertiary">BLOCKS A, B & LABS</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-9 border-b border-stroke bg-surface table-header text-ink-secondary">
                <th className="w-24 px-3">ID</th>
                <th className="px-3">Issue & Location</th>
                <th className="w-24 px-3">Priority</th>
                <th className="w-28 px-3">Department</th>
                <th className="w-24 px-3">Status</th>
                <th className="w-16 px-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke">
              {activeIssues.length === 0 ? (
                <tr><td colSpan={6} className="px-3 py-8 text-center code-badge text-ink-tertiary">No active issues in academic zones.</td></tr>
              ) : (
                activeIssues.slice(0, 10).map(inc => (
                  <tr key={inc.id} className="cursor-pointer hover:bg-surface-container/50 transition-colors relative"
                    onClick={() => setSelectedIncidentForDetail(inc)}>
                    <td className="px-3 py-2 relative">
                      <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: getPriorityColor(inc.priority) }} />
                      <span className="code-base font-semibold text-ink-primary">{inc.incidentNumber}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="body-strong text-ink-primary">{inc.title}</span>
                      <div className="code-badge text-ink-tertiary mt-0.5 flex items-center gap-1">
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
                    <td className="px-3 py-2 code-badge text-ink-primary">{inc.departmentName?.split(' ')[0]}</td>
                    <td className="px-3 py-2">
                      <span className="code-badge" style={{ color: getPriorityColor(inc.priority) }}>{inc.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className="material-symbols-outlined text-[16px] text-ink-tertiary">chevron_right</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recently Resolved */}
      {resolvedIssues.length > 0 && (
        <div className="panel overflow-hidden">
          <div className="panel-header flex items-center justify-between">
            <span className="label-caps text-ink-primary font-bold">Recently Resolved</span>
            <span className="code-badge text-resolved font-semibold">{resolvedIssues.length} Completed</span>
          </div>
          <div className="divide-y divide-stroke">
            {resolvedIssues.slice(0, 5).map(inc => (
              <div key={inc.id} className="px-3 py-2.5 flex items-center justify-between cursor-pointer hover:bg-surface-container/50"
                onClick={() => setSelectedIncidentForDetail(inc)}>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-resolved">check_circle</span>
                  <div>
                    <span className="body-strong text-ink-primary text-[13px]">{inc.title}</span>
                    <span className="code-badge text-ink-tertiary ml-2">{inc.incidentNumber}</span>
                  </div>
                </div>
                <span className="badge-resolved">RESOLVED</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
