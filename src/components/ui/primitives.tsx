import Link from "next/link";
import type { ReactNode } from "react";

export function Panel({
  children,
  className = "",
  title,
  action,
  description,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  title?: ReactNode;
  action?: ReactNode;
  description?: ReactNode;
  padded?: boolean;
}) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5">
          <div className="min-w-0">
            {title && <h2 className="text-[13px] font-semibold tracking-tight text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}
      <div className={padded ? "p-5" : ""}>{children}</div>
    </section>
  );
}

type ButtonVariant = "primary" | "ghost" | "outline" | "danger" | "accent";
type ButtonSize = "sm" | "md" | "lg";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-[#04121d] hover:bg-sky-300 disabled:bg-slate-600 disabled:text-slate-400 font-semibold shadow-[0_1px_0_rgba(255,255,255,0.25)_inset]",
  accent: "bg-accent2 text-white hover:bg-indigo-400 font-semibold",
  outline: "border border-line2 text-ink hover:bg-white/5 hover:border-slate-500",
  ghost: "text-muted hover:text-ink hover:bg-white/5",
  danger: "bg-rose-500/15 text-rose-300 border border-rose-500/40 hover:bg-rose-500/25",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12.5px] rounded-lg gap-1.5",
  md: "h-10 px-4 text-[13.5px] rounded-xl gap-2",
  lg: "h-12 px-6 text-[15px] rounded-xl gap-2",
};

export function buttonClass(variant: ButtonVariant = "outline", size: ButtonSize = "md", className = "") {
  return `inline-flex items-center justify-center whitespace-nowrap transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
}

export function Button({
  variant = "outline",
  size = "md",
  className = "",
  children,
  href,
  ...rest
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
  href?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = buttonClass(variant, size, className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className = "",
  pulse = false,
}: {
  children: ReactNode;
  tone?: "neutral" | "critical" | "high" | "medium" | "low" | "success" | "info" | "warn" | "muted";
  className?: string;
  pulse?: boolean;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-white/6 text-slate-300 border-white/10",
    critical: "bg-rose-500/15 text-rose-300 border-rose-500/40",
    high: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    medium: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    low: "bg-sky-500/15 text-sky-300 border-sky-500/40",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    info: "bg-indigo-500/15 text-indigo-300 border-indigo-500/40",
    warn: "bg-orange-500/15 text-orange-300 border-orange-500/40",
    muted: "bg-white/4 text-slate-400 border-white/8",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-[3px] text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}
    >
      {pulse && <span className="h-1.5 w-1.5 rounded-full bg-current animate-blip" />}
      {children}
    </span>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label-xs mb-1.5 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11.5px] text-faint">{hint}</span>}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line2 bg-bg2 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-faint outline-none transition focus:border-accent/60 focus:ring-2 focus:ring-accent/15";

export function Kpi({
  label,
  value,
  sub,
  tone = "neutral",
  accent,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "neutral" | "critical" | "high" | "medium" | "low" | "success";
  accent?: boolean;
}) {
  const toneMap: Record<string, string> = {
    neutral: "text-ink",
    critical: "text-rose-400",
    high: "text-orange-400",
    medium: "text-amber-300",
    low: "text-sky-300",
    success: "text-emerald-400",
  };
  return (
    <div className={`panel grain relative overflow-hidden p-4 ${accent ? "ring-1 ring-accent/30" : ""}`}>
      <div className="label-xs">{label}</div>
      <div className={`num mt-2 text-[30px] leading-none font-semibold ${toneMap[tone]}`}>{value}</div>
      {sub && <div className="mt-2 text-[11.5px] leading-tight text-muted">{sub}</div>}
    </div>
  );
}

export function Empty({ title, body, icon }: { title: string; body?: string; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-panel2 text-faint">
        {icon ?? "∅"}
      </div>
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-[12.5px] leading-relaxed text-muted">{body}</p>}
    </div>
  );
}

export function Meter({ value, max = 100, tone = "accent" }: { value: number; max?: number; tone?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
      <div
        className="h-full rounded-full transition-[width] duration-700"
        style={{ width: `${pct}%`, background: tone === "accent" ? "linear-gradient(90deg,#38bdf8,#818cf8)" : tone }}
      />
    </div>
  );
}
