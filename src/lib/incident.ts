import { db } from "./db";
import { classify, departmentFor, locationLabel } from "./ai/classify";
import { findDuplicates } from "./ai/duplicate";
import { scorePriority } from "./ai/priority";
import { aiEnabled, llmComplete, extractJson } from "./ai/llm";
import { verifyResolution } from "./ai/verify";
import { deadlineFor } from "./sla";
import { notify, departmentUserIds, reporterIds, allAdminIds } from "./notify";
import type { AIAnalysis, DuplicateMatch, Priority, Status } from "./types";

const PRIORITY_ORDER: Priority[] = ["Low", "Medium", "High", "Critical"];

export async function nextNumber(key: string, start: number): Promise<number> {
  const row = await db.counter.upsert({
    where: { key },
    create: { key, value: start },
    update: { value: { increment: 1 } },
  });
  return row.value;
}

export async function resolveDepartmentId(name: string): Promise<string | null> {
  const existing = await db.department.findFirst({ where: { name: { equals: name } } });
  if (existing) return existing.id;
  const created = await db.department.create({ data: { name, description: `Auto-created for ${name} routing` } });
  return created.id;
}

export async function ensureLocation(hint: AIAnalysis["locationHint"]): Promise<string | null> {
  if (!hint.building && !hint.room && !hint.floor) return null;
  if (hint.room) {
    const byRoom = await db.location.findFirst({ where: { room: hint.room } });
    if (byRoom) return byRoom.id;
  }
  if (hint.building) {
    const byBuilding = await db.location.findFirst({
      where: {
        building: { equals: hint.building },
        ...(hint.floor ? { floor: hint.floor } : {}),
      },
    });
    if (byBuilding) return byBuilding.id;
  }
  return db.location.create({
    data: {
      building: hint.building || "Unspecified",
      floor: hint.floor,
      room: hint.room,
      critical: /lab|seminar|server|exam|auditorium/i.test(hint.building) ? 5 : 3,
      mapX: 20 + Math.random() * 60,
      mapY: 20 + Math.random() * 60,
    },
  }).then((l) => l.id);
}

export async function enrichWithLlm(text: string, base: AIAnalysis): Promise<AIAnalysis> {
  if (!aiEnabled()) return base;
  const raw = await llmComplete(
    [
      {
        role: "system",
        content:
          "You triage campus maintenance reports. Reply with ONLY JSON: {category, subcategory, severity(1-5), risk, title, suggestedAction}. Categories: Electrical, HVAC, Plumbing, IT / Network, Cleaning, Infrastructure, Furniture, Lab Equipment, Security, Safety, Other.",
      },
      { role: "user", content: text },
    ],
    { maxTokens: 300 }
  );
  const parsed = extractJson(raw || "") as Partial<AIAnalysis> | null;
  if (!parsed || typeof parsed !== "object") return base;
  const sev = Math.min(5, Math.max(1, Math.round(Number(parsed.severity) || base.severity)));
  const label: AIAnalysis["severityLabel"] = sev >= 5 ? "Critical" : sev === 4 ? "High" : sev === 3 ? "Medium" : "Low";
  return {
    ...base,
    category: typeof parsed.category === "string" && parsed.category ? parsed.category : base.category,
    subcategory: typeof parsed.subcategory === "string" && parsed.subcategory ? parsed.subcategory : base.subcategory,
    severity: sev,
    severityLabel: label,
    risk: typeof parsed.risk === "string" && parsed.risk ? parsed.risk : base.risk,
    title: typeof parsed.title === "string" && parsed.title.length > 4 ? parsed.title : base.title,
    suggestedAction: typeof parsed.suggestedAction === "string" && parsed.suggestedAction ? parsed.suggestedAction : base.suggestedAction,
    confidence: Math.min(0.97, base.confidence + 0.05),
  };
}

