import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { db } from "@/lib/db";
import { stepsFrom } from "@/lib/incident";
import { changeStatus, setPriority, assignIncident, addComment } from "@/lib/incident";
import { resolveDepartmentId } from "@/lib/incident";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/incidents/[id]">) {
  const { error } = await requireRole();
  if (error) return error;
  const { id } = await ctx.params;

  const incident = await db.incident.findUnique({
    where: { id },
    include: {
      location: true,
      department: true,
      assignedStaff: { select: { id: true, name: true, email: true } },
      reports: { include: { user: { select: { id: true, name: true, role: true } }, location: true }, orderBy: { createdAt: "asc" } },
      comments: { include: { user: { select: { id: true, name: true, role: true } } }, orderBy: { createdAt: "asc" } },
      attachments: { orderBy: { createdAt: "asc" } },
      history: { include: { actor: { select: { name: true } } }, orderBy: { timestamp: "asc" } },
      resolutions: { include: { createdBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!incident) return fail("Incident not found", 404);

  return ok({ incident: { ...incident, suggestedSteps: stepsFrom(incident.suggestedSteps) } });
}

export async function PATCH(req: NextRequest, ctx: RouteContext<"/api/incidents/[id]">) {
  const { user, error } = await requireRole(["STAFF", "ADMIN", "FACULTY"]);
  if (error) return error;
  const { id } = await ctx.params;
  const body = await readJson(req);

  const inc = await db.incident.findUnique({ where: { id } });
  if (!inc) return fail("Incident not found", 404);

  if (typeof body.status === "string") {
    await changeStatus(id, body.status as never, user, typeof body.note === "string" ? body.note : undefined);
  }
  if (typeof body.priority === "string") {
    await setPriority(id, body.priority as never, user.id);
  }
  if (typeof body.departmentName === "string" && body.departmentName) {
    const departmentId = await resolveDepartmentId(body.departmentName);
    await db.incident.update({
      where: { id },
      data: {
        departmentId,
        history: { create: { action: "DEPARTMENT_CHANGED", performedBy: user.id, oldValue: "", newValue: body.departmentName } },
      },
    });
  }
  if (typeof body.staffId === "string" && body.staffId) {
    await assignIncident(id, body.staffId, user);
  }
  if (typeof body.title === "string" && body.title.trim()) {
    await db.incident.update({ where: { id }, data: { title: body.title.trim() } });
  }
  if (typeof body.suggestedAction === "string") {
    await db.incident.update({
      where: { id },
      data: { suggestedAction: body.suggestedAction, history: { create: { action: "AI_OVERRIDE", performedBy: user.id, oldValue: inc.suggestedAction, newValue: body.suggestedAction } } },
    });
  }
  if (typeof body.message === "string" && body.message.trim()) {
    await addComment(id, user.id, body.message.trim());
  }

  const fresh = await db.incident.findUnique({ where: { id } });
  return ok({ incident: fresh });
}
