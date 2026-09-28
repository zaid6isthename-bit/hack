'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useCampusFix } from '@/context/CampusFixContext';
import { Incident } from '@/types/campusfix';
import { DEMO_EVIDENCE_IMAGES } from '@/lib/demo-images';

export const StudentPortal: React.FC = () => {
  const { 
    currentUser, 
    incidents, 
    locations, 
    analyzeDraftReport, 
    checkDraftDuplicates,
    submitReportAsNewIncident,
    attachReportToExistingIncident,
    confirmStudentVerification,
    setSelectedIncidentForDetail
  } = useCampusFix();

  // Composer Form State
  const [description, setDescription] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState(locations[9]?.id || locations[0].id);
  const [selectedImageKey, setSelectedImageKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<Incident | null>(null);

  // Duplicate Modal State
  const [duplicateWarning, setDuplicateWarning] = useState<{
    incident: Incident;
    similarity: number;
    reason: string;
  } | null>(null);

  // Resolution Feedback
  const [verifyingIncident, setVerifyingIncident] = useState<Incident | null>(null);
  const [reopenComment, setReopenComment] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  // Real-time AI Draft Evaluation
  const activeLocation = locations.find(l => l.id === selectedLocationId) || locations[0];
  const aiDraft = description.trim().length > 10 
    ? analyzeDraftReport(description, activeLocation.id, !!selectedImageKey)
    : null;

  // Preset quick prompt samples
  const presets = [
    { title: 'Scene 1: Critical Leak + Socket', text: 'The AC in classroom 302 has been leaking since this morning and water is collecting near the electrical socket.', locId: 'loc-b301', imgKey: 'acWaterLeakBefore' },
    { title: 'Scene 2: Duplicate Report', text: 'Water is leaking in room 302 near the wall socket and making a puddle.', locId: 'loc-b301', imgKey: 'acWaterLeakBefore' },
    { title: 'Classroom 204 Fan Spark', text: 'The ceiling fan in room 204 is wobbling violently and making electrical sparks from the motor.', locId: 'loc-b201', imgKey: 'fanSparkingBefore' },
    { title: 'Lab 3 Projector Outage', text: 'Projector stopped showing display in Computer Lab 3. Class presentation cannot proceed.', locId: 'loc-a201', imgKey: 'projectorBrokenBefore' }
  ];

  const handleApplyPreset = (p: typeof presets[0]) => {
    setDescription(p.text);
    setSelectedLocationId(p.locId);
    setSelectedImageKey(p.imgKey);
    setSubmittedSuccess(null);
  };

  const handleInitiateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const dupCheck = checkDraftDuplicates(description, activeLocation.id);
    if (dupCheck.isDuplicate && dupCheck.similarIncident) {
      setDuplicateWarning({ incident: dupCheck.similarIncident, similarity: dupCheck.similarity, reason: dupCheck.reason || 'Similar equipment and room reported recently.' });
      return;
    }
    executeCreateIncident();
  };

  const executeCreateIncident = () => {
    setIsSubmitting(true);
    setDuplicateWarning(null);
    setTimeout(() => {
      const imgUrl = selectedImageKey ? DEMO_EVIDENCE_IMAGES[selectedImageKey as keyof typeof DEMO_EVIDENCE_IMAGES] : undefined;
      const newInc = submitReportAsNewIncident(description, selectedLocationId, imgUrl);
      setIsSubmitting(false);
      setSubmittedSuccess(newInc);
      setDescription('');
      setSelectedImageKey(null);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }, 600);
  };

  const executeJoinDuplicate = (targetIncidentId: string) => {
    setIsSubmitting(true);
    setDuplicateWarning(null);
    setTimeout(() => {
      const imgUrl = selectedImageKey ? DEMO_EVIDENCE_IMAGES[selectedImageKey as keyof typeof DEMO_EVIDENCE_IMAGES] : undefined;
      attachReportToExistingIncident(targetIncidentId, description, selectedLocationId, imgUrl);
      setIsSubmitting(false);
      const target = incidents.find(i => i.id === targetIncidentId);
      if (target) setSubmittedSuccess(target);
      setDescription('');
      setSelectedImageKey(null);
    }, 500);
  };

  const handleStudentConfirm = (incidentId: string, isFixed: boolean) => {
    confirmStudentVerification(incidentId, isFixed, reopenComment || undefined);
    setVerifyingIncident(null);
    setShowReopenInput(false);
    setReopenComment('');
    if (isFixed) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const myReports = incidents.filter(i =>
    i.supportingReports.some(r => r.userId === currentUser.id || r.userName.includes(currentUser.name)) ||
    i.id === 'inc-1042' || i.id === 'inc-1012'
  );

  const awaitingVerification = incidents.filter(i =>
    i.status === 'RESOLVED' &&
    (i.supportingReports.some(r => r.userId === currentUser.id) || i.id === 'inc-1012' || i.id === 'inc-1042')
  );

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, { bg: string; text: string; dot: string; label: string }> = {
      critical: { bg: 'rgba(229,72,45,0.08)', text: '#E5482D', dot: '#E5482D', label: 'CRITICAL' },
      high: { bg: 'rgba(229,155,31,0.08)', text: '#E59B1F', dot: '#E59B1F', label: 'HIGH' },
      medium: { bg: 'rgba(47,111,222,0.08)', text: '#2F6FDE', dot: '#2F6FDE', label: 'MEDIUM' },
      low: { bg: 'rgba(122,138,124,0.08)', text: '#7A8A7C', dot: '#7A8A7C', label: 'LOW' },
    };
    const s = map[priority] || map.medium;
    return (
      <span className="inline-flex items-center gap-1 code-badge px-1.5 py-0.5 rounded" style={{ background: s.bg, color: s.text, border: `1px solid ${s.text}25` }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
        {s.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, { color: string; label: string }> = {
      'SUBMITTED': { color: '#8A867D', label: 'Submitted' },
      'AI_TRIAGED': { color: '#2F6FDE', label: 'AI Triaged' },
      'ASSIGNED': { color: '#0159c7', label: 'Assigned' },
      'IN_PROGRESS': { color: '#E59B1F', label: 'In Progress' },
      'RESOLVED': { color: '#1F8A5B', label: 'Resolved' },
      'CLOSED': { color: '#1F8A5B', label: 'Closed' },
      'VERIFIED': { color: '#1F8A5B', label: 'Verified' },
      'REOPENED': { color: '#E5482D', label: 'Reopened' },
    };
    const s = map[status] || { color: '#8A867D', label: status };
    return (
      <span className="inline-flex items-center gap-1 code-badge" style={{ color: s.color }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
        {s.label}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* ── Hero / Welcome ── */}
      <div className="border-b border-stroke pb-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-baseline gap-4">
            <h1 className="headline-lg text-ink-primary tracking-tight">Report an Issue</h1>
            <span className="code-base text-ink-tertiary uppercase tracking-wider hidden sm:inline">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-high code-badge text-ink-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              AI TRIAGE ACTIVE
            </span>
            <span className="code-badge text-ink-tertiary">Logged in as {currentUser.name}</span>
          </div>
        </div>
        <p className="mt-2 text-ink-secondary text-[13px] max-w-2xl">
          Describe the issue in natural language, attach a photo, and our AI will classify, prioritize, and assign it to the right department in seconds.
        </p>
      </div>

      {/* ── Verification Alert Banner ── */}
      {awaitingVerification.length > 0 && (
        <div className="panel overflow-hidden">
          <div className="h-1 bg-resolved w-full" />
          <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[22px] text-resolved mt-0.5">verified</span>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="label-caps text-resolved font-bold">Resolution Verification Required</span>
                  <span className="badge-resolved">{awaitingVerification.length} action needed</span>
                </div>
                <span className="headline-sm text-ink-primary">{awaitingVerification[0].title}</span>
                <p className="text-ink-secondary text-[13px] mt-0.5">Staff uploaded photographic proof. Please confirm if the issue is actually resolved.</p>
              </div>
            </div>
            <button onClick={() => setVerifyingIncident(awaitingVerification[0])} className="btn-primary whitespace-nowrap" style={{ background: '#1F8A5B' }}>
              <span className="material-symbols-outlined text-[16px]">task_alt</span>
              Inspect & Verify
            </button>
          </div>
        </div>
      )}

      {/* ── Main Grid: Composer + AI Live Analysis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: Report Composer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Quick Presets */}
          <div className="panel overflow-hidden">
            <div className="panel-header flex items-center justify-between">
              <span className="label-caps text-ink-primary font-bold">Quick Test Scenarios</span>
              <span className="code-badge text-ink-tertiary">DEMO PRESETS</span>
            </div>
            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p, i) => (
                <button key={i} onClick={() => handleApplyPreset(p)}
                  className="text-left p-2.5 rounded-md border border-stroke hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="material-symbols-outlined text-[14px] text-secondary">bolt</span>
                    <span className="code-badge text-ink-primary font-semibold">{p.title}</span>
                  </div>
                  <p className="text-ink-tertiary text-[12px] leading-4 line-clamp-2">{p.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Report Form */}
          <form onSubmit={handleInitiateSubmit} className="panel overflow-hidden">
            <div className="panel-header flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">edit_note</span>
              <span className="label-caps text-ink-primary font-bold">Compose Report</span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              {/* Description */}
              <div>
                <label className="label-caps block mb-1.5">Describe the Issue</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="e.g. 'The AC is leaking water near the electrical socket in Room 302...'"
                  className="w-full px-3 py-2.5 rounded-md border border-stroke bg-surface text-ink-primary text-[13px] leading-5 resize-none focus:border-ink-primary focus:outline-none transition-colors"
                />
              </div>

              {/* Location + Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label-caps block mb-1.5">
                    <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">location_on</span>
                    Location
                  </label>
                  <select value={selectedLocationId} onChange={e => setSelectedLocationId(e.target.value)}
                    className="input-field w-full">
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.room} — {loc.building}, {loc.floor}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-caps block mb-1.5">
                    <span className="material-symbols-outlined text-[13px] align-middle mr-0.5">photo_camera</span>
                    Evidence Photo
                  </label>
                  <select value={selectedImageKey || ''} onChange={e => setSelectedImageKey(e.target.value || null)}
                    className="input-field w-full">
                    <option value="">No photo selected</option>
                    {Object.keys(DEMO_EVIDENCE_IMAGES).map(k => (
                      <option key={k} value={k}>{k.replace(/([A-Z])/g, ' $1').trim()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Preview */}
              {selectedImageKey && DEMO_EVIDENCE_IMAGES[selectedImageKey as keyof typeof DEMO_EVIDENCE_IMAGES] && (
                <div className="relative w-full h-36 bg-surface-container rounded-md overflow-hidden border border-stroke">
                  <img src={DEMO_EVIDENCE_IMAGES[selectedImageKey as keyof typeof DEMO_EVIDENCE_IMAGES]} alt="Evidence" className="w-full h-full object-cover" />
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-primary-container/80 text-on-primary code-badge rounded text-[10px]">
                    EVIDENCE ATTACHED
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2 border-t border-stroke">
                <span className="code-badge text-ink-tertiary">
                  {description.trim().length > 10 ? `${description.trim().split(/\s+/).length} words · AI analyzing...` : 'Start typing to activate AI'}
                </span>
                <button type="submit" disabled={description.trim().length < 10 || isSubmitting}
                  className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Processing...</>
                  ) : (
                    <><span className="material-symbols-outlined text-[16px]">send</span> Submit Report</>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Success Feedback */}
          {submittedSuccess && (
            <div className="panel overflow-hidden animate-rise">
              <div className="h-1 bg-resolved w-full" />
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-[20px] text-resolved">check_circle</span>
                  <span className="headline-sm text-ink-primary">Report Submitted Successfully</span>
                </div>
                <div className="grid grid-cols-2 gap-3 p-3 bg-surface-container-low rounded-md border border-stroke">
                  <div>
                    <span className="label-caps block">Incident ID</span>
                    <span className="code-base text-ink-primary font-semibold">{submittedSuccess.incidentNumber}</span>
                  </div>
                  <div>
                    <span className="label-caps block">Priority</span>
                    {getPriorityBadge(submittedSuccess.priority)}
                  </div>
                  <div>
                    <span className="label-caps block">Routed To</span>
                    <span className="code-badge text-ink-primary">{submittedSuccess.departmentName}</span>
                  </div>
                  <div>
                    <span className="label-caps block">AI Confidence</span>
                    <span className="code-badge text-secondary font-semibold">{Math.round(submittedSuccess.aiConfidence * 100)}%</span>
                  </div>
                </div>
                <button onClick={() => setSubmittedSuccess(null)} className="btn-secondary mt-3">
                  <span className="material-symbols-outlined text-[14px]">add</span> Submit Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Live AI Analysis Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* AI Live Analysis */}
          <div className="panel overflow-hidden sticky top-20">
            <div className="panel-header flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-secondary">psychology</span>
                <span className="label-caps text-ink-primary font-bold">AI Live Analysis</span>
              </div>
              <span className="code-badge uppercase bg-[#d9e2ff] text-[#004299] px-1 rounded">REAL-TIME</span>
            </div>
            
            {aiDraft ? (
              <div className="p-4 flex flex-col gap-3">
                {/* Classification */}
                <div className="p-3 bg-surface-container-low rounded-md border border-stroke">
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-caps">Classification</span>
                    <span className="code-badge text-secondary font-semibold">{Math.round(aiDraft.aiConfidence * 100)}% MATCH</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="code-badge text-ink-tertiary block">Category</span>
                      <span className="body-strong text-ink-primary">{aiDraft.category}</span>
                    </div>
                    <div>
                      <span className="code-badge text-ink-tertiary block">Subcategory</span>
                      <span className="body-strong text-ink-primary">{aiDraft.subcategory}</span>
                    </div>
                  </div>
                </div>

                {/* Priority Assessment */}
                <div className="p-3 bg-surface-container-low rounded-md border border-stroke">
                  <span className="label-caps block mb-1.5">Priority Assessment</span>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(aiDraft.priority)}
                    <span className="code-base text-ink-primary font-semibold">{aiDraft.priorityScore}/100</span>
                  </div>
                  <div className="w-full bg-stroke h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${aiDraft.priorityScore}%`, background: aiDraft.priority === 'critical' ? '#E5482D' : aiDraft.priority === 'high' ? '#E59B1F' : '#2F6FDE' }} />
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="p-3 bg-surface-container-low rounded-md border border-stroke">
                  <span className="label-caps block mb-2">Score Breakdown</span>
                  <div className="space-y-1.5">
                    {Object.entries(aiDraft.scoreBreakdown).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between code-badge">
                        <span className="text-ink-tertiary capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-ink-primary font-semibold">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Routing */}
                <div className="p-3 rounded-md border flex items-center justify-between" style={{ background: 'rgba(47,111,222,0.05)', borderColor: 'rgba(47,111,222,0.2)' }}>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">alt_route</span>
                    <span className="code-badge text-ink-primary">
                      Routing to <span className="font-bold">{aiDraft.departmentName}</span>
                    </span>
                  </div>
                  <span className="code-badge text-secondary font-bold">CONFIRMED</span>
                </div>

                {/* Safety Risk */}
                {aiDraft.safetyRisk && (
                  <div className="p-3 rounded-md border" style={{ background: 'rgba(229,72,45,0.05)', borderColor: 'rgba(229,72,45,0.2)' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-critical">warning</span>
                      <span className="code-badge text-critical font-bold">SAFETY RISK DETECTED</span>
                    </div>
                    <p className="text-[12px] text-ink-secondary mt-1">{aiDraft.aiSummary}</p>
                  </div>
                )}

                {/* Suggested Actions */}
                {aiDraft.suggestedActions.length > 0 && (
                  <div>
                    <span className="label-caps block mb-1.5">Suggested Actions</span>
                    <div className="space-y-1">
                      {aiDraft.suggestedActions.slice(0, 3).map((action, i) => (
                        <div key={i} className="flex items-start gap-1.5 code-badge text-ink-secondary">
                          <span className="material-symbols-outlined text-[12px] text-secondary mt-0.5">chevron_right</span>
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center justify-center text-center">
                <span className="material-symbols-outlined text-[32px] text-ink-tertiary/40 mb-2">psychology</span>
                <span className="headline-sm text-ink-tertiary">Waiting for Input</span>
                <p className="code-badge text-ink-tertiary mt-1">Start describing an issue to activate real-time AI classification</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── My Reports Table ── */}
      <div className="panel overflow-hidden">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="label-caps text-ink-primary font-bold">My Reports</span>
            <span className="code-badge px-1.5 py-0.5 rounded bg-primary text-on-primary">{myReports.length} Tracked</span>
          </div>
          <span className="code-badge text-ink-tertiary">STUDENT PORTFOLIO</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-9 border-b border-stroke bg-surface text-ink-secondary table-header">
                <th className="px-3 w-24">ID</th>
                <th className="px-3">Incident & Location</th>
                <th className="px-3 w-28">Priority</th>
                <th className="px-3 w-24">Status</th>
                <th className="px-3 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke text-[13px]">
              {myReports.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-8 text-center text-ink-tertiary code-badge">No reports filed yet. Submit your first report above.</td></tr>
              ) : (
                myReports.slice(0, 10).map(inc => (
                  <tr key={inc.id} className="group cursor-pointer hover:bg-surface-container/50 transition-colors"
                    onClick={() => setSelectedIncidentForDetail(inc)}>
                    <td className="px-3 py-2 code-base font-semibold text-ink-primary">{inc.incidentNumber}</td>
                    <td className="px-3 py-2">
                      <span className="body-strong text-ink-primary truncate block max-w-[300px]">{inc.title}</span>
                      <div className="flex items-center gap-1 mt-0.5 code-badge text-ink-tertiary">
                        <span className="material-symbols-outlined text-[13px]">location_on</span>
                        {inc.room} • {inc.building}
                      </div>
                    </td>
                    <td className="px-3 py-2">{getPriorityBadge(inc.priority)}</td>
                    <td className="px-3 py-2">{getStatusBadge(inc.status)}</td>
                    <td className="px-3 py-2 text-right" onClick={e => e.stopPropagation()}>
                      {inc.status === 'RESOLVED' ? (
                        <button onClick={() => setVerifyingIncident(inc)} className="btn-secondary text-[11px] h-7 px-2" style={{ color: '#1F8A5B', borderColor: '#1F8A5B' }}>
                          Verify
                        </button>
                      ) : (
                        <button onClick={() => setSelectedIncidentForDetail(inc)} className="text-ink-tertiary hover:text-ink-primary p-1 rounded">
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Duplicate Warning Modal ── */}
      {duplicateWarning && (
        <div className="fixed inset-0 bg-ink-primary/30 z-50 flex items-center justify-center p-4" onClick={() => setDuplicateWarning(null)}>
          <div className="bg-surface border border-stroke rounded-[14px] w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 4px 12px rgba(20,19,15,0.06)' }}>
            <div className="p-4 border-b border-stroke flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-high">call_merge</span>
                <span className="headline-sm text-ink-primary">Duplicate Detected</span>
              </div>
              <button onClick={() => setDuplicateWarning(null)} className="text-ink-tertiary hover:text-ink-primary p-1 rounded">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-surface-container-low rounded-md border border-stroke">
                <span className="code-badge text-high font-semibold block mb-1">
                  {Math.round(duplicateWarning.similarity * 100)}% Similarity Match
                </span>
                <span className="headline-sm text-ink-primary block">{duplicateWarning.incident.title}</span>
                <span className="code-badge text-ink-tertiary mt-1 block">{duplicateWarning.incident.incidentNumber} • {duplicateWarning.incident.room}</span>
                <p className="text-ink-secondary text-[12px] mt-1">{duplicateWarning.reason}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-stroke">
                <button onClick={() => executeJoinDuplicate(duplicateWarning.incident.id)}
                  className="btn-primary flex-1 justify-center" style={{ background: '#2F6FDE' }}>
                  <span className="material-symbols-outlined text-[14px]">call_merge</span> Join Existing Report
                </button>
                <button onClick={() => executeCreateIncident()} className="btn-secondary flex-1 justify-center">
                  <span className="material-symbols-outlined text-[14px]">add</span> Submit as New
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Verification Modal ── */}
      {verifyingIncident && (
        <div className="fixed inset-0 bg-ink-primary/30 z-50 flex items-center justify-center p-4" onClick={() => { setVerifyingIncident(null); setShowReopenInput(false); }}>
          <div className="bg-surface border border-stroke rounded-[14px] w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}
            style={{ boxShadow: '0 4px 12px rgba(20,19,15,0.06)' }}>
            <div className="p-4 border-b border-stroke">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-resolved">verified</span>
                  <span className="headline-sm text-ink-primary">Verify Resolution</span>
                </div>
                <button onClick={() => { setVerifyingIncident(null); setShowReopenInput(false); }} className="text-ink-tertiary hover:text-ink-primary p-1 rounded">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
              <span className="code-badge text-ink-tertiary mt-1 block">{verifyingIncident.incidentNumber} • {verifyingIncident.title}</span>
            </div>
            <div className="p-4 space-y-4">
              {/* Resolution Evidence */}
              {verifyingIncident.resolutionDetails && (
                <div className="p-3 bg-surface-container-low rounded-md border border-stroke">
                  <span className="label-caps block mb-1.5">Staff Resolution Notes</span>
                  <p className="text-ink-secondary text-[13px]">{verifyingIncident.resolutionDetails.notes}</p>
                  <div className="flex items-center gap-2 mt-2 code-badge text-ink-tertiary">
                    <span>Resolved by {verifyingIncident.resolutionDetails.resolvedBy}</span>
                    <span>• AI Score: {Math.round((verifyingIncident.resolutionDetails.aiVerificationScore || 0) * 100)}%</span>
                  </div>
                </div>
              )}

              <p className="text-ink-secondary text-[13px]">
                Has this issue been fully resolved? Your feedback directly closes or reopens this incident.
              </p>

              {showReopenInput && (
                <div>
                  <label className="label-caps block mb-1">What&apos;s still broken?</label>
                  <textarea value={reopenComment} onChange={e => setReopenComment(e.target.value)} rows={2}
                    className="w-full px-3 py-2 rounded-md border border-stroke bg-surface text-ink-primary text-[13px] resize-none focus:border-critical focus:outline-none"
                    placeholder="Describe what still needs fixing..." />
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-stroke">
                <button onClick={() => handleStudentConfirm(verifyingIncident.id, true)}
                  className="btn-primary flex-1 justify-center" style={{ background: '#1F8A5B' }}>
                  <span className="material-symbols-outlined text-[16px]">thumb_up</span> Yes, It&apos;s Fixed!
                </button>
                {!showReopenInput ? (
                  <button onClick={() => setShowReopenInput(true)} className="btn-destructive flex-1 justify-center">
                    <span className="material-symbols-outlined text-[16px]">thumb_down</span> Still Broken
                  </button>
                ) : (
                  <button onClick={() => handleStudentConfirm(verifyingIncident.id, false)}
                    className="btn-destructive flex-1 justify-center" disabled={!reopenComment.trim()}>
                    <span className="material-symbols-outlined text-[16px]">priority_high</span> Reopen & Escalate
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