export async function analyzeReport(input: {
  text: string;
  locationId?: string | null;
  hasImage?: boolean;
  useLlm?: boolean;
}): Promise<{
  analysis: AIAnalysis;
  locationId: string | null;
  departmentId: string | null;
  departmentName: string;
  duplicates: DuplicateMatch[];
  lowConfidence: boolean;
}> {
  let analysis = classify({ text: input.text, hasImage: input.hasImage });
  if (input.useLlm !== false) analysis = await enrichWithLlm(input.text, analysis);

  if (input.locationId) {
    const loc = await db.location.findUnique({ where: { id: input.locationId } });
    if (loc) {
      analysis.locationHint = { building: loc.building, floor: loc.floor, room: loc.room, explicit: true };
    }
  }

  const departmentName = departmentFor(analysis.category, input.text);
  analysis.department = departmentName;

  const locationId = input.locationId ?? (await ensureLocation(analysis.locationHint));

  const location = locationId ? await db.location.findUnique({ where: { id: locationId } }) : null;
  const duplicates = await findDuplicates({
    text: input.text,
    category: analysis.category,
    locationId,
    building: location?.building,
    room: location?.room,
    hasImage: input.hasImage,
  });

  return {
    analysis,
    locationId,
    departmentId: await resolveDepartmentId(departmentName),
    departmentName,
    duplicates,
    lowConfidence: analysis.confidence < 0.55,
  };
}

export async function submitReport(input: {
  userId: string;
  text: string;
  locationId?: string | null;
  imageUrl?: string | null;
  joinIncidentId?: string | null;
  analysisOverride?: Partial<AIAnalysis>;
}): Promise<{ incidentId: string; reportId: string; joined: boolean }> {
  const analyzed = await analyzeReport({ text: input.text, locationId: input.locationId ?? undefined, hasImage: !!input.imageUrl });
  const analysis: AIAnalysis = { ...analyzed.analysis, ...input.analysisOverride };
  if (!analysis.department) analysis.department = analyzed.departmentName;

  const reportNumber = await nextNumber("report", 900);
  const now = new Date();

  if (input.joinIncidentId) {
    const target = await db.incident.findUnique({ where: { id: input.joinIncidentId }, include: { location: true } });
    if (!target) throw new Error("Incident not found");

    const report = await db.report.create({
      data: {
        reportNumber,
        userId: input.userId,
        incidentId: target.id,
        description: input.text,
        imageUrl: input.imageUrl ?? undefined,
        locationId: analyzed.locationId ?? undefined,
        aiSummary: analysis.summary,
        aiCategory: analysis.category,
        aiSubcategory: analysis.subcategory,
        aiSeverity: analysis.severityLabel,
        aiRisk: analysis.risk,
        aiDepartment: analysis.department,
        aiConfidence: analysis.confidence,
        joined: true,
      },
    });

    const count = await db.report.count({ where: { incidentId: target.id } });
    const locationCriticality = (await db.location.findUnique({ where: { id: target.locationId ?? "" } }))?.critical ?? 3;
    const scored = scorePriority({
      severity: Math.max(analysis.severity, target.severity === "Critical" ? 5 : target.severity === "High" ? 4 : target.severity === "Medium" ? 3 : 2),
      risk: analysis.risk,
      affectedUsers: target.affectedUsers,
      locationCriticality,
      duplicateCount: count,
    });
    const newPriority = PRIORITY_ORDER.indexOf(scored.priority) > PRIORITY_ORDER.indexOf(target.priority as Priority) ? scored.priority : target.priority;

    await db.incident.update({
      where: { id: target.id },
      data: {
        duplicateCount: count,
        priority: newPriority,
        priorityScore: scored.score,
        updatedAt: now,
        history: {
          create: {
            action: "REPORT_JOINED",
            performedBy: input.userId,
            oldValue: "",
            newValue: `Report #${reportNumber} added as supporting evidence`,
          },
        },
      },
    });

    const staffIds = await departmentUserIds(target.departmentId);
    const reporters = await reporterIds(target.id);
    await notify({
      userIds: [...staffIds, ...reporters.filter((id) => id !== input.userId)],
      incidentId: target.id,
      type: "duplicate",
      title: `New supporting report on INC-${target.incidentNumber}`,
      body: `Another report was merged into "${target.title}" (${count} total reports).`,
    });

    return { incidentId: target.id, reportId: report.id, joined: true };
  }

  const incidentNumber = await nextNumber("incident", 1000);
  const location = analyzed.locationId ? await db.location.findUnique({ where: { id: analyzed.locationId } }) : null;
  const scored = scorePriority({
    severity: analysis.severity,
    risk: analysis.risk,
    affectedUsers: analysis.affectedUsers,
    locationCriticality: location?.critical ?? 3,
    duplicateCount: 1,
  });
  const slaDeadline = await deadlineFor(scored.priority, now);

  const incident = await db.incident.create({
    data: {
      incidentNumber,
      title: analysis.title,
      description: analysis.summary,
      category: analysis.category,
      subcategory: analysis.subcategory,
      priority: scored.priority,
      priorityScore: scored.score,
      severity: analysis.severityLabel,
      risk: analysis.risk,
      status: "ASSIGNED",
      departmentId: analyzed.departmentId ?? undefined,
      locationId: analyzed.locationId ?? undefined,
      affectedUsers: analysis.affectedUsers,
      duplicateCount: 1,
      confidence: analysis.confidence,
      suggestedAction: analysis.suggestedAction,
      suggestedSteps: JSON.stringify(analysis.suggestedSteps),
      slaDeadline,
      createdAt: now,
      updatedAt: now,
    },
  });

  await db.report.create({
    data: {
      reportNumber,
      userId: input.userId,
      incidentId: incident.id,
      description: input.text,
      imageUrl: input.imageUrl ?? undefined,
      locationId: analyzed.locationId ?? undefined,
      aiSummary: analysis.summary,
      aiCategory: analysis.category,
      aiSubcategory: analysis.subcategory,
      aiSeverity: analysis.severityLabel,
      aiRisk: analysis.risk,
      aiDepartment: analysis.department,
      aiConfidence: analysis.confidence,
    },
  });

  if (input.imageUrl) {
    await db.attachment.create({
      data: { incidentId: incident.id, uploadedBy: input.userId, kind: "evidence", url: input.imageUrl, caption: "Reported evidence" },
    });
  }

  const where = [
    { incidentId: incident.id, action: "REPORTED", performedBy: input.userId, newValue: `Report #${reportNumber} received` },
    { incidentId: incident.id, action: "AI_TRIAGED", performedBy: input.userId, newValue: `${analysis.category} · ${analysis.severityLabel} · ${Math.round(analysis.confidence * 100)}% confidence` },
    { incidentId: incident.id, action: "ASSIGNED", performedBy: input.userId, oldValue: "", newValue: `Routed to ${analysis.department}` },
  ];
  await db.historyEntry.createMany({ data: where });

  const staffIds = await departmentUserIds(analyzed.departmentId);
  const admins = await allAdminIds();
  await notify({
    userIds: [...staffIds, ...admins, input.userId],
    incidentId: incident.id,
    type: "created",
    title: `INC-${incident.incidentNumber} · ${scored.priority} priority`,
    body: `${analysis.title} routed to ${analysis.department}. SLA ${slaDeadline.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.`,
  });

  return { incidentId: incident.id, reportId: "", joined: false };
}

