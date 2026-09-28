'use client';

import React, { useState } from 'react';
import { CampusFixProvider, useCampusFix } from '@/context/CampusFixContext';
import { Navbar } from '@/components/Navbar';
import { StudentPortal } from '@/components/StudentPortal';
import { FacultyPortal } from '@/components/FacultyPortal';
import { StaffPortal } from '@/components/StaffPortal';
import { AdminPortal } from '@/components/AdminPortal';
import { IncidentDetailModal } from '@/components/IncidentDetailModal';
import { AiCopilotDrawer } from '@/components/AiCopilotDrawer';
import { WalkthroughGuideModal } from '@/components/WalkthroughGuideModal';

function CampusFixApp() {
  const { currentUser, resetDemoCampus } = useCampusFix();
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-canvas text-ink-primary flex flex-col font-sans selection:bg-surface-elevated">
      <Navbar onOpenCopilot={() => setIsCopilotOpen(true)} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        {currentUser.role === 'student' && <StudentPortal />}
        {currentUser.role === 'faculty' && <FacultyPortal />}
        {currentUser.role === 'staff' && <StaffPortal />}
        {currentUser.role === 'admin' && <AdminPortal />}
      </main>

      <footer className="mt-auto border-t border-stroke bg-surface py-6 px-4 lg:px-6 text-xs text-ink-tertiary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary-container flex items-center justify-center">
              <span className="text-on-primary font-mono text-[10px] font-bold">CF</span>
            </div>
            <span>CampusFix AI — Autonomous Campus Operations & Incident Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={resetDemoCampus}
              className="text-ink-secondary hover:text-ink-primary underline underline-offset-2 transition-colors cursor-pointer"
            >
              Reset Demo Scenario
            </button>
            <span>•</span>
            <span className="code-badge bg-surface-elevated px-2 py-0.5 rounded text-ink-secondary">
              Swiss ATC Editorial · Warm Bone UI
            </span>
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <IncidentDetailModal />
      <AiCopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <WalkthroughGuideModal />
    </div>
  );
}

export default function Page() {
  return (
    <CampusFixProvider>
      <CampusFixApp />
    </CampusFixProvider>
  );
}
