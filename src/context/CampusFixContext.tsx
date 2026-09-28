'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  UserRole, 
  Incident, 
  Department, 
  CampusLocation, 
  RecurringIssuePattern,
  CampusHealthMetrics,
  PriorityLevel,
  IncidentStatus,
  ReportSubmission
} from '@/types/campusfix';
import { 
  DEMO_USERS, 
  DEMO_DEPARTMENTS, 
  DEMO_LOCATIONS, 
  DEMO_RECURRING_PATTERNS, 
  getInitialIncidents 
} from '@/lib/seed-data';
import { 
  analyzeCampusReport, 
  checkDuplicateReport, 
  verifyResolutionWithAI,
  AIAnalysisResult,
  DuplicateDetectionResult
} from '@/lib/ai-engine';

interface CampusFixContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  incidents: Incident[];
  departments: Department[];
  locations: CampusLocation[];
  recurringPatterns: RecurringIssuePattern[];
  healthMetrics: CampusHealthMetrics;
  
  // Incident Lifecycle Actions
  analyzeDraftReport: (text: string, locationId: string, hasImage?: boolean) => AIAnalysisResult;
  checkDraftDuplicates: (text: string, locationId: string) => DuplicateDetectionResult;
  submitReportAsNewIncident: (
    description: string, 
    locationId: string, 
    imageUrl?: string
  ) => Incident;
  attachReportToExistingIncident: (
    incidentId: string, 
    description: string, 
    locationId: string, 
    imageUrl?: string
  ) => void;
  updateStatus: (incidentId: string, newStatus: IncidentStatus, notes?: string) => void;
  submitResolution: (incidentId: string, notes: string, afterImageUrl: string) => void;
  confirmStudentVerification: (incidentId: string, isFixed: boolean, comment?: string) => void;
  mergeIncidents: (targetIncidentId: string, sourceIncidentIds: string[]) => void;
  reassignDepartment: (incidentId: string, newDepartmentId: string) => void;
  overridePriority: (incidentId: string, newPriority: PriorityLevel) => void;
  resetDemoCampus: () => void;
  
  // Guided Walkthrough
  isWalkthroughActive: boolean;
  walkthroughStep: number;
  startWalkthrough: () => void;
  nextWalkthroughStep: () => void;
  prevWalkthroughStep: () => void;
  exitWalkthrough: () => void;
  selectedIncidentForDetail: Incident | null;
  setSelectedIncidentForDetail: (inc: Incident | null) => void;
}

const CampusFixContext = createContext<CampusFixContextType | undefined>(undefined);

const STORAGE_KEY_INCIDENTS = 'campusfix_incidents_v2';
const STORAGE_KEY_USER_ROLE = 'campusfix_role_v2';

