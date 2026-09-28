import Link from "next/link";
import { redirect } from "next/navigation";
import { PenLine, Ticket, ArrowRight, Sparkles, Inbox } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { OPEN_STATUSES, CATEGORY_COLORS } from "@/lib/types";
import { Panel, Kpi, Empty, buttonClass } from "@/components/ui/primitives";
import { PriorityBadge, StatusBadge, CategoryBadge } from "@/components/badges";
import { VerifyActions } from "@/components/verify-actions";
import { prettyLocation } from "@/lib/incident";
import { slaView } from "@/lib/sla";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "STAFF") redirect("/staff");

  const myReports = await db.report.findMany({
    where: { userId: user.id },
    include: {
      incident: { include: { location: true, department: true, resolutions: { orderBy: { createdAt: "desc" }, take: 1 } } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const myIncidentIds = [...new Set(myReports.map((r) => r.incidentId).filter(Boolean))] as string[];

  const awaitingConfirmation = await db.incident.findMany({
    where: {
      id: { in: myIncidentIds },
      status: "RESOLVED",
    },
    include: { location: true, department: true, reports: { where: { userId: user.id }, select: { id: true } }, resolutions: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const activeMine = await db.incident.findMany({
    where: { id: { in: myIncidentIds }, status: { in: OPEN_STATUSES } },
    include: { location: true, department: true, assignedStaff: { select: { name: true } }, reports: { select: { id: true } } },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  const campusNow = await db.incident.findMany({
    where: { status: { in: OPEN_STATUSES } },
    include: { location: true, department: true, reports: { select: { id: true } } },
    orderBy: { updatedAt: "desc" },
    take: 6,
  });

  const resolvedCount = myIncidentIds.length
    ? await db.incident.count({ where: { id: { in: myIncidentIds }, resolvedAt: { not: null } } })
    : 0;
  const openCount = activeMine.length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="panel grain relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 100% 0%, rgba(56,189,248,0.14), transparent 55%), radial-gradient(circle at 0% 100%, rgba(129,140,248,0.12), transparent 50%)",
          }}
        />
        <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <div className="label-xs mb-3">CampusFix AI · {user.role.toLowerCase()}</div>
            <h1 className="text-[30px] font-semibold leading-tight tracking-tight md:text-[38px]">
              Something broken?
              <br />
              <span className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
                Tell us. We&apos;ll route it.
              </span>
            </h1>
            <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted">
              Describe the problem in your own words — the AI classifies it, scores urgency, finds duplicates and
              routes it to the right team automatically.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/report" className={buttonClass("primary", "lg")}>
                <PenLine size={16} /> Report an issue
              </Link>
              <Link href="/reports" className={buttonClass("outline", "lg")}>
                <Ticket size={16} /> Track my issues
              </Link>
            </div>
          </div>

          <div className="grid w-full shrink-0 grid-cols-3 gap-3 md:w-[300px]">
            <Kpi label="Open" value={openCount} tone={openCount ? "high" : "success"} />
            <Kpi label="Resolved" value={resolvedCount} tone="success" />
            <Kpi label="Reports" value={myReports.length} />
          </div>
        </div>
      </div>

      {awaitingConfirmation.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 flex items-center gap-2.5">
            <Sparkles size={15} className="text-amber-300" />
            <h2 className="text-[15px] font-semibold tracking-tight">Is this actually fixed?</h2>
            <span className="text-[12.5px] text-muted">Staff marked these as resolved — your confirmation closes them.</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {awaitingConfirmation.map((inc) => (
              <div key={inc.id} className="panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="num text-[11.5px] font-bold text-accent">INC-{inc.incidentNumber}</span>
                      <PriorityBadge priority={inc.priority} />
                    </div>
                    <Link href={`/incidents/${inc.id}`} className="mt-1.5 block truncate text-[14.5px] font-semibold hover:text-accent">
                      {inc.title}
                    </Link>
                    <div className="mt-1 text-[12px] text-muted">{prettyLocation(inc.location)}</div>
                    {inc.resolutions[0] && (
                      <div className="mt-3 rounded-lg border border-line bg-bg2 p-3">
                        <div className="label-xs mb-1">Technician note</div>
                        <p className="text-[12.5px] leading-relaxed text-muted">{inc.resolutions[0].description}</p>
                        {inc.resolutions[0].aiAppearsResolved !== null && (
                          <p className="mt-1.5 text-[11.5px] text-faint">
                            AI evidence check: {inc.resolutions[0].aiAppearsResolved ? "appears resolved" : "thin evidence"} ·{" "}
                            {inc.resolutions[0].aiVerificationNote.slice(0, 90)}…
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-3.5">
                  <VerifyActions incidentId={inc.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Panel
          title="Your active issues"
          description="Incidents your reports contributed to, ranked by priority."
          action={
            <Link href="/reports" className="text-[12.5px] text-accent hover:underline">
              View all
            </Link>
          }
          padded={false}
        >
          {activeMine.length === 0 ? (
            <Empty title="No open issues" body="Everything you reported is resolved or closed." icon={<Inbox size={18} />} />
          ) : (
            <ul className="divide-y divide-line">
              {activeMine.slice(0, 6).map((inc) => {
                const sla = slaView(inc.slaDeadline, inc.status);
                return (
                  <li key={inc.id}>
                    <Link href={`/incidents/${inc.id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/3">
                      <PriorityDot priority={inc.priority} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-[13.5px] font-medium">{inc.title}</span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] text-faint">
                          <span>{prettyLocation(inc.location)}</span>
                          <span>·</span>
                          <span>{inc.department?.name ?? "Unassigned"}</span>
                          {inc.assignedStaff && (
                            <>
                              <span>·</span>
                              <span>{inc.assignedStaff.name}</span>
                            </>
                          )}
                          {sla.state !== "none" && (
                            <>
                              <span>·</span>
                              <span className={sla.state === "breached" ? "text-rose-400" : sla.state === "due" ? "text-amber-300" : ""}>
                                {sla.text}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={inc.status} />
                      <ArrowRight size={14} className="shrink-0 text-faint" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent campus issues"
          description="Live feed of open incidents across the campus."
          action={
            <Link href="/feed" className="text-[12.5px] text-accent hover:underline">
              Open feed
            </Link>
          }
          padded={false}
        >
          <ul className="divide-y divide-line">
            {campusNow.map((inc) => (
              <li key={inc.id}>
                <Link href={`/incidents/${inc.id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-white/3">
                  <PriorityDot priority={inc.priority} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13.5px] font-medium">{inc.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-faint">
                      <span>{prettyLocation(inc.location)}</span>
                      <span>·</span>
                      <span>{inc.reports.length} report{inc.reports.length === 1 ? "" : "s"}</span>
                      <span>·</span>
                      <span>{inc.department?.name}</span>
                    </div>
                  </div>
                  <CategoryBadge category={inc.category} color={CATEGORY_COLORS[inc.category]} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const map: Record<string, string> = { Critical: "#f43f5e", High: "#f97316", Medium: "#eab308", Low: "#38bdf8" };
  return <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: map[priority] ?? "#94a3b8" }} />;
}
