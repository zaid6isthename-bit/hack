import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/reports/[id]">) {
  const { user, error } = await requireRole();
  if (error) return error;
  const { id } = await ctx.params;

  const report = await db.report.findUnique({
    where: { id },
    include: { incident: true, user: { select: { id: true, name: true } }, location: true },
  });
  if (!report) return fail("Report not found", 404);
  if ((user.role === "STUDENT" || user.role === "FACULTY") && report.userId !== user.id) return fail("Not your report", 403);

  return ok({ report });
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/reports/[id]">) {
  const { user, error } = await requireRole();
  if (error) return error;
  const { id } = await ctx.params;

  const report = await db.report.findUnique({ where: { id } });
  if (!report) return fail("Report not found", 404);
  if (report.userId !== user.id && user.role !== "ADMIN") return fail("Not your report", 403);

  const body = await readJson(req);
  const data: Record<string, unknown> = {};
  if (typeof body.description === "string" && body.description.trim().length >= 8) data.description = body.description.trim();
  if (typeof body.locationId === "string") data.locationId = body.locationId || null;
  if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl;

  const updated = await db.report.update({ where: { id }, data });
  return ok({ report: updated });
}
