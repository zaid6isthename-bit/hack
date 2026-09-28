export type UserRole = 'student' | 'faculty' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId?: string;
  avatar: string;
  roleTitle: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  slaHours: number;
  icon: string;
  leadName: string;
  contactPhone: string;
  color: string;
  staffCount?: number;
}

export type CampusBuilding = 'Block A' | 'Block B' | 'Block C' | 'Block D';

export interface CampusLocation {
  id: string;
  building: CampusBuilding;
  floor: 1 | 2 | 3;
  room: string;
  type: 'classroom' | 'lab' | 'office' | 'hall' | 'common' | 'facility';
  criticality: 1 | 2 | 3 | 4 | 5; // 1 = low footfall, 5 = high-risk / core server / crowded lecture hall
  x: number; // percentage coordinate 0-100 on visual map
  y: number; // percentage coordinate 0-100 on visual map
}

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface PriorityScoreBreakdown {
  severity: number; // 1-5 (weight: 40)
  safetyRisk: number; // 0-5 (weight: 25)
  affectedUsers: number; // raw count mapped to weight 15
  locationCriticality: number; // 1-5 (weight: 10)
  duplicateCount: number; // raw count mapped to weight 10
  totalScore: number; // 0-100
  formulaDescription: string;
}

export type IncidentStatus = 
  | 'REPORTED'
  | 'AI_TRIAGED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'VERIFIED'
  | 'CLOSED'
  | 'REOPENED'
  | 'ESCALATED';

export interface ReportSubmission {
  id: string;
  reportNumber: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  incidentId?: string;
  description: string;
  imageUrl?: string;
  locationId: string;
  locationName: string;
  aiSummary: string;
  aiCategory: string;
  aiSeverity: string;
  aiConfidence: number;
  createdAt: string;
}

export interface IncidentHistoryItem {
  id: string;
  incidentId: string;
  action: string;
  performedBy: string;
  performedByRole: UserRole;
  timestamp: string;
  notes?: string;
  oldStatus?: IncidentStatus;
  newStatus?: IncidentStatus;
}

export interface ResolutionDetails {
  resolvedBy: string;
  resolvedAt: string;
  notes: string;
  beforeImageUrl?: string;
  afterImageUrl: string;
  aiVerificationScore: number;
  aiVerificationVerdict: 'VERIFIED' | 'UNCERTAIN' | 'INCOMPLETE';
  aiVerificationReason: string;
  studentFeedback?: {
    confirmed: boolean;
    comment?: string;
    respondedAt: string;
  };
}

export interface Incident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  priority: PriorityLevel;
  priorityScore: number;
  scoreBreakdown: PriorityScoreBreakdown;
  severity: number; // 1-5
  safetyRisk: number; // 0-5
  status: IncidentStatus;
  departmentId: string;
  departmentName: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  locationId: string;
  building: CampusBuilding;
  floor: 1 | 2 | 3;
  room: string;
  duplicateCount: number;
  supportingReports: ReportSubmission[];
  slaHours: number;
  slaDeadline: string; // ISO string
  isSlaBreached: boolean;
  aiSuggestedActions: string[];
  aiConfidence: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  resolutionDetails?: ResolutionDetails;
  history: IncidentHistoryItem[];
  recurringDetected?: boolean;
}

export interface RecurringIssuePattern {
  id: string;
  locationName: string;
  category: string;
  equipment: string;
  incidentCount: number;
  timeframeDays: number;
  dates: string[];
  severity: 'warning' | 'critical';
  aiInsight: string;
  recommendedPermanentAction: string;
  estimatedCostSavings: string;
  title?: string;
  occurrenceCount?: number;
  recommendation?: string;
}

export interface CampusHealthMetrics {
  overallScore: number; // 0-100
  backlogScore: number; // 0-100
  criticalScore: number; // 0-100
  slaScore: number; // 0-100
  resolutionRateScore: number; // 0-100
  totalIncidents: number;
  activeIncidents: number;
  criticalIncidents: number;
  slaBreachedIncidents: number;
  resolvedTodayCount: number;
  avgResolutionHours: number;
  duplicateReductionPercentage: number;
}
