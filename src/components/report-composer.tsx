"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Sparkles,
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Link2,
  FilePlus2,
} from "lucide-react";
import { inputClass, buttonClass, Badge } from "@/components/ui/primitives";
import { PriorityBadge, ConfidenceBar } from "@/components/badges";
import { CATEGORY_COLORS } from "@/lib/types";

type Location = { id: string; building: string; floor: string; room: string; critical: number };
type Analysis = {
  analysis: {
    category: string;
    subcategory: string;
    severity: number;
    severityLabel: string;
    risk: string;
    department: string;
    summary: string;
    title: string;
    confidence: number;
    affectedUsers: number;
    suggestedAction: string;
    suggestedSteps: string[];
    safetySensitive: boolean;
  };
  locationId: string | null;
  location: Location | null;
  departmentName: string;
  priority: string;
  priorityScore: number;
  source: string;
  duplicates: {
    incidentId: string;
    incidentNumber: number;
    title: string;
    similarity: number;
    reason: string;
    status: string;
    reportCount: number;
  }[];
  lowConfidence: boolean;
};

const STAGES = [
  "Reading your description…",
  "Extracting category and severity…",
  "Locating the affected room…",
  "Scoring priority against SLA weights…",
  "Searching existing incidents for duplicates…",
];

export function ReportComposer({ locations, canOverride }: { locations: Location[]; canOverride: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [text, setText] = useState("");
  const [locationId, setLocationId] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [stage, setStage] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [joinId, setJoinId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const buildings = [...new Set(locations.map((l) => l.building))];
  const selectedBuilding = locations.find((l) => l.id === locationId)?.building ?? "";
  const roomOptions = locations.filter((l) => l.building === selectedBuilding);

  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        setUploading(false);
        return;
      }
      setImageUrl(data.url);
    } catch {
      setError("Upload failed — check the file type and size");
    }
    setUploading(false);
  }

  async function analyze() {
    if (text.trim().length < 8) {
      setError("Describe the problem in at least a sentence first.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    setJoinId(null);
    setStage(0);

    const ticker = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 620);
    try {
      const res = await fetch("/api/ai/analyze-report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ description: text, locationId: locationId || undefined, imageUrl }),
      });
      const data = await res.json();
      clearInterval(ticker);
      if (!res.ok) {
        setError(data.error ?? "Analysis failed");
        setBusy(false);
        return;
      }
      setResult(data);
      if (data.duplicates?.length) setJoinId(data.duplicates[0].incidentId);
    } catch {
      clearInterval(ticker);
      setError("AI analysis unavailable. Your report can still be submitted for manual review.");
    }
    setBusy(false);
  }

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description: text,
          locationId: locationId || undefined,
          imageUrl,
          joinIncidentId: joinId,
          analysisOverride: result
            ? {
                title: result.analysis.title,
                category: result.analysis.category,
                priority: result.priority,
                department: result.analysis.department,
                severityLabel: result.analysis.severityLabel,
                risk: result.analysis.risk,
                suggestedAction: result.analysis.suggestedAction,
                confidence: result.analysis.confidence,
              }
            : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not submit the report");
        setSubmitting(false);
        return;
      }
      router.push(`/incidents/${data.incidentId}`);
      router.refresh();
    } catch {
      setError("Network error — your report was not submitted.");
      setSubmitting(false);
    }
  }

  const stageIndex = Math.min(stage, STAGES.length - 1);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-[26px] font-semibold tracking-tight">What happened?</h1>
        <p className="mt-1.5 text-[14px] text-muted">
          Describe it the way you would tell a friend. The AI extracts the category, severity, location and the team
          that should handle it.
        </p>
      </div>

      <div className="panel grain overflow-hidden">
        <div className="p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="e.g. The AC in classroom 302 has been leaking since this morning and water is collecting near the electrical socket."
            className="w-full resize-y bg-transparent text-[15.5px] leading-relaxed text-ink outline-none placeholder:text-faint"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) analyze();
            }}
          />

          <div className="mt-4 flex flex-wrap items-center gap-2.5 border-t border-line pt-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className={buttonClass("outline", "sm")}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              {uploading ? "Uploading…" : imageUrl ? "Change photo" : "Add photo"}
            </button>

            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-line bg-bg2 px-3 py-1.5">
              <MapPin size={14} className="shrink-0 text-faint" />
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full bg-transparent py-1 text-[13px] text-ink outline-none"
              >
                <option value="">Choose a location (optional — AI can infer it)</option>
                {buildings.map((b) => (
                  <optgroup key={b} label={b}>
                    {locations
                      .filter((l) => l.building === b)
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.room ? `${l.room}${l.floor ? ` · Floor ${l.floor}` : ""}` : l.building}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              onClick={analyze}
              disabled={busy}
              className={buttonClass("primary", "md", "min-w-[150px]")}
            >
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {busy ? "Analyzing…" : "Analyze with AI"}
            </button>
          </div>

          {imageUrl && (
            <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-bg2 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Evidence" className="h-16 w-24 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] font-medium text-ink">Evidence photo attached</div>
                <div className="text-[11.5px] text-faint">Sent with the report for AI context and later comparison.</div>
              </div>
              <button onClick={() => setImageUrl(null)} className="text-faint hover:text-ink">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {busy && (
          <div className="border-t border-line bg-accent/5 px-5 py-4">
            <div className="flex items-center gap-3">
              <Loader2 size={15} className="animate-spin text-accent" />
              <span className="text-[13px] text-accent">{STAGES[stageIndex]}</span>
            </div>
            <div className="mt-3 h-[3px] w-full overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent2 transition-all duration-500"
                style={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="border-t border-rose-500/30 bg-rose-500/8 px-5 py-3.5 text-[12.5px] text-rose-300">{error}</div>
        )}
      </div>

      {result && (
        <div className="mt-5 space-y-4 animate-rise">
          {result.duplicates.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-amber-500/40 bg-amber-500/8">
              <div className="flex items-start gap-3 px-5 py-4">
                <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-300" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-semibold text-amber-200">Possible existing issue found</span>
                    <Badge tone="medium">{Math.round(result.duplicates[0].similarity * 100)}% similarity</Badge>
                  </div>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-amber-200/80">
                    A similar issue was reported recently. Joining it keeps one trackable incident instead of two.
                  </p>

                  <div className="mt-3 space-y-2">
                    {result.duplicates.slice(0, 3).map((d) => (
                      <button
                        key={d.incidentId}
                        onClick={() => setJoinId(d.incidentId)}
                        className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left transition ${
                          joinId === d.incidentId
                            ? "border-amber-400/70 bg-amber-400/12"
                            : "border-line bg-bg2 hover:border-amber-400/40"
                        }`}
                      >
                        <span className="min-w-0">
                          <span className="num block text-[11.5px] font-bold text-amber-300">INC-{d.incidentNumber}</span>
                          <span className="block truncate text-[13px] text-ink">{d.title}</span>
                          <span className="block truncate text-[11.5px] text-faint">{d.reason}</span>
                        </span>
                        <span className="num shrink-0 text-[13px] font-semibold text-amber-300">
                          {Math.round(d.similarity * 100)}%
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button onClick={() => setJoinId(result.duplicates[0].incidentId)} className={buttonClass("primary", "sm")}>
                      <Link2 size={14} /> Join existing incident
                    </button>
                    <button onClick={() => setJoinId(null)} className={buttonClass("outline", "sm")}>
                      <FilePlus2 size={14} /> Create new incident
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="panel grain">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <Sparkles size={15} className="text-accent" />
                <span className="text-[13px] font-semibold">We&apos;ve understood your issue as</span>
              </div>
              <Badge tone={result.source === "hybrid" ? "info" : "neutral"}>
                {result.source === "hybrid" ? "LLM + rules" : "Rules engine"}
              </Badge>
            </div>

            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2.5">
                <PriorityBadge priority={result.priority} pulse={result.priority === "Critical"} />
                <span className="text-[17px] font-semibold tracking-tight">{result.analysis.title}</span>
              </div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{result.analysis.summary}</p>

              <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { k: "Category", v: result.analysis.category },
                  { k: "Priority", v: `${result.priority} · ${result.priorityScore}/100` },
                  { k: "Department", v: result.departmentName || result.analysis.department },
                  { k: "Location", v: result.location ? `${result.location.room || "—"} ${result.location.building}` : "Will be inferred" },
                  { k: "Severity", v: `Level ${result.analysis.severity} / 5` },
                  { k: "Risk", v: result.analysis.risk },
                  { k: "Affected", v: `~${result.analysis.affectedUsers} people` },
                  { k: "SLA clock", v: result.priority === "Critical" ? "1 hour" : result.priority === "High" ? "4 hours" : result.priority === "Medium" ? "24 hours" : "72 hours" },
                ].map((row) => (
                  <div key={row.k} className="bg-panel px-4 py-3">
                    <div className="label-xs">{row.k}</div>
                    <div className="mt-1 truncate text-[13.5px] font-medium text-ink" style={row.k === "Category" ? { color: CATEGORY_COLORS[result.analysis.category] ?? "#e6edf6" } : undefined}>
                      {row.v}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-5 md:grid-cols-[1fr_240px]">
                <div className="rounded-xl border border-line bg-bg2 p-4">
                  <div className="label-xs mb-2">AI suggested action</div>
                  <p className="text-[13.5px] font-medium text-ink">{result.analysis.suggestedAction}</p>
                  <ol className="mt-3 space-y-1.5">
                    {result.analysis.suggestedSteps.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-[12.5px] leading-relaxed text-muted">
                        <span className="num shrink-0 text-accent">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                  {result.analysis.safetySensitive && (
                    <p className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/8 px-3 py-2 text-[11.5px] leading-relaxed text-rose-300">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                      Safety-sensitive: do not attempt repairs yourself. Authorized staff must handle this.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-line bg-bg2 p-4">
                  <ConfidenceBar value={result.analysis.confidence} />
                  {result.lowConfidence && (
                    <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11.5px] leading-relaxed text-amber-200">
                      AI could not confidently classify this issue. Staff will review it manually.
                    </p>
                  )}
                  {canOverride && (
                    <p className="mt-3 text-[11.5px] leading-relaxed text-faint">
                      You can override category, priority and department from the incident page after submitting.
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
                <button onClick={submit} disabled={submitting} className={buttonClass("primary", "lg")}>
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                  {submitting ? "Submitting…" : joinId ? "Join existing incident" : "Submit report"}
                  {!submitting && <ArrowRight size={15} />}
                </button>
                <button onClick={() => setResult(null)} className={buttonClass("ghost", "md")}>
                  Edit description
                </button>
                <span className="text-[11.5px] text-faint">
                  You can add comments and evidence after submission.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
