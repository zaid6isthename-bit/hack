import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { findDuplicates } from "@/lib/ai/duplicate";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const body = await readJson(req);
  const text = String(body.text ?? body.description ?? "").trim();
  if (!text) return fail("Provide the report text to check");

  const location = body.locationId ? await db.location.findUnique({ where: { id: String(body.locationId) } }) : null;
  const matches = await findDuplicates({
    text,
    category: String(body.category ?? "Other"),
    locationId: location?.id,
    building: location?.building,
    room: location?.room,
    hasImage: !!body.imageUrl,
    threshold: body.threshold ? Number(body.threshold) : undefined,
  });
  return ok({ matches, checkedAt: new Date().toISOString() });
}
