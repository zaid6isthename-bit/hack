import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { confirmResolution } from "@/lib/incident";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/incidents/[id]/reopen">) {
  const { user, error } = await requireRole();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await readJson(req);

  const confirmed = body.confirmed === true || body.confirmed === "true";
  try {
    const result = await confirmResolution(id, confirmed, user.id);
    return ok({ success: true, ...result });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Could not update the incident", 500);
  }
}
