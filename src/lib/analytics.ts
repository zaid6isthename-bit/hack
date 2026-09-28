import { db } from "./db";
import { OPEN_STATUSES } from "./types";

export type Overview = {
  totals: {
    incidents: number;
    active: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    reports: number;
    resolved: number;
    closed: number;
    escalated: number;
    breached: number;
    resolutionRate: number;
    avgResolutionHours: number | null;
    medianResolutionHours: number | null;
    reopenedPct: number;
    slaCompliance: number;
  };
  health: { score: number; breakdown: { label: string; weight: number; value: number }[] };
  statusCounts: { status: string; count: number }[];
  categoryCounts: { name: string; count: number; active: number; color: string }[];
  buildingCounts: { name: string; count: number; active: number; critical: number }[];
  departmentCounts: { name: string; id: string | null; open: number; resolved: number; breached: number; color: string }[];
  trend: { date: string; reported: number; resolved: number }[];
  recurring: { key: string; label: string; category: string; count: number; lastSeen: string }[];
  insights: string[];
};

const CATEGORY_COLORS: Record<string, string> = {
  Electrical: "#f59e0b",
  HVAC: "#06b6d4",
  Plumbing: "#3b82f6",
  "IT / Network": "#8b5cf6",
  Cleaning: "#10b981",
  Infrastructure: "#64748b",
  Security: "#ef4444",
  "Lab Equipment": "#14b8a6",
  Furniture: "#a855f7",
  Safety: "#f43f5e",
  Other: "#94a3b8",
};

