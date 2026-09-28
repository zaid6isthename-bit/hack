import { NextRequest } from "next/server";
import { ok, requireRole } from "@/lib/api";
import { db } from "@/lib/db";
import { runEscalationSweep } from "@/lib/sla";
import { OPEN_STATUSES } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { user, error } = await requireRole();
  if (error) return error;

  await runEscalationSweep();

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const category = url.searchParams.get("category");
  const departmentId = url.searchParams.get("departmentId");
  const building = url.searchParams.get("building");
  const mine = url.searchParams.get("mine") === "1";
  const openOnly = url.searchParams.get("open") === "1";

  const where: Record<string, unknown> = {};
  if (openOnly) where.status = { in: OPEN_STATUSES };
  if (status && status !== "ALL") where.status = status;
  if (priority && priority !== "ALL") where.priority = priority;
  if (category && category !== "ALL") where.category = category;
  if (departmentId && departmentId !== "ALL") where.departmentId = departmentId;
  if (building && building !== "ALL") where.location = { building };
  if (mine) {
    where.reports = { some: { userId: user.id } };
  }
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { category: { contains: q } },
      { location: { building: { contains: q } } },
      { location: { room: { contains: q } } },
      { incidentNumber: { equals: Number(q.replace(/[^\d]/g, "")) || -1 } },
    ];
  }

  const incidents = await db.incident.findMany({
    where,
    include: {
      location: true,
      department: true,
      assignedStaff: { select: { id: true, name: true } },
      reports: { select: { id: true, userId: true } },
      _count: { select: { comments: true } },
    },
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });

  return ok({ incidents, role: user.role });
}
