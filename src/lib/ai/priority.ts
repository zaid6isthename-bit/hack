import type { Priority } from "../types";

export type Weights = {
  weightSeverity: number;
  weightSafety: number;
  weightAffected: number;
  weightLocation: number;
  weightDuplicates: number;
};

export const DEFAULT_WEIGHTS: Weights = {
  weightSeverity: 40,
  weightSafety: 25,
  weightAffected: 15,
  weightLocation: 10,
  weightDuplicates: 10,
};

export function safetyLevel(risk: string): number {
  const r = risk.toLowerCase();
  if (r.includes("fire") || r.includes("electrical")) return 5;
  if (r.includes("structural")) return 4;
  if (r.includes("slip") || r.includes("water") || r.includes("health")) return 3;
  if (r.includes("security")) return 3;
  return 0;
}

export function scorePriority(input: {
  severity: number;
  risk: string;
  affectedUsers: number;
  locationCriticality: number;
  duplicateCount: number;
  weights?: Weights;
}): { score: number; priority: Priority } {
  const w = input.weights ?? DEFAULT_WEIGHTS;
  const total = w.weightSeverity + w.weightSafety + w.weightAffected + w.weightLocation + w.weightDuplicates;

  const severity = (Math.min(Math.max(input.severity, 1), 5) / 5) * w.weightSeverity;
  const safety = (safetyLevel(input.risk) / 5) * w.weightSafety;
  const affected = Math.min(input.affectedUsers / 100, 1) * w.weightAffected;
  const location = (Math.min(Math.max(input.locationCriticality, 1), 5) / 5) * w.weightLocation;
  const duplicates = Math.min(input.duplicateCount / 10, 1) * w.weightDuplicates;

  const score = Math.round(((severity + safety + affected + location + duplicates) / total) * 100);
  return { score, priority: priorityFromScore(score) };
}

export function priorityFromScore(score: number): Priority {
  if (score >= 76) return "Critical";
  if (score >= 51) return "High";
  if (score >= 26) return "Medium";
  return "Low";
}