export async function changeStatus(
  incidentId: string,
  next: Status,
  actor: { id: string; name: string; role: string },
  note?: string
) {
  const inc = await db.incident.findUnique({ where: { id: incidentId }, include: { department: true } });
  if (!inc) throw new Error("Incident not found");

  const data: Record<string, unknown> = { status: next, updatedAt: new Date() };
  if (next === "RESOLVED") data.resolvedAt = new Date();
  if (next === "CLOSED") data.closedAt = new Date();
  if (next === "RESOLVED" || next === "CLOSED") data.escalationLevel = 0;

  await db.incident.update({
    where: { id: incidentId },
    data: {
      ...data,
      history: {
        create: {
          action: next === "ESCALATED" ? "ESCALATED" : "STATUS_CHANGED",
          performedBy: actor.id,
          oldValue: inc.status,
          newValue: next + (note ? ` — ${note}` : ""),
        },
      },
    },
  });

  const reporters = await reporterIds(incidentId);
  const staff = await departmentUserIds(inc.departmentId);
  await notify({
    userIds: [...reporters, ...staff],
    incidentId,
    type: "status",
    title: `INC-${inc.incidentNumber} is now ${next.replace("_", " ").toLowerCase()}`,
    body: note || `${inc.title} — updated by ${actor.name}.`,
  });

  return true;
}

