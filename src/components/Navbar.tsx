'use client';

import React from 'react';
import { useCampusFix } from '@/context/CampusFixContext';
import type { UserRole } from '@/types/campusfix';

interface NavbarProps {
  onOpenCopilot: () => void;
}

export function Navbar({ onOpenCopilot }: NavbarProps) {
  const { currentUser, switchRole, healthMetrics, startWalkthrough, incidents } = useCampusFix();

  const roles: { key: UserRole; label: string }[] = [
    { key: 'admin', label: 'Admin' },
    { key: 'staff', label: 'Staff' },
    { key: 'student', label: 'Student' },
    { key: 'faculty', label: 'Faculty' },
  ];

  const activeCount = incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'VERIFIED').length;
  const criticalCount = incidents.filter(i => i.priority === 'critical' && i.status !== 'CLOSED').length;

  return (
    <header className="sticky top-0 z-40 h-14 bg-surface/90 backdrop-blur-xl border-b border-stroke flex items-center justify-between px-4 lg:px-6"
      style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
      
      {/* Left: Logo + Breadcrumb + Search */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center">
            <span className="text-on-primary font-mono text-xs font-bold" style={{ fontFamily: 'var(--font-mono)' }}>CF</span>
          </div>
          <div className="flex flex-col">
            <span className="headline-sm uppercase tracking-tight text-ink-primary">CampusFix</span>
            <span className="code-badge uppercase text-ink-tertiary tracking-wider">Ops Command</span>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="hidden md:flex items-center gap-1.5 code-badge text-ink-tertiary">
          <span className="text-ink-primary font-semibold">DISPATCH</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="uppercase">{currentUser.role === 'admin' ? 'Command Center' : currentUser.role === 'staff' ? 'Field Ops' : currentUser.role === 'student' ? 'Report Portal' : 'Faculty View'}</span>
        </div>

        {/* Command Search */}
        <button
          onClick={onOpenCopilot}
          className="hidden md:flex items-center gap-2 h-8 px-3 bg-surface border border-stroke rounded-md text-ink-tertiary hover:text-ink-primary transition-colors"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
        >
          <span className="material-symbols-outlined text-[16px]">search</span>
          <span className="text-[13px]">Command Search...</span>
          <span className="code-badge px-1 bg-surface-container rounded text-ink-primary">⌘K</span>
        </button>
      </div>

      {/* Right: Health Score + Role Switcher + Actions */}
      <div className="flex items-center gap-3">
        {/* Campus Health Indicator */}
        <div className="hidden lg:flex items-center gap-2 h-8 px-3 bg-surface border border-stroke rounded-md"
          style={{ boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}>
          <span className="label-caps">Campus Health</span>
          <span className="code-badge font-semibold text-secondary">{healthMetrics.overallScore}/100</span>
          <svg className="w-10 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 40 16">
            <polyline points="0,12 8,10 16,13 24,5 32,7 40,2" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center bg-surface-container-high rounded-md p-0.5">
          {roles.map(r => (
            <button
              key={r.key}
              onClick={() => switchRole(r.key)}
              className={`px-2 py-1 code-badge transition-colors rounded ${
                currentUser.role === r.key
                  ? 'bg-surface text-ink-primary font-semibold'
                  : 'text-ink-tertiary hover:text-ink-primary'
              }`}
              style={currentUser.role === r.key ? { boxShadow: '0 1px 8px rgba(0,0,0,0.04)' } : {}}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Walkthrough */}
        <button
          onClick={startWalkthrough}
          className="hidden md:flex w-8 h-8 items-center justify-center text-ink-tertiary hover:text-ink-primary hover:bg-surface-container rounded transition-colors"
          title="Guided Walkthrough"
        >
          <span className="material-symbols-outlined text-[18px]">school</span>
        </button>

        {/* Copilot AI */}
        <button
          onClick={onOpenCopilot}
          className="hidden md:flex items-center gap-1 h-8 px-2 text-ink-tertiary hover:text-ink-primary hover:bg-surface-container rounded transition-colors"
          title="AI Copilot"
        >
          <span className="material-symbols-outlined text-[18px]">smart_toy</span>
          <span className="code-badge uppercase bg-[#d9e2ff] text-[#004299] px-1 rounded text-[10px]">AI</span>
        </button>

        {/* Notifications */}
        <button
          className="relative w-8 h-8 flex items-center justify-center text-ink-tertiary hover:text-ink-primary hover:bg-surface-container rounded transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[18px]">notifications</span>
          {criticalCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-critical rounded-full" />
          )}
        </button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
        </div>
      </div>
    </header>
  );
}
