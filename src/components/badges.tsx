import { Badge } from "./ui/primitives";
import type { Priority, Status } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/types";

export function PriorityBadge({ priority, pulse }: { priority: string; pulse?: boolean }) {
  const tone =
    priority === "Critical" ? "critical" : priority === "High" ? "high" : priority === "Medium" ? "medium" : "low";
  return (
    <Badge tone={tone as never} pulse={pulse}>
      <span className="uppercase">{priority}</span>
    </Badge>
  );
}

const STATUS_TONES: Record<string, "neutral" | "info" | "warn" | "success" | "critical" | "muted"> = {
  REPORTED: "neutral",
  AI_TRIAGED: "info",
  ASSIGNED: "info",
  ACKNOWLEDGED: "info",
  IN_PROGRESS: "warn",
  RESOLVED: "success",
  VERIFIED: "success",
  CLOSED: "muted",
  REJECTED: "critical",
  DUPLICATE: "muted",
  ON_HOLD: "warn",
  ESCALATED: "critical",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={STATUS_TONES[status] ?? "neutral"}>
      {STATUS_LABELS[status as Status] ?? status.replace(/_/g, " ")}
    </Badge>
  );
}

export function CategoryBadge({ category, color }: { category: string; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md border px-2 py-[3px] text-[11px] font-semibold"
      style={{
        color: color ?? "#94a3b8",
        borderColor: `${color ?? "#94a3b8"}44`,
        background: `${color ?? "#94a3b8"}18`,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color ?? "#94a3b8" }} />
      {category}
    </span>
  );
}

export function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round((value ?? 0) * 100);
  const tone = pct >= 80 ? "#34d399" : pct >= 60 ? "#fbbf24" : "#f87171";
  const label = pct >= 80 ? "High confidence" : pct >= 60 ? "Review suggested" : "Manual review required";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="label-xs">AI confidence</span>
        <span className="num text-[13px] font-semibold" style={{ color: tone }}>
          {pct}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${pct}%`, background: tone }} />
      </div>
      <p className="mt-1.5 text-[11px] text-faint">{label}</p>
    </div>
  );
}

export function PriorityDot({ priority }: { priority: Priority }) {
  const map: Record<string, string> = {
    Critical: "#f43f5e",
    High: "#f97316",
    Medium: "#eab308",
    Low: "#38bdf8",
  };
  return <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: map[priority] ?? "#94a3b8" }} />;
}
