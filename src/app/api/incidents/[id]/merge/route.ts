import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { mergeIncidents } from "@/lib/incident";

export async function POST(req: NextRequest, ctx: RouteContext<"/api/incidents/[id]/merge">) {
  const { user, error } = await requireRole(["ADMIN", "STAFF"]);
  if (error) return error;
  const { id } = await ctx.params;
  const body = await readJson(req);

  let sourceIds: string[] = [];
  if (Array.isArray(body.sourceIds)) sourceIds = body.sourceIds.map(String);
  else if (typeof body.sourceId === "string") sourceIds = [body.sourceId];
  if (!sourceIds.length) return fail("Select incidents to merge");

  try {
    const count = await mergeIncidents(sourceIds, id, user);
    return ok({ success: true, reportCount: count });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Merge failed", 500);
  }
}