export const CampusFixProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]); // default Alex Rivera (student)
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedIncidentForDetail, setSelectedIncidentForDetail] = useState<Incident | null>(null);

  // Walkthrough State
  const [isWalkthroughActive, setIsWalkthroughActive] = useState(false);
  const [walkthroughStep, setWalkthroughStep] = useState(1);

  // Initialize from localStorage or Seed Data
  useEffect(() => {
    try {
      const savedIncidents = localStorage.getItem(STORAGE_KEY_INCIDENTS);
      const savedRole = localStorage.getItem(STORAGE_KEY_USER_ROLE);

      if (savedIncidents) {
        setIncidents(JSON.parse(savedIncidents));
      } else {
        const initial = getInitialIncidents();
        setIncidents(initial);
        localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(initial));
      }

      if (savedRole) {
        const found = DEMO_USERS.find(u => u.role === savedRole);
        if (found) setCurrentUser(found);
      }
    } catch {
      setIncidents(getInitialIncidents());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync incidents to localStorage
  useEffect(() => {
    if (isLoaded && incidents.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(incidents));
      } catch (err) {
        console.warn('LocalStorage save failed:', err);
      }
    }
  }, [incidents, isLoaded]);

  // Switch Role
  const switchRole = (role: UserRole) => {
    const user = DEMO_USERS.find(u => u.role === role) || DEMO_USERS[0];
    setCurrentUser(user);
    try {
      localStorage.setItem(STORAGE_KEY_USER_ROLE, role);
    } catch {
      // ignore
    }
  };

  // Reset Demo Campus
  const resetDemoCampus = () => {
    const fresh = getInitialIncidents();
    setIncidents(fresh);
    try {
      localStorage.setItem(STORAGE_KEY_INCIDENTS, JSON.stringify(fresh));
    } catch {
      // ignore
    }
    setSelectedIncidentForDetail(null);
  };

  // AI draft analysis
  const analyzeDraftReport = (text: string, locationId: string, hasImage: boolean = false): AIAnalysisResult => {
    const loc = DEMO_LOCATIONS.find(l => l.id === locationId) || DEMO_LOCATIONS[0];
    return analyzeCampusReport(text, loc, hasImage);
  };

  // Duplicate draft check
  const checkDraftDuplicates = (text: string, locationId: string): DuplicateDetectionResult => {
    const loc = DEMO_LOCATIONS.find(l => l.id === locationId) || DEMO_LOCATIONS[0];
    return checkDuplicateReport(text, loc.id, loc.room, incidents);
  };

  // Submit as New Incident
  const submitReportAsNewIncident = (
    description: string, 
    locationId: string, 
    imageUrl?: string
  ): Incident => {
    const loc = DEMO_LOCATIONS.find(l => l.id === locationId) || DEMO_LOCATIONS[0];
    const ai = analyzeCampusReport(description, loc, !!imageUrl);
    const now = new Date();
    const incidentNum = `INC-${1050 + Math.floor(Math.random() * 800)}`;
    const reportNum = `REP-${1000 + Math.floor(Math.random() * 9000)}`;

    const initialReport: ReportSubmission = {
      id: `rep-${Date.now()}`,
      reportNumber: reportNum,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      description,
      imageUrl,
      locationId: loc.id,
      locationName: `${loc.room} (${loc.building})`,
      aiSummary: ai.aiSummary,
      aiCategory: ai.category,
      aiSeverity: ai.priority,
      aiConfidence: ai.aiConfidence,
      createdAt: now.toISOString()
    };

    const slaHours = ai.priority === 'critical' ? 2 : (ai.priority === 'high' ? 4 : 8);
    const deadline = new Date(now.getTime() + slaHours * 3600000).toISOString();

    const newIncident: Incident = {
      id: `inc-${Date.now()}`,
      incidentNumber: incidentNum,
      title: `${ai.subcategory} in ${loc.room}`,
      description,
      category: ai.category,
      subcategory: ai.subcategory,
      priority: ai.priority,
      priorityScore: ai.priorityScore,
      scoreBreakdown: ai.scoreBreakdown,
      severity: ai.severity,
      safetyRisk: ai.safetyRisk,
      status: 'AI_TRIAGED',
      departmentId: ai.departmentId,
      departmentName: ai.departmentName,
      locationId: loc.id,
      building: loc.building,
      floor: loc.floor,
      room: loc.room,
      duplicateCount: 1,
      supportingReports: [initialReport],
      slaHours,
      slaDeadline: deadline,
      isSlaBreached: false,
      aiSuggestedActions: ai.suggestedActions,
      aiConfidence: ai.aiConfidence,
      imageUrl,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      history: [
        {
          id: `hist-${Date.now()}-1`,
          incidentId: incidentNum,
          action: 'Report Submitted',
          performedBy: currentUser.name,
          performedByRole: currentUser.role,
          timestamp: now.toISOString(),
          notes: `Initial submission by ${currentUser.name}`
        },
        {
          id: `hist-${Date.now()}-2`,
          incidentId: incidentNum,
          action: 'AI Triaged & Auto-Routed',
          performedBy: 'CampusFix AI',
          performedByRole: 'admin',
          timestamp: now.toISOString(),
          notes: `Priority: ${ai.priority.toUpperCase()} (${ai.priorityScore}/100) -> Routed to ${ai.departmentName}`
        }
      ]
    };

    setIncidents(prev => [newIncident, ...prev]);
    return newIncident;
  };

  // Attach Report to Existing Incident (Duplicate Resolution)
  const attachReportToExistingIncident = (
    incidentId: string, 
    description: string, 
    locationId: string, 
    imageUrl?: string
  ) => {
    const loc = DEMO_LOCATIONS.find(l => l.id === locationId) || DEMO_LOCATIONS[0];
    const reportNum = `REP-${1000 + Math.floor(Math.random() * 9000)}`;
    const now = new Date().toISOString();

    const supportingReport: ReportSubmission = {
      id: `rep-${Date.now()}`,
      reportNumber: reportNum,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      incidentId,
      description,
      imageUrl,
      locationId: loc.id,
      locationName: `${loc.room} (${loc.building})`,
      aiSummary: 'Corroborating report merged via Duplicate Detection Engine.',
      aiCategory: 'Facilities',
      aiSeverity: 'High',
      aiConfidence: 0.94,
      createdAt: now
    };

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const newDupCount = inc.duplicateCount + 1;
        const newScore = Math.min(100, inc.priorityScore + 6);
        const newPriority: PriorityLevel = newScore >= 76 ? 'critical' : (newScore >= 51 ? 'high' : inc.priority);

        return {
          ...inc,
          duplicateCount: newDupCount,
          priorityScore: newScore,
          priority: newPriority,
          supportingReports: [supportingReport, ...inc.supportingReports],
          updatedAt: now,
          history: [
            {
              id: `hist-dup-${Date.now()}`,
              incidentId: inc.id,
              action: 'Duplicate Report Merged',
              performedBy: `${currentUser.name} (AI Duplicate Engine)`,
              performedByRole: currentUser.role,
              timestamp: now,
              notes: `Report #${reportNum} added as supporting evidence. Priority escalated to ${newPriority.toUpperCase()} (${newScore}/100).`
            },
            ...inc.history
          ]
        };
      }
      return inc;
    }));
  };

  // Update Status
  const updateStatus = (incidentId: string, newStatus: IncidentStatus, notes?: string) => {
    const now = new Date().toISOString();
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const historyItem = {
          id: `hist-status-${Date.now()}`,
          incidentId: inc.id,
          action: `Status Changed to ${newStatus}`,
          performedBy: currentUser.name,
          performedByRole: currentUser.role,
          timestamp: now,
          notes: notes || `Updated by ${currentUser.name} (${currentUser.role})`,
          oldStatus: inc.status,
          newStatus
        };
        return {
          ...inc,
          status: newStatus,
          updatedAt: now,
          history: [historyItem, ...inc.history]
        };
      }
      return inc;
    }));
  };

  // Submit Staff Resolution
  const submitResolution = (incidentId: string, notes: string, afterImageUrl: string) => {
    const target = incidents.find(i => i.id === incidentId);
    if (!target) return;

    const verification = verifyResolutionWithAI(target, notes, !!afterImageUrl);
    const now = new Date().toISOString();

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          status: 'RESOLVED',
          updatedAt: now,
          resolvedAt: now,
          resolutionDetails: {
            resolvedBy: currentUser.name,
            resolvedAt: now,
            notes,
            beforeImageUrl: inc.imageUrl,
            afterImageUrl,
            aiVerificationScore: verification.confidence,
            aiVerificationVerdict: verification.verdict,
            aiVerificationReason: verification.reason
          },
          history: [
            {
              id: `hist-res-${Date.now()}`,
              incidentId: inc.id,
              action: 'Resolution Submitted with Evidence',
              performedBy: currentUser.name,
              performedByRole: currentUser.role,
              timestamp: now,
              notes: `AI Verification: ${verification.verdict} (${Math.round(verification.confidence * 100)}% confidence). ${verification.reason}`,
              oldStatus: inc.status,
              newStatus: 'RESOLVED'
            },
            ...inc.history
          ]
        };
      }
      return inc;
    }));
  };

  // Student Confirmation Loop
  const confirmStudentVerification = (incidentId: string, isFixed: boolean, comment?: string) => {
    const now = new Date().toISOString();
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        if (isFixed) {
          // Closed & Confirmed!
          return {
            ...inc,
            status: 'CLOSED',
            updatedAt: now,
            closedAt: now,
            resolutionDetails: inc.resolutionDetails ? {
              ...inc.resolutionDetails,
              studentFeedback: {
                confirmed: true,
                comment: comment || 'Verified by student - issue completely resolved.',
                respondedAt: now
              }
            } : undefined,
            history: [
              {
                id: `hist-confirm-${Date.now()}`,
                incidentId: inc.id,
                action: 'Student Confirmed Resolution → CLOSED',
                performedBy: currentUser.name,
                performedByRole: currentUser.role,
                timestamp: now,
                notes: `Student confirmed resolution: "${comment || 'Verified fixed'}". Incident officially closed.`,
                oldStatus: 'RESOLVED',
                newStatus: 'CLOSED'
              },
              ...inc.history
            ]
          };
        } else {
          // Reopened & Escalated!
          const escalatedScore = Math.min(100, inc.priorityScore + 15);
          return {
            ...inc,
            status: 'REOPENED',
            priority: 'critical',
            priorityScore: escalatedScore,
            updatedAt: now,
            resolutionDetails: inc.resolutionDetails ? {
              ...inc.resolutionDetails,
              studentFeedback: {
                confirmed: false,
                comment: comment || 'Student reported issue still persists.',
                respondedAt: now
              }
            } : undefined,
            history: [
              {
                id: `hist-reopen-${Date.now()}`,
                incidentId: inc.id,
                action: 'Student Rejected Resolution → REOPENED & ESCALATED',
                performedBy: currentUser.name,
                performedByRole: currentUser.role,
                timestamp: now,
                notes: `Student rejection feedback: "${comment || 'Still broken'}". Priority elevated to CRITICAL. Escalated to Department Head.`,
                oldStatus: 'RESOLVED',
                newStatus: 'REOPENED'
              },
              ...inc.history
            ]
          };
        }
      }
      return inc;
    }));
  };

  // Merge Incidents Workbench
  const mergeIncidents = (targetIncidentId: string, sourceIncidentIds: string[]) => {
    const now = new Date().toISOString();
    const sourceIncidents = incidents.filter(i => sourceIncidentIds.includes(i.id));
    if (sourceIncidents.length === 0) return;

    // Collect all supporting reports from sources
    const aggregatedReports: ReportSubmission[] = [];
    sourceIncidents.forEach(s => {
      aggregatedReports.push(...s.supportingReports);
      // Also add the source itself as a report
      aggregatedReports.push({
        id: `rep-merged-${s.id}`,
        reportNumber: `REP-${s.incidentNumber}`,
        userId: 'merged-user',
        userName: `Report from ${s.room}`,
        userRole: 'student',
        incidentId: targetIncidentId,
        description: s.description,
        imageUrl: s.imageUrl,
        locationId: s.locationId,
        locationName: `${s.room} (${s.building})`,
        aiSummary: s.title,
        aiCategory: s.category,
        aiSeverity: s.priority,
        aiConfidence: s.aiConfidence,
        createdAt: s.createdAt
      });
    });

    setIncidents(prev => {
      // Remove sources, update target
      return prev
        .filter(i => !sourceIncidentIds.includes(i.id))
        .map(inc => {
          if (inc.id === targetIncidentId) {
            const newCount = inc.duplicateCount + sourceIncidents.length;
            const newScore = Math.min(100, inc.priorityScore + (sourceIncidents.length * 5));
            return {
              ...inc,
              duplicateCount: newCount,
              priorityScore: newScore,
              supportingReports: [...aggregatedReports, ...inc.supportingReports],
              updatedAt: now,
              history: [
                {
                  id: `hist-merge-${Date.now()}`,
                  incidentId: inc.id,
                  action: `Consolidated ${sourceIncidents.length} Duplicate Incident(s)`,
                  performedBy: currentUser.name,
                  performedByRole: currentUser.role,
                  timestamp: now,
                  notes: `Merged incidents [${sourceIncidents.map(s => s.incidentNumber).join(', ')}] into ${inc.incidentNumber}. Full historical evidence preserved.`
                },
                ...inc.history
              ]
            };
          }
          return inc;
        });
    });
  };

  // Reassign Department
  const reassignDepartment = (incidentId: string, newDepartmentId: string) => {
    const dept = DEMO_DEPARTMENTS.find(d => d.id === newDepartmentId);
    if (!dept) return;
    const now = new Date().toISOString();

    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        return {
          ...inc,
          departmentId: dept.id,
          departmentName: dept.name,
          updatedAt: now,
          history: [
            {
              id: `hist-reassign-${Date.now()}`,
              incidentId: inc.id,
              action: `Reassigned to ${dept.name}`,
              performedBy: currentUser.name,
              performedByRole: currentUser.role,
              timestamp: now,
              notes: `Routing revised by ${currentUser.name}`
            },
            ...inc.history
          ]
        };
      }
      return inc;
    }));
  };

  // Override Priority
  const overridePriority = (incidentId: string, newPriority: PriorityLevel) => {
    const now = new Date().toISOString();
    setIncidents(prev => prev.map(inc => {
      if (inc.id === incidentId) {
        const score = newPriority === 'critical' ? 90 : (newPriority === 'high' ? 65 : (newPriority === 'medium' ? 40 : 15));
        return {
          ...inc,
          priority: newPriority,
          priorityScore: score,
          updatedAt: now,
          history: [
            {
              id: `hist-prio-${Date.now()}`,
              incidentId: inc.id,
              action: `Priority Overridden to ${newPriority.toUpperCase()}`,
              performedBy: currentUser.name,
              performedByRole: currentUser.role,
              timestamp: now,
              notes: `Manual priority adjustment to ${score}/100`
            },
            ...inc.history
          ]
        };
      }
      return inc;
    }));
  };

  // Health Metrics computation
  const totalIncidents = incidents.length;
  const activeIncidents = incidents.filter(i => i.status !== 'CLOSED' && i.status !== 'VERIFIED').length;
  const criticalIncidents = incidents.filter(i => i.priority === 'critical' && i.status !== 'CLOSED').length;
  const slaBreachedIncidents = incidents.filter(i => i.isSlaBreached && i.status !== 'CLOSED').length;
  const resolvedIncidents = incidents.filter(i => i.status === 'RESOLVED' || i.status === 'CLOSED' || i.status === 'VERIFIED').length;
  const resolvedTodayCount = incidents.filter(i => i.resolvedAt).length;

  const resolutionRate = totalIncidents > 0 ? (resolvedIncidents / totalIncidents) : 0.8;
  const backlogScore = Math.max(0, 100 - (activeIncidents * 1.5));
  const criticalScore = Math.max(0, 100 - (criticalIncidents * 8));
  const slaScore = Math.max(0, 100 - (slaBreachedIncidents * 12));
  const resolutionRateScore = Math.round(resolutionRate * 100);

  // Overall Campus Health Formula from PRD:
  // 40% issue backlog + 20% critical incidents + 20% SLA performance + 20% resolution rate
  const overallHealth = Math.round(
    (backlogScore * 0.40) +
    (criticalScore * 0.20) +
    (slaScore * 0.20) +
    (resolutionRateScore * 0.20)
  );

  const healthMetrics: CampusHealthMetrics = {
    overallScore: Math.min(98, Math.max(45, overallHealth)),
    backlogScore: Math.round(backlogScore),
    criticalScore: Math.round(criticalScore),
    slaScore: Math.round(slaScore),
    resolutionRateScore,
    totalIncidents,
    activeIncidents,
    criticalIncidents,
    slaBreachedIncidents,
    resolvedTodayCount,
    avgResolutionHours: 2.4,
    duplicateReductionPercentage: 38
  };

  // Walkthrough Controller
  const startWalkthrough = () => {
    setIsWalkthroughActive(true);
    setWalkthroughStep(1);
  };

  const nextWalkthroughStep = () => {
    setWalkthroughStep(prev => Math.min(6, prev + 1));
  };

  const prevWalkthroughStep = () => {
    setWalkthroughStep(prev => Math.max(1, prev - 1));
  };

  const exitWalkthrough = () => {
    setIsWalkthroughActive(false);
    setWalkthroughStep(1);
  };

  return (
    <CampusFixContext.Provider
      value={{
        currentUser,
        switchRole,
        incidents,
        departments: DEMO_DEPARTMENTS,
        locations: DEMO_LOCATIONS,
        recurringPatterns: DEMO_RECURRING_PATTERNS,
        healthMetrics,
        analyzeDraftReport,
        checkDraftDuplicates,
        submitReportAsNewIncident,
        attachReportToExistingIncident,
        updateStatus,
        submitResolution,
        confirmStudentVerification,
        mergeIncidents,
        reassignDepartment,
        overridePriority,
        resetDemoCampus,
        isWalkthroughActive,
        walkthroughStep,
        startWalkthrough,
        nextWalkthroughStep,
        prevWalkthroughStep,
        exitWalkthrough,
        selectedIncidentForDetail,
        setSelectedIncidentForDetail
      }}
    >
      {children}
    </CampusFixContext.Provider>
  );
};

export const useCampusFix = () => {
  const context = useContext(CampusFixContext);
  if (!context) {
    throw new Error('useCampusFix must be used within a CampusFixProvider');
  }
  return context;
};
