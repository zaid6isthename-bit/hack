import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { classify } from "@/lib/ai/classify";

export async function POST(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const body = await readJson(req);
  const text = String(body.text ?? "").trim();
  if (!text) return fail("Provide issue details");

  const a = classify({ text, hasImage: !!body.imageUrl });
  return ok({
    requiredDepartment: a.department || "Administration",
    recommendedActions: a.suggestedSteps,
    action: a.suggestedAction,
    estimatedDifficulty: a.severity >= 4 ? "Specialist + parts" : a.severity === 3 ? "Standard callout" : "Routine task",
    safetySensitive: a.safetySensitive,
    confidence: a.confidence,
  });
}
