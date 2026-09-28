import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { verifyResolution } from "@/lib/ai/verify";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const body = await readJson(req);
  const incidentId = String(body.incidentId ?? "");
  const note = String(body.resolutionNote ?? body.note ?? "");
  const hasResolutionImage = !!body.resolutionImage;

  let originalText = String(body.originalText ?? "");
  let originalHasImage = !!body.originalImage;
  let reopenCount = 0;

  if (incidentId) {
    const inc = await db.incident.findUnique({ where: { id: incidentId }, include: { reports: true } });
    if (!inc) return fail("Incident not found", 404);
    originalText = originalText || inc.reports.map((r) => r.description).join(" ");
    originalHasImage = originalHasImage || inc.reports.some((r) => !!r.imageUrl);
    reopenCount = inc.reopenCount;
  }

  const verdict = verifyResolution({ originalText, resolutionNote: note, hasResolutionImage, originalHasImage, reopenCount });
  return ok(verdict);
}
