import { db } from "./db";

export async function notify(input: {
  userIds: string[];
  incidentId?: string;
  type?: string;
  title: string;
  body: string;
}) {
  const ids = [...new Set(input.userIds)].filter(Boolean);
  if (!ids.length) return;
  await db.notification.createMany({
    data: ids.map((userId) => ({
      userId,
      incidentId: input.incidentId,
      type: input.type ?? "info",
      title: input.title,
      body: input.body,
    })),
  });
}

export async function departmentUserIds(departmentId: string | null, roles: string[] = ["STAFF", "ADMIN"]) {
  if (!departmentId) return [];
  const users = await db.user.findMany({ where: { departmentId, role: { in: roles } }, select: { id: true } });
  return users.map((u) => u.id);
}

export async function reporterIds(incidentId: string) {
  const reports = await db.report.findMany({ where: { incidentId }, select: { userId: true } });
  return reports.map((r) => r.userId);
}

export async function allAdminIds() {
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  return admins.map((u) => u.id);
}
