export const ROLES = ["STUDENT", "FACULTY", "STAFF", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = [
  "REPORTED",
  "AI_TRIAGED",
  "ASSIGNED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "VERIFIED",
  "CLOSED",
  "REJECTED",
  "DUPLICATE",
  "ON_HOLD",
  "ESCALATED",
] as const;
export type Status = (typeof STATUSES)[number];

export const OPEN_STATUSES: Status[] = [
  "REPORTED",
  "AI_TRIAGED",
  "ASSIGNED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "ON_HOLD",
  "ESCALATED",
];

export const CATEGORY_DEPARTMENTS: Record<string, string> = {
  Electrical: "Electrical",
  HVAC: "Facilities",
  Plumbing: "Facilities",
  "IT / Network": "IT Support",
  Cleaning: "Housekeeping",
  Infrastructure: "Maintenance",
  Security: "Security",
  "Lab Equipment": "Laboratory",
  Furniture: "Maintenance",
  Safety: "Security",
  Other: "Administration",
};

export const CATEGORY_COLORS: Record<string, string> = {
  Electrical: "#f59e0b",
  HVAC: "#06b6d4",
  Plumbing: "#3b82f6",
  "IT / Network": "#8b5cf6",
  Cleaning: "#10b981",
  Infrastructure: "#64748b",
  Security: "#ef4444",
  "Lab Equipment": "#14b8a6",
  Furniture: "#a855f7",
  Safety: "#f43f5e",
  Other: "#94a3b8",
};

export const PRIORITY_RANK: Record<Priority, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export const STATUS_LABELS: Record<Status, string> = {
  REPORTED: "Reported",
  AI_TRIAGED: "AI Triaged",
  ASSIGNED: "Assigned",
  ACKNOWLEDGED: "Acknowledged",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  VERIFIED: "Verified",
  CLOSED: "Closed",
  REJECTED: "Rejected",
  DUPLICATE: "Duplicate",
  ON_HOLD: "On Hold",
  ESCALATED: "Escalated",
};

export const STATUS_FLOW: Status[] = [
  "REPORTED",
  "AI_TRIAGED",
  "ASSIGNED",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "VERIFIED",
  "CLOSED",
];

export type AIAnalysis = {
  category: string;
  subcategory: string;
  severity: number;
  severityLabel: "Low" | "Medium" | "High" | "Critical";
  risk: string;
  department: string;
  summary: string;
  title: string;
  confidence: number;
  affectedUsers: number;
  locationHint: {
    building: string;
    floor: string;
    room: string;
    explicit: boolean;
  };
  suggestedAction: string;
  suggestedSteps: string[];
  safetySensitive: boolean;
};

export type DuplicateMatch = {
  incidentId: string;
  incidentNumber: number;
  title: string;
  similarity: number;
  reason: string;
  status: string;
  createdAt: string;
  reportCount: number;
};