export async function buildOverview(): Promise<Overview> {
  const now = Date.now();
  const d30 = new Date(now - 30 * 86400000);
  const d60 = new Date(now - 60 * 86400000);
  const d14 = new Date(now - 14 * 86400000);

  const [incidents, reports, departments, recent] = await Promise.all([
    db.incident.findMany({ include: { location: true, department: true, reports: { select: { id: true } } } }),
    db.report.count(),
    db.department.findMany(),
    db.incident.findMany({
      where: { createdAt: { gte: d14 } },
      select: { createdAt: true, resolvedAt: true, status: true },
    }),
  ]);

  const active = incidents.filter((i) => OPEN_STATUSES.includes(i.status as never));
  const resolved = incidents.filter((i) => i.resolvedAt);
  const closed = incidents.filter((i) => i.status === "CLOSED");
  const escalated = incidents.filter((i) => i.status === "ESCALATED" || i.escalationLevel > 0);
  const breached = active.filter((i) => i.slaDeadline && i.slaDeadline.getTime() < now);

  const withinSla = resolved.filter((i) => i.slaDeadline && i.resolvedAt && i.resolvedAt.getTime() <= i.slaDeadline.getTime());
  const slaCompliance = resolved.length ? Math.round((withinSla.length / resolved.length) * 100) : 100;

  const durations = resolved
    .map((i) => (i.resolvedAt!.getTime() - i.createdAt.getTime()) / 3600000)
    .filter((n) => n > 0 && n < 720)
    .sort((a, b) => a - b);
  const avg = durations.length ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10 : null;
  const median = durations.length ? Math.round(durations[Math.floor(durations.length / 2)] * 10) / 10 : null;
  const reopened = incidents.filter((i) => i.reopenCount > 0).length;

  const resolutionRate = incidents.length ? Math.round((resolved.length / incidents.length) * 100) : 0;
  const activeCount = active.length;
  const critical = active.filter((i) => i.priority === "Critical").length;
  const high = active.filter((i) => i.priority === "High").length;

  const backlogRatio = incidents.length ? Math.min(activeCount / Math.max(incidents.length * 0.35, 1), 1) : 0;
  const criticalRatio = activeCount ? critical / activeCount : 0;
  const slaScore = resolved.length ? withinSla.length / resolved.length : 1;
  const resolutionScore = resolutionRate / 100;

  const parts = [
    { label: "Issue backlog", weight: 40, value: Math.round((1 - backlogRatio) * 100) },
    { label: "Critical incidents", weight: 20, value: Math.round((1 - Math.min(criticalRatio * 2, 1)) * 100) },
    { label: "SLA performance", weight: 20, value: Math.round(slaScore * 100) },
    { label: "Recent resolution rate", weight: 20, value: Math.round(resolutionScore * 100) },
  ];
  const healthScore = Math.round(parts.reduce((sum, p) => sum + (p.value * p.weight) / 100, 0));

  const statusCounts = new Map<string, number>();
  for (const i of incidents) statusCounts.set(i.status, (statusCounts.get(i.status) ?? 0) + 1);

  const catMap = new Map<string, { count: number; active: number }>();
  const bldMap = new Map<string, { count: number; active: number; critical: number }>();
  const deptMap = new Map<string, { id: string | null; open: number; resolved: number; breached: number }>();
  for (const d of departments) deptMap.set(d.name, { id: d.id, open: 0, resolved: 0, breached: 0 });

  for (const i of incidents) {
    const c = catMap.get(i.category) ?? { count: 0, active: 0 };
    c.count++;
    if (OPEN_STATUSES.includes(i.status as never)) c.active++;
    catMap.set(i.category, c);

    const b = i.location?.building || "Unassigned";
    const bv = bldMap.get(b) ?? { count: 0, active: 0, critical: 0 };
    bv.count++;
    if (OPEN_STATUSES.includes(i.status as never)) {
      bv.active++;
      if (i.priority === "Critical") bv.critical++;
    }
    bldMap.set(b, bv);

    const dn = i.department?.name || "Unassigned";
    const dv = deptMap.get(dn) ?? { id: i.departmentId, open: 0, resolved: 0, breached: 0 };
    if (OPEN_STATUSES.includes(i.status as never)) dv.open++;
    if (i.resolvedAt) dv.resolved++;
    if (i.slaDeadline && i.slaDeadline.getTime() < now && OPEN_STATUSES.includes(i.status as never)) dv.breached++;
    deptMap.set(dn, dv);
  }

  const trend: { date: string; reported: number; resolved: number }[] = [];
  for (let d = 13; d >= 0; d--) {
    const day = new Date(now - d * 86400000);
    const key = day.toISOString().slice(0, 10);
    trend.push({
      date: key,
      reported: recent.filter((r) => r.createdAt.toISOString().slice(0, 10) === key).length,
      resolved: recent.filter((r) => r.resolvedAt?.toISOString().slice(0, 10) === key).length,
    });
  }

  const recMap = new Map<string, { label: string; category: string; count: number; last: number }>();
  for (const i of incidents.filter((x) => x.createdAt >= d60)) {
    const label = i.location ? `${i.location.room ? `Room ${i.location.room} · ` : ""}${i.location.building}` : "Unknown location";
    const key = `${i.locationId ?? "x"}::${i.category}`;
    const cur = recMap.get(key) ?? { label, category: i.category, count: 0, last: 0 };
    cur.count++;
    cur.last = Math.max(cur.last, i.createdAt.getTime());
    recMap.set(key, cur);
  }
  const recurring = [...recMap.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8)
    .map(([key, v]) => ({ key, label: v.label, category: v.category, count: v.count, lastSeen: new Date(v.last).toISOString() }));

  const monthIncidents = incidents.filter((i) => i.createdAt >= d30);
  const prevMonth = incidents.filter((i) => i.createdAt >= d60 && i.createdAt < d30);
  const topCategory = [...catMap.entries()].sort((a, b) => b[1].count - a[1].count)[0];
  const topBuilding = [...bldMap.entries()].sort((a, b) => b[1].count - a[1].count)[0];
  const worstDept = [...deptMap.entries()].filter(([n]) => n !== "Unassigned").sort((a, b) => b[1].breached - a[1].breached)[0];
  const delta = prevMonth.length ? Math.round(((monthIncidents.length - prevMonth.length) / prevMonth.length) * 100) : 0;

  const insights: string[] = [];
  if (critical > 0) insights.push(`${critical} critical incident${critical > 1 ? "s are" : " is"} open right now — resolve these before anything else.`);
  if (breached.length) insights.push(`${breached.length} active incident${breached.length > 1 ? "s have" : " has"} passed SLA. ${worstDept ? `${worstDept[0]} holds ${worstDept[1].breached} of them.` : ""}`);
  if (topCategory) insights.push(`${topCategory[0]} is the largest category with ${topCategory[1].count} incidents (${topCategory[1].active} active).`);
  if (topBuilding) insights.push(`${topBuilding[0]} is the busiest location with ${topBuilding[1].count} incidents.`);
  if (recurring.length) insights.push(`Recurring issue detected: ${recurring[0].label} — ${recurring[0].count} ${recurring[0].category} incidents in 60 days. Consider permanent replacement.`);
  if (prevMonth.length) insights.push(`Report volume ${delta >= 0 ? "increased" : "decreased"} ${Math.abs(delta)}% versus the previous 30 days.`);
  if (slaCompliance < 80 && resolved.length) insights.push(`SLA compliance is ${slaCompliance}% — below the 80% operational target.`);

  return {
    totals: {
      incidents: incidents.length,
      active: activeCount,
      critical,
      high,
      medium: active.filter((i) => i.priority === "Medium").length,
      low: active.filter((i) => i.priority === "Low").length,
      reports,
      resolved: resolved.length,
      closed: closed.length,
      escalated: escalated.length,
      breached: breached.length,
      resolutionRate,
      avgResolutionHours: avg,
      medianResolutionHours: median,
      reopenedPct: incidents.length ? Math.round((reopened / incidents.length) * 100) : 0,
      slaCompliance,
    },
    health: { score: healthScore, breakdown: parts },
    statusCounts: [...statusCounts.entries()].map(([status, count]) => ({ status, count })),
    categoryCounts: [...catMap.entries()]
      .map(([name, v]) => ({ name, count: v.count, active: v.active, color: CATEGORY_COLORS[name] ?? "#94a3b8" }))
      .sort((a, b) => b.count - a.count),
    buildingCounts: [...bldMap.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.count - a.count),
    departmentCounts: [...deptMap.entries()].map(([name, v]) => ({
      name,
      id: v.id,
      open: v.open,
      resolved: v.resolved,
      breached: v.breached,
      color: departments.find((d) => d.name === name)?.color ?? "#6366f1",
    })),
    trend,
    recurring,
    insights,
  };
}
