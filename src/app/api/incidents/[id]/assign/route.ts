import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { assignIncident } from "@/lib/incident";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/incidents/[id]/assign">) {
  const { user, error } = await requireRole(["STAFF", "ADMIN"]);
  if (error) return error;
  const { id } = await ctx.params;
  const body = await readJson(req);
  const staffId = String(body.staffId ?? "");
  if (!staffId) return fail("Select a staff member");

  try {
    await assignIncident(id, staffId, user);
    return ok({ success: true });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Assignment failed", 500);
  }
}
