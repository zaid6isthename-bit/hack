'use client';

import React from 'react';
import { useCampusFix } from '@/context/CampusFixContext';

export function WalkthroughGuideModal() {
  const { isWalkthroughActive, walkthroughStep, nextWalkthroughStep, prevWalkthroughStep, exitWalkthrough, switchRole } = useCampusFix();

  if (!isWalkthroughActive) return null;

  const steps = [
    {
      title: 'Welcome to CampusFix AI',
      icon: 'emoji_objects',
      content: 'CampusFix AI transforms campus issue reporting into an intelligent operations platform. This walkthrough will guide you through the core workflows.',
      action: null,
    },
    {
      title: 'Student: Submit a Report',
      icon: 'edit_note',
      content: 'Switch to Student view and describe an issue in natural language. Watch as AI instantly classifies, prioritizes, and routes it. Try clicking a Quick Test Scenario preset.',
      action: () => switchRole('student'),
    },
    {
      title: 'Duplicate Detection',
      icon: 'call_merge',
      content: 'Submit a similar report to see the Duplicate Detection Engine in action. The system will ask if you want to merge your report with an existing incident or file it as new.',
      action: null,
    },
    {
      title: 'Staff: Resolve an Incident',
      icon: 'task_alt',
      content: 'Switch to Staff view. Pick an incident from the queue, start work on it, then submit a resolution with notes and evidence photos. AI will verify the resolution quality.',
      action: () => switchRole('staff'),
    },
    {
      title: 'Admin: Operations Command',
      icon: 'grid_view',
      content: 'Switch to Admin view to see the full Operations Command dashboard: KPI telemetry strip, priority queue, campus site grid, incident consolidation workbench, and operational insights.',
      action: () => switchRole('admin'),
    },
    {
      title: 'Student: Verify Resolution',
      icon: 'verified',
      content: 'Switch back to Student. If any incident has been resolved, you\'ll see a verification banner. Confirm if the issue is truly fixed to close the ticket, or reject to reopen and escalate.',
      action: () => switchRole('student'),
    },
  ];

  const step = steps[walkthroughStep - 1];

  return (
    <>
      <div className="fixed inset-0 bg-ink-primary/40 z-50" onClick={exitWalkthrough} />
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
        <div className="bg-surface border border-stroke rounded-[14px] shadow-xl overflow-hidden"
          style={{ boxShadow: '0 4px 24px rgba(20,19,15,0.12)' }}>

          {/* Step Indicator */}
          <div className="px-4 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-secondary">{step.icon}</span>
              <span className="label-caps text-ink-primary font-bold">Step {walkthroughStep} of {steps.length}</span>
            </div>
            <button onClick={exitWalkthrough} className="text-ink-tertiary hover:text-ink-primary p-1 rounded transition-colors">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-4 mt-2">
            <div className="w-full bg-stroke h-1 rounded-full overflow-hidden">
              <div className="bg-secondary h-full rounded-full transition-all duration-300" style={{ width: `${(walkthroughStep / steps.length) * 100}%` }} />
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="headline-sm text-ink-primary mb-1">{step.title}</h3>
            <p className="text-ink-secondary text-[13px] leading-5">{step.content}</p>
          </div>

          {/* Actions */}
          <div className="px-4 pb-3 flex items-center justify-between">
            <button onClick={prevWalkthroughStep} disabled={walkthroughStep <= 1}
              className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[14px]">arrow_back</span> Back
            </button>
            <div className="flex items-center gap-2">
              {step.action && (
                <button onClick={() => { step.action!(); }}
                  className="btn-secondary" style={{ color: '#2F6FDE', borderColor: '#2F6FDE' }}>
                  <span className="material-symbols-outlined text-[14px]">switch_account</span> Switch View
                </button>
              )}
              {walkthroughStep < steps.length ? (
                <button onClick={nextWalkthroughStep} className="btn-primary">
                  Next <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              ) : (
                <button onClick={exitWalkthrough} className="btn-primary" style={{ background: '#1F8A5B' }}>
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Finish
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
