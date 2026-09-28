import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { analyzeReport } from "@/lib/incident";
import { scorePriority } from "@/lib/ai/priority";
import { aiEnabled } from "@/lib/ai/llm";
import { db } from "@/lib/db";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole();
  if (error) return error;

  const body = await readJson(req);
  const text = String(body.description ?? body.text ?? "").trim();
  if (text.length < 8) return fail("Describe the problem in at least a sentence");

  try {
    const result = await analyzeReport({
      text,
      locationId: body.locationId ? String(body.locationId) : undefined,
      hasImage: !!body.imageUrl,
      useLlm: body.useLlm !== false,
    });

    const location = result.locationId ? await db.location.findUnique({ where: { id: result.locationId } }) : null;
    const scored = scorePriority({
      severity: result.analysis.severity,
      risk: result.analysis.risk,
      affectedUsers: result.analysis.affectedUsers,
      locationCriticality: location?.critical ?? 3,
      duplicateCount: Math.max(1, result.duplicates[0]?.reportCount ?? 1),
    });

    return ok({
      ...result,
      priority: scored.priority,
      priorityScore: scored.score,
      location,
      source: aiEnabled() ? "hybrid" : "heuristic",
      reporter: user.role,
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "AI analysis failed", 500);
  }
}
