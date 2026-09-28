import { db } from "./db";
import type { Priority } from "./types";

export const DEFAULT_SLA_HOURS: Record<Priority, number> = {
  Critical: 1,
  High: 4,
  Medium: 24,
  Low: 72,
};

let cacheAt = 0;
let cache: Partial<Record<Priority, number>> = {};

export async function slaHoursFor(priority: Priority): Promise<number> {
  if (Date.now() - cacheAt > 30_000) {
    const rows = await db.slaRule.findMany();
    cache = {};
    for (const r of rows) cache[r.priority as Priority] = r.hours;
    cacheAt = Date.now();
  }
  return cache[priority] ?? DEFAULT_SLA_HOURS[priority];
}

export async function deadlineFor(priority: Priority, from: Date = new Date()): Promise<Date> {
  const hours = await slaHoursFor(priority);
  return new Date(from.getTime() + hours * 3600000);
}

export function slaView(deadline: Date | null | undefined, status: string, resolvedAt?: Date | null) {
  const closedLike = ["RESOLVED", "VERIFIED", "CLOSED", "REJECTED", "DUPLICATE"].includes(status);
  if (!deadline) return { state: "none" as const, text: "No SLA", hoursLeft: null };
  const end = resolvedAt ?? (closedLike ? null : null);
  const ref = end ?? new Date();
  const ms = deadline.getTime() - ref.getTime();
  if (closedLike && resolvedAt) {
    const took = resolvedAt.getTime() - deadline.getTime();
    return took <= 0
      ? { state: "met" as const, text: "Met SLA", hoursLeft: null }
      : { state: "missed" as const, text: `Missed by ${fmtDuration(took)}`, hoursLeft: null };
  }
  if (ms < 0) return { state: "breached" as const, text: `Breached ${fmtDuration(-ms)} ago`, hoursLeft: ms / 3600000 };
  if (ms < 3600000) return { state: "due" as const, text: `${Math.max(1, Math.round(ms / 60000))} min remaining`, hoursLeft: ms / 3600000 };
  return { state: "ok" as const, text: `${Math.round(ms / 3600000)}h remaining`, hoursLeft: ms / 3600000 };
}

function fmtDuration(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h <= 0) return `${m}m`;
  return `${h}h ${m}m`;
}

const ACTIVE = ["REPORTED", "AI_TRIAGED", "ASSIGNED", "ACKNOWLEDGED", "IN_PROGRESS", "ON_HOLD"];

let lastSweep = 0;

export async function runEscalationSweep(force = false): Promise<number> {
  if (!force && Date.now() - lastSweep < 60_000) return 0;
  lastSweep = Date.now();

  const overdue = await db.incident.findMany({
    where: {
      status: { in: ACTIVE },
      slaDeadline: { lt: new Date() },
      OR: [{ escalationLevel: 0 }, { escalationLevel: 1, updatedAt: { lt: new Date(Date.now() - 2 * 3600000) } }],
    },
    include: { department: true, reports: { include: { user: true } } },
    take: 25,
  });

  let count = 0;
  for (const inc of overdue) {
    const level = inc.escalationLevel + 1;
    await db.incident.update({
      where: { id: inc.id },
      data: {
        escalationLevel: level,
        status: "ESCALATED",
        history: {
          create: {
            action: "ESCALATED",
            oldValue: inc.status,
            newValue: "ESCALATED",
            performedBy: null,
          },
        },
      },
    });

    const reporters = inc.reports.map((r) => r.userId);
    const staff = await db.user.findMany({
      where: { OR: [{ id: inc.assignedStaffId ?? "" }, { departmentId: inc.departmentId ?? "", role: { in: ["STAFF", "ADMIN"] } }] },
      select: { id: true },
    });
    const targets = new Set<string>([...reporters, ...staff.map((s) => s.id)]);
    const escalationLabel = level === 1 ? "department head" : "campus administrator";
    for (const userId of targets) {
      await db.notification.create({
        data: {
          userId,
          incidentId: inc.id,
          type: "escalation",
          title: `Escalated — INC-${inc.incidentNumber}`,
          body: `${inc.title} passed its SLA and was escalated to the ${escalationLabel}.`,
        },
      });
    }
    count++;
  }
  return count;
}
