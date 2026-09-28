import { db } from "../db";
import type { DuplicateMatch } from "../types";

const STOP = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "any", "can", "her", "was", "one", "our", "out", "has", "have", "had", "this", "that", "with", "from", "they", "them", "their", "been", "was", "were", "will", "would", "there", "here", "when", "what", "which", "who", "how", "why", "about", "into", "than", "then", "them", "very", "just", "also", "some", "such", "only", "over", "under", "again", "still", "being", "because", "while", "where", "does", "did", "is", "in", "on", "at", "to", "of", "it", "as", "be", "by", "or", "an", "if", "so", "up", "do", "no", "my", "me", "we", "us", "he", "his", "she", "its", "get", "got", "am", "i",
]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function overlap(a: Set<string>, b: Set<string>) {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  const jaccard = shared / (a.size + b.size - shared);
  const containment = shared / Math.min(a.size, b.size);
  return jaccard * 0.45 + containment * 0.55;
}

export async function findDuplicates(input: {
  text: string;
  category: string;
  locationId?: string | null;
  building?: string;
  room?: string;
  excludeIncidentId?: string;
  hasImage?: boolean;
  threshold?: number;
}): Promise<DuplicateMatch[]> {
  const threshold = input.threshold ?? 0.62;
  const candidates = await db.incident.findMany({
    where: {
      status: { notIn: ["CLOSED", "REJECTED", "DUPLICATE"] },
      mergedIntoId: null,
      ...(input.excludeIncidentId ? { id: { not: input.excludeIncidentId } } : {}),
      createdAt: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
    },
    include: { location: true, reports: { select: { id: true } } },
    orderBy: { updatedAt: "desc" },
    take: 250,
  });

  const sourceTokens = new Set(tokenize(input.text));
  const sourceRoom = (input.room || "").toUpperCase();
  const sourceBuilding = (input.building || "").toLowerCase();

  const matches: DuplicateMatch[] = [];

  for (const inc of candidates) {
    const hay = tokenize(`${inc.title} ${inc.description} ${inc.category} ${inc.subcategory}`);
    const target = new Set(hay);
    let sim = overlap(sourceTokens, target);

    const reasons: string[] = [];
    const incRoom = inc.location?.room?.toUpperCase() ?? "";
    const incBuilding = inc.location?.building?.toLowerCase() ?? "";

    if (sourceRoom && incRoom && sourceRoom === incRoom) {
      sim += 0.24;
      reasons.push("same room");
    } else if (sourceBuilding && incBuilding && sourceBuilding === incBuilding) {
      sim += 0.1;
      reasons.push("same building");
    }

    if (inc.category === input.category) {
      sim += 0.14;
      reasons.push("same category");
    }

    const ageDays = (Date.now() - inc.createdAt.getTime()) / 86400000;
    if (ageDays <= 1) {
      sim += 0.06;
      reasons.push("reported recently");
    } else if (ageDays <= 7) {
      sim += 0.03;
    }

    if (input.hasImage) {
      sim += 0.02;
    }

    if (input.text) {
      const incText = `${inc.title} ${inc.description}`.toLowerCase();
      const src = input.text.toLowerCase();
      for (const kw of ["projector", "wifi", "leak", "fan", "light", "ac", "washroom", "chair", "door", "window", "printer"]) {
        if (src.includes(kw) && incText.includes(kw)) {
          sim += 0.05;
          reasons.push(`mentions ${kw}`);
          break;
        }
      }
    }

    sim = Math.round(Math.min(sim, 0.99) * 100) / 100;

    if (sim >= threshold) {
      matches.push({
        incidentId: inc.id,
        incidentNumber: inc.incidentNumber,
        title: inc.title,
        similarity: sim,
        reason: reasons.length ? `Matched on ${reasons.slice(0, 3).join(", ")}` : "Semantically similar description",
        status: inc.status,
        createdAt: inc.createdAt.toISOString(),
        reportCount: inc.reports.length,
      });
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);
  return matches.slice(0, 5);
}
