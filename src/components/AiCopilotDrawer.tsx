'use client';

import React, { useState } from 'react';
import { useCampusFix } from '@/context/CampusFixContext';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiCopilotDrawer({ isOpen, onClose }: AiCopilotDrawerProps) {
  const { incidents, healthMetrics, departments, recurringPatterns } = useCampusFix();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'CampusFix Operations Copilot online. I can analyze incident trends, suggest resource allocation, identify recurring patterns, and provide operational intelligence. What would you like to know?' }
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.toLowerCase();
    setMessages(prev => [...prev, { role: 'user', text: query }]);

    let response = '';
    if (q.includes('critical') || q.includes('urgent') || q.includes('priority')) {
      const criticals = incidents.filter(i => i.priority === 'critical' && i.status !== 'CLOSED');
      response = `There are ${criticals.length} critical incidents active:\n\n${criticals.map(i => `• ${i.incidentNumber}: ${i.title} — ${i.room}, ${i.building} (Score: ${i.priorityScore}/100)`).join('\n')}\n\nRecommendation: Prioritize ${criticals[0]?.incidentNumber || 'the most urgent'} — it has the highest priority score.`;
    } else if (q.includes('health') || q.includes('status') || q.includes('overview')) {
      response = `Campus Health Score: ${healthMetrics.overallScore}/100\n\n• Total Incidents: ${healthMetrics.totalIncidents}\n• Active: ${healthMetrics.activeIncidents}\n• Critical: ${healthMetrics.criticalIncidents}\n• SLA Breached: ${healthMetrics.slaBreachedIncidents}\n• Resolution Rate: ${healthMetrics.resolutionRateScore}%\n• Avg Resolution: ${healthMetrics.avgResolutionHours}h\n\nOverall campus operations are ${healthMetrics.overallScore > 80 ? 'nominal' : 'under stress'}.`;
    } else if (q.includes('pattern') || q.includes('recurring') || q.includes('trend')) {
      response = `Detected ${recurringPatterns.length} recurring patterns:\n\n${recurringPatterns.map(p => {
        const count = p.occurrenceCount ?? p.incidentCount;
        const title = p.title || `${p.equipment} in ${p.locationName}`;
        const rec = p.recommendation || p.recommendedPermanentAction;
        return `• ${title}: ${count} occurrences — ${rec}`;
      }).join('\n')}`;
    } else if (q.includes('department') || q.includes('team') || q.includes('load')) {
      response = departments.map(d => {
        const active = incidents.filter(i => i.departmentId === d.id && i.status !== 'CLOSED').length;
        const staff = d.staffCount ?? 6;
        return `• ${d.name}: ${active} active incidents (${staff} staff)`;
      }).join('\n') + '\n\nRecommendation: Balance workloads by reassigning non-critical tasks from overloaded departments.';
    } else {
      response = `I analyzed your query against current campus telemetry:\n\n• ${healthMetrics.activeIncidents} active incidents across ${departments.length} departments\n• Campus health at ${healthMetrics.overallScore}/100\n• ${healthMetrics.criticalIncidents} critical items need attention\n\nCould you be more specific? Try asking about "critical incidents", "campus health", "recurring patterns", or "department load".`;
    }

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    }, 400);
    setQuery('');
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink-primary/40 z-50" onClick={onClose} />
      <aside className="fixed right-0 top-0 bottom-0 w-full sm:w-[420px] bg-surface border-l border-stroke z-50 flex flex-col shadow-xl"
        style={{ boxShadow: '0 4px 24px rgba(20,19,15,0.12)' }}>

        {/* Header */}
        <div className="h-14 px-4 border-b border-stroke flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-secondary">smart_toy</span>
            <span className="headline-sm text-ink-primary">Operations Copilot</span>
            <span className="code-badge uppercase bg-[#d9e2ff] text-[#004299] px-1 rounded text-[10px]">AI</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-ink-tertiary hover:text-ink-primary transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-md text-[13px] leading-5 whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-low border border-stroke text-ink-primary'
              }`}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-1.5 mb-1.5 code-badge text-secondary font-semibold">
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                    COPILOT ANALYSIS
                  </div>
                )}
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-stroke bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)}
              className="flex-1 input-field"
              placeholder="Ask about incidents, trends, health..."
            />
            <button type="submit" className="btn-primary h-8 px-3">
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {['Critical incidents', 'Campus health', 'Recurring patterns', 'Department load'].map(s => (
              <button key={s} type="button" onClick={() => { setQuery(s); }}
                className="px-2 py-1 rounded border border-stroke bg-surface text-ink-tertiary hover:text-ink-primary code-badge transition-colors">
                {s}
              </button>
            ))}
          </div>
        </form>
      </aside>
    </>
  );
}