export async function assignIncident(incidentId: string, staffId: string, actor: { id: string; name: string }) {
  const inc = await db.incident.findUnique({ where: { id: incidentId } });
  if (!inc) throw new Error("Incident not found");
  const staff = await db.user.findUnique({ where: { id: staffId } });
  if (!staff) throw new Error("Staff not found");

  await db.incident.update({
    where: { id: incidentId },
    data: {
      assignedStaffId: staffId,
      departmentId: staff.departmentId ?? inc.departmentId,
      status: inc.status === "REPORTED" || inc.status === "AI_TRIAGED" ? "ASSIGNED" : inc.status,
      updatedAt: new Date(),
      history: {
        create: { action: "ASSIGNED", performedBy: actor.id, oldValue: inc.assignedStaffId ?? "", newValue: staff.name },
      },
    },
  });

  await notify({
    userIds: [staffId],
    incidentId,
    type: "assign",
    title: `INC-${inc.incidentNumber} assigned to you`,
    body: `${inc.title} needs your attention.`,
  });
}

export async function setPriority(incidentId: string, priority: Priority, actorId: string) {
  const inc = await db.incident.findUnique({ where: { id: incidentId } });
  if (!inc) throw new Error("Incident not found");
  const hours = priority === "Critical" ? 1 : priority === "High" ? 4 : priority === "Medium" ? 24 : 72;
  await db.incident.update({
    where: { id: incidentId },
    data: {
      priority,
      slaDeadline: ["RESOLVED", "VERIFIED", "CLOSED"].includes(inc.status) ? inc.slaDeadline : new Date(Date.now() + hours * 3600000),
      updatedAt: new Date(),
      history: { create: { action: "PRIORITY_CHANGED", performedBy: actorId, oldValue: inc.priority, newValue: priority } },
    },
  });
}

export async function resolveIncident(input: {
  incidentId: string;
  actor: { id: string };
  note: string;
  imageUrl?: string | null;
}) {
  const { incidentId, actor, note, imageUrl } = input;
  const inc = await db.incident.findUnique({ where: { id: incidentId }, include: { reports: true } });
  if (!inc) throw new Error("Incident not found");

  const originalText = inc.reports.map((r) => r.description).join(" ");
  const originalHasImage = inc.reports.some((r) => !!r.imageUrl);
  const verdict = verifyResolution({
    originalText,
    resolutionNote: input.note,
    hasResolutionImage: !!input.imageUrl,
    originalHasImage,
    reopenCount: inc.reopenCount,
  });

  await db.resolution.create({
    data: {
      incidentId,
      createdById: input.actor.id,
      description: input.note,
      resolutionImage: input.imageUrl ?? undefined,
      aiAppearsResolved: verdict.appearsResolved,
      aiVerificationNote: verdict.reason,
    },
  });

  if (input.imageUrl) {
    await db.attachment.create({
      data: { incidentId, uploadedBy: input.actor.id, kind: "resolution", url: input.imageUrl, caption: "Resolution evidence" },
    });
  }

  await db.incident.update({
    where: { id: incidentId },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      updatedAt: new Date(),
      escalationLevel: 0,
      history: {
        create: { action: "RESOLVED", performedBy: input.actor.id, oldValue: inc.status, newValue: verdict.appearsResolved ? "Resolved — AI evidence check passed" : "Resolved — AI evidence check flagged thin evidence" },
      },
    },
  });

  const reporters = await reporterIds(incidentId);
  const staff = await departmentUserIds(inc.departmentId);
  await notify({
    userIds: [...reporters, ...staff],
    incidentId,
    type: "resolved",
    title: `Is INC-${inc.incidentNumber} fixed?`,
    body: `Staff marked "${inc.title}" as resolved. ${verdict.appearsResolved ? "AI review of the evidence looks good." : "AI flagged the evidence as thin — please double-check."}`,
  });

  return verdict;
}

