import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { submitReport } from "@/lib/incident";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { user, error } = await requireRole();
  if (error) return error;

  const body = await readJson(req);
  const text = String(body.description ?? "").trim();
  if (text.length < 8) return fail("Describe the problem in at least a sentence");

  try {
    const result = await submitReport({
      userId: user.id,
      text,
      locationId: body.locationId ? String(body.locationId) : null,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
      joinIncidentId: body.joinIncidentId ? String(body.joinIncidentId) : null,
    });
    const incident = await db.incident.findUnique({
      where: { id: result.incidentId },
      select: { id: true, incidentNumber: true, title: true, priority: true, status: true, duplicateCount: true },
    });
    return ok({ ...result, incident }, { status: 201 });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not submit the report", 500);
  }
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole();
  if (error) return error;

  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";
  const scopeMine = mine || user.role === "STUDENT" || user.role === "FACULTY";

  const reports = await db.report.findMany({
    where: scopeMine ? { userId: user.id } : {},
    include: {
      incident: { select: { id: true, incidentNumber: true, title: true, priority: true, status: true, category: true, location: true } },
      location: true,
      user: { select: { id: true, name: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return ok({ reports });
}
