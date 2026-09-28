import { db } from "../db";
import { llmComplete, aiEnabled } from "./llm";

export type CopilotFacts = {
  generatedAt: string;
  totals: { all: number; active: number; critical: number; high: number; resolved30: number; reported30: number; reportedPrev30: number; slaBreached: number; escalated: number };
  resolutionRate: number;
  avgResolutionHours: number | null;
  reopenRate: number;
  byCategory: { name: string; count: number; active: number }[];
  byBuilding: { name: string; count: number; active: number }[];
  byDepartment: { name: string; open: number; overdue: number; breached: number; resolved: number }[];
  recurring: { key: string; label: string; category: string; count: number; firstSeen: string; lastSeen: string }[];
  urgent: { id: string; number: number; title: string; location: string; priority: string; slaText: string; breached: boolean; reports: number }[];
};

const ACTIVE = ["REPORTED", "AI_TRIAGED", "ASSIGNED", "ACKNOWLEDGED", "IN_PROGRESS", "ON_HOLD", "ESCALATED"];

export async function gatherFacts(): Promise<CopilotFacts> {
  const now = Date.now();
  const d30 = new Date(now - 30 * 86400000);
  const d60 = new Date(now - 60 * 86400000);

  const [all, activeCount, critical, high, reported30, reportedPrev30, escalated, incidents, departments] = await Promise.all([
    db.incident.count(),
    db.incident.count({ where: { status: { in: ACTIVE } } }),
    db.incident.count({ where: { status: { in: ACTIVE }, priority: "Critical" } }),
    db.incident.count({ where: { status: { in: ACTIVE }, priority: "High" } }),
    db.incident.count({ where: { createdAt: { gte: d30 } } }),
    db.incident.count({ where: { createdAt: { gte: d60, lt: d30 } } }),
    db.incident.count({ where: { status: "ESCALATED" } }),
    db.incident.findMany({
      where: { createdAt: { gte: d60 } },
      include: { location: true, department: true, reports: { select: { id: true } } },
    }),
    db.department.findMany(),
  ]);

  const resolvedAll = await db.incident.count({ where: { resolvedAt: { not: null } } });
  const resolutionRate = all ? Math.round((resolvedAll / all) * 100) : 0;

  const resolved = await db.incident.findMany({ where: { resolvedAt: { not: null } }, select: { createdAt: true, resolvedAt: true, reopenCount: true } });
  const durations = resolved.map((r) => (r.resolvedAt!.getTime() - r.createdAt.getTime()) / 3600000).filter((n) => n > 0 && n < 24 * 30);
  const avgResolutionHours = durations.length ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10 : null;
  const reopened = resolved.filter((r) => r.reopenCount > 0).length;
  const reopenRate = resolved.length ? Math.round((reopened / resolved.length) * 100) : 0;

  const catMap = new Map<string, { count: number; active: number }>();
  const bldMap = new Map<string, { count: number; active: number }>();
  const deptMap = new Map<string, { open: number; overdue: number; breached: number; resolved: number }>();

  for (const d of departments) deptMap.set(d.name, { open: 0, overdue: 0, breached: 0, resolved: 0 });

  let slaBreached = 0;
  for (const inc of incidents) {
    const cat = inc.category;
    const c = catMap.get(cat) ?? { count: 0, active: 0 };
    c.count++;
    if (ACTIVE.includes(inc.status)) c.active++;
    catMap.set(cat, c);

    const b = inc.location?.building || "Unassigned";
    const bv = bldMap.get(b) ?? { count: 0, active: 0 };
    bv.count++;
    if (ACTIVE.includes(inc.status)) bv.active++;
    bldMap.set(b, bv);

    const deptName = inc.department?.name || "Unassigned";
    const dv = deptMap.get(deptName) ?? { open: 0, overdue: 0, breached: 0, resolved: 0 };
    if (ACTIVE.includes(inc.status)) dv.open++;
    if (inc.resolvedAt) dv.resolved++;
    if (inc.slaDeadline && inc.slaDeadline.getTime() < now && ACTIVE.includes(inc.status)) {
      dv.overdue++;
      slaBreached++;
    }
    deptMap.set(deptName, dv);
  }

  const recMap = new Map<string, { label: string; category: string; count: number; first: number; last: number }>();
  for (const inc of incidents) {
    const label = inc.location ? `${inc.location.room ? `Room ${inc.location.room}` : inc.location.building}` : "Unknown location";
    const key = `${inc.locationId ?? inc.location?.building ?? "x"}::${inc.category}`;
    const cur = recMap.get(key) ?? { label, category: inc.category, count: 0, first: inc.createdAt.getTime(), last: inc.createdAt.getTime() };
    cur.count++;
    cur.first = Math.min(cur.first, inc.createdAt.getTime());
    cur.last = Math.max(cur.last, inc.createdAt.getTime());
    recMap.set(key, cur);
  }
  const recurring = [...recMap.entries()]
    .filter(([, v]) => v.count >= 3)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
    .map(([key, v]) => ({
      key,
      label: v.label,
      category: v.category,
      count: v.count,
      firstSeen: new Date(v.first).toISOString(),
      lastSeen: new Date(v.last).toISOString(),
    }));

  const activeList = await db.incident.findMany({
    where: { status: { in: ACTIVE } },
    include: { location: true, reports: { select: { id: true } } },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    take: 40,
  });

  const rank: Record<string, number> = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  activeList.sort((a, b) => rank[b.priority] - rank[a.priority] || a.createdAt.getTime() - b.createdAt.getTime());

  const urgent = activeList.slice(0, 5).map((inc) => {
    const breached = !!inc.slaDeadline && inc.slaDeadline.getTime() < now;
    const ms = inc.slaDeadline ? inc.slaDeadline.getTime() - now : null;
    const slaText = !inc.slaDeadline
      ? "No SLA set"
      : breached
        ? `Breached by ${Math.floor(Math.abs(ms!) / 3600000)}h`
        : ms! < 3600000
          ? `${Math.max(1, Math.round(ms! / 60000))} min left`
          : `${Math.round(ms! / 3600000)}h left`;
    const loc = inc.location ? [inc.location.room && `Room ${inc.location.room}`, inc.location.building].filter(Boolean).join(", ") : "Location pending";
    return {
      id: inc.id,
      number: inc.incidentNumber,
      title: inc.title,
      location: loc,
      priority: inc.priority,
      slaText,
      breached,
      reports: inc.reports.length,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      all,
      active: activeCount,
      critical,
      high,
      resolved30: resolved.filter((r) => r.resolvedAt! >= d30).length,
      reported30,
      reportedPrev30,
      slaBreached,
      escalated,
    },
    resolutionRate,
    avgResolutionHours,
    reopenRate,
    byCategory: [...catMap.entries()].map(([name, v]) => ({ name, count: v.count, active: v.active })).sort((a, b) => b.count - a.count),
    byBuilding: [...bldMap.entries()].map(([name, v]) => ({ name, count: v.count, active: v.active })).sort((a, b) => b.count - a.count),
    byDepartment: [...deptMap.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.overdue - a.overdue || b.open - a.open),
    recurring,
    urgent,
  };
}

function answerFromFacts(q: string, f: CopilotFacts): string {
  const t = q.toLowerCase();
  const parts: string[] = [];

  const wantsNow = /look at|right now|urgent|priority queue|what.*first|immediately|attention/.test(t);
  const wantsDept = /department|team|staff|backlog|overdue|who has/.test(t);
  const wantsRecur = /recurr|repeat|again and again|chronic|frequent|which classroom|hotspot/.test(t);
  const wantsCategory = /category|categories|most common|common complaint|biggest problem|top issue|what type/.test(t);
  const wantsLocation = /block|building|location|where|wing/.test(t);
  const wantsPerf = /resolution rate|performance|how are we doing|sla|average time|reopen|trend/.test(t);

  if (wantsNow) {
    parts.push(`${f.totals.critical} critical and ${f.totals.high} high-priority incidents are open, with ${f.totals.slaBreached} past SLA and ${f.totals.escalated} escalated.`);
    if (f.urgent.length) {
      parts.push(`Start with these: ${f.urgent.slice(0, 3).map((u) => `INC-${u.number} ${u.title} at ${u.location} (${u.slaText})`).join("; ")}.`);
    }
    const elec = f.byCategory.find((c) => /electrical|safety/i.test(c.name));
    if (elec) parts.push(`${elec.name} is the largest active category with ${elec.active} open of ${elec.count} recorded.`);
    return parts.join(" ");
  }

  if (wantsDept) {
    const worst = f.byDepartment.filter((d) => d.name !== "Unassigned")[0];
    if (worst) parts.push(`${worst.name} carries the largest load: ${worst.open} open, ${worst.overdue} past SLA.`);
    const list = f.byDepartment.slice(0, 4).map((d) => `${d.name} (${d.open} open, ${d.overdue} overdue)`).join(", ");
    parts.push(`Department load: ${list}.`);
    return parts.join(" ");
  }

  if (wantsRecur) {
    if (f.recurring.length) {
      parts.push(`${f.recurring.length} recurring locations detected in the last 60 days.`);
      parts.push(f.recurring.slice(0, 3).map((r) => `${r.label} — ${r.category}, ${r.count} incidents`).join("; ") + ".");
      parts.push("Consider replacing the asset instead of repeating repairs.");
    } else {
      parts.push("No location has repeated the same category three or more times in the last 60 days.");
    }
    return parts.join(" ");
  }

  if (wantsCategory) {
    const top = f.byCategory.slice(0, 5).map((c) => `${c.name} ${c.count}`).join(", ");
    parts.push(`Top categories over the last 60 days: ${top}.`);
    const change = f.totals.reportedPrev30 ? Math.round(((f.totals.reported30 - f.totals.reportedPrev30) / f.totals.reportedPrev30) * 100) : 0;
    parts.push(`Report volume is ${change >= 0 ? "up" : "down"} ${Math.abs(change)}% versus the previous 30 days (${f.totals.reported30} vs ${f.totals.reportedPrev30}).`);
    return parts.join(" ");
  }

  if (wantsLocation) {
    const blockMatch = q.match(/block\s*([a-z])/i);
    if (blockMatch) {
      const b = f.byBuilding.find((x) => x.name.toLowerCase().includes(`block ${blockMatch![1].toLowerCase()}`));
      if (b) parts.push(`${b.name} has ${b.count} incidents, ${b.active} still active.`);
      else parts.push(`No incidents recorded for block ${blockMatch[1].toUpperCase()} in the analysed window.`);
      const urgent = f.urgent.filter((u) => u.location.toLowerCase().includes(`block ${blockMatch![1].toLowerCase()}`));
      if (urgent.length) parts.push(`Open there: ${urgent.map((u) => `INC-${u.number} ${u.title}`).join("; ")}.`);
      return parts.join(" ");
    }
    parts.push(`Busiest buildings: ${f.byBuilding.slice(0, 4).map((b) => `${b.name} ${b.count}`).join(", ")}.`);
    return parts.join(" ");
  }

  if (wantsPerf) {
    parts.push(`Resolution rate is ${f.resolutionRate}% across ${f.totals.all} incidents.`);
    if (f.avgResolutionHours !== null) parts.push(`Average time to resolve is ${f.avgResolutionHours} hours.`);
    parts.push(`${f.totals.slaBreached} active incidents are past SLA and ${f.reopenRate}% of resolved work has been reopened.`);
    const change = f.totals.reportedPrev30 ? Math.round(((f.totals.reported30 - f.totals.reportedPrev30) / f.totals.reportedPrev30) * 100) : 0;
    parts.push(`Intake trend: ${f.totals.reported30} reports this month vs ${f.totals.reportedPrev30} last month (${change >= 0 ? "+" : ""}${change}%).`);
    return parts.join(" ");
  }

  parts.push(`${f.totals.active} incidents are active of ${f.totals.all} total (${f.totals.critical} critical, ${f.totals.high} high).`);
  parts.push(`Resolution rate ${f.resolutionRate}%, ${f.totals.slaBreached} past SLA.`);
  if (f.byCategory[0]) parts.push(`Largest category: ${f.byCategory[0].name} with ${f.byCategory[0].count}.`);
  if (f.byBuilding[0]) parts.push(`Busiest location: ${f.byBuilding[0].name} with ${f.byBuilding[0].count}.`);
  return parts.join(" ");
}

export async function answerCopilot(question: string, facts: CopilotFacts): Promise<{ answer: string; grounded: boolean; source: string }> {
  const fallback = answerFromFacts(question, facts);
  if (!aiEnabled()) return { answer: fallback, grounded: true, source: "Deterministic analytics engine (no AI key configured)" };

  const payload = JSON.stringify(
    {
      totals: facts.totals,
      resolutionRate: facts.resolutionRate,
      avgResolutionHours: facts.avgResolutionHours,
      reopenRate: facts.reopenRate,
      byCategory: facts.byCategory.slice(0, 8),
      byBuilding: facts.byBuilding.slice(0, 8),
      byDepartment: facts.byDepartment,
      recurring: facts.recurring,
      urgent: facts.urgent,
    },
    null,
    0
  );

  const text = await llmComplete([
    {
      role: "system",
      content:
        "You are the CampusFix AI operations copilot. Answer ONLY from the JSON facts provided. Never invent numbers. Be concise (2-4 sentences), specific, and operational.",
    },
    { role: "user", content: `FACTS: ${payload}\n\nQUESTION: ${question}` },
  ]);

  if (!text) return { answer: fallback, grounded: true, source: "Deterministic analytics engine (LLM unavailable)" };
  return { answer: text.trim(), grounded: true, source: "LLM wording over live database aggregates" };
}
