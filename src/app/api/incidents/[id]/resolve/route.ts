import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { resolveIncident } from "@/lib/incident";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/incidents/[id]/resolve">) {
  const { user, error } = await requireRole(["STAFF", "ADMIN", "FACULTY"]);
  if (error) return error;
  const { id } = await ctx.params;
  const body = await readJson(req);

  const note = String(body.note ?? body.description ?? "").trim();
  if (note.length < 5) return fail("Describe what was done to fix it");

  try {
    const verdict = await resolveIncident({
      incidentId: id,
      actor: user,
      note,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
    });
    return ok({ success: true, verification: verdict });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not record the resolution", 500);
  }
}