export async function confirmResolution(incidentId: string, confirmed: boolean, userId: string) {
  const inc = await db.incident.findUnique({ where: { id: incidentId } });
  if (!inc) throw new Error("Incident not found");

  if (confirmed) {
    await db.resolution.updateMany({
      where: { incidentId },
      data: { studentConfirmed: "CONFIRMED" },
    });
    await db.incident.update({
      where: { id: incidentId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        updatedAt: new Date(),
        history: {
          create: [
            { action: "VERIFIED", performedBy: userId, oldValue: "RESOLVED", newValue: "Confirmed fixed by reporter" },
            { action: "CLOSED", performedBy: userId, oldValue: "VERIFIED", newValue: "CLOSED" },
          ],
        },
      },
    });
    return { status: "CLOSED" as const };
  }

  await db.resolution.updateMany({ where: { incidentId }, data: { studentConfirmed: "REJECTED" } });
  const reopenCount = inc.reopenCount + 1;
  const bump: Priority = reopenCount >= 2 && inc.priority !== "Critical" ? PRIORITY_ORDER[Math.min(PRIORITY_ORDER.indexOf(inc.priority as Priority) + 1, 3)] : (inc.priority as Priority);
  await db.incident.update({
    where: { id: incidentId },
    data: {
      status: "IN_PROGRESS",
      resolvedAt: null,
      reopenCount,
      priority: bump,
      slaDeadline: await deadlineFor(bump),
      updatedAt: new Date(),
      history: { create: { action: "REOPENED", performedBy: userId, oldValue: "RESOLVED", newValue: `Reporter rejected the fix — reopened (attempt ${reopenCount})` } },
    },
  });

  const staff = await departmentUserIds(inc.departmentId);
  const admins = await allAdminIds();
  await notify({
    userIds: [...staff, ...admins],
    incidentId,
    type: "reopen",
    title: `INC-${inc.incidentNumber} reopened`,
    body: `The reporter says "${inc.title}" is still broken. Priority reconsidered: ${bump}.`,
  });

  return { status: "IN_PROGRESS" as const, priority: bump };
}

export async function mergeIncidents(sourceIds: string[], targetId: string, actor: { id: string; name: string }) {
  const target = await db.incident.findUnique({ where: { id: targetId } });
  if (!target) throw new Error("Target incident not found");

  for (const sourceId of sourceIds) {
    if (sourceId === targetId) continue;
    const source = await db.incident.findUnique({ where: { id: sourceId } });
    if (!source) continue;

    await db.report.updateMany({ where: { incidentId: sourceId }, data: { incidentId: targetId } });
    await db.comment.updateMany({ where: { incidentId: sourceId }, data: { incidentId: targetId } });
    await db.attachment.updateMany({ where: { incidentId: sourceId }, data: { incidentId: targetId } });
    await db.historyEntry.updateMany({ where: { incidentId: sourceId }, data: { incidentId: targetId } });

    await db.incident.update({
      where: { id: sourceId },
      data: {
        mergedIntoId: targetId,
        status: "DUPLICATE",
        history: { create: { action: "MERGED", performedBy: actor.id, oldValue: `INC-${source.incidentNumber}`, newValue: `Merged into INC-${target.incidentNumber}` } },
      },
    });

    await db.historyEntry.create({
      data: {
        incidentId: targetId,
        action: "MERGE_RECEIVED",
        performedBy: actor.id,
        oldValue: `INC-${source.incidentNumber}`,
        newValue: `${source.title} absorbed`,
      },
    });
  }

  const count = await db.report.count({ where: { incidentId: targetId } });
  await db.incident.update({ where: { id: targetId }, data: { duplicateCount: count, updatedAt: new Date() } });
  return count;
}

export async function addComment(incidentId: string, userId: string, message: string) {
  await db.comment.create({ data: { incidentId, userId, message } });
  const inc = await db.incident.findUnique({ where: { id: incidentId } });
  if (inc) {
    const reporters = await reporterIds(incidentId);
    await notify({
      userIds: reporters,
      incidentId,
      type: "comment",
      title: `New comment on INC-${inc.incidentNumber}`,
      body: message.slice(0, 140),
    });
  }
}

export function stepsFrom(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function prettyLocation(loc: { building: string; floor: string; room: string } | null | undefined) {
  if (!loc) return "Location pending";
  const label = locationLabel(loc);
  return label || "Location pending";
}
