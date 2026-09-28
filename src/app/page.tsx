import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return <Landing />;
}

function Landing() {
  const steps = [
    { n: "01", t: "Understand", d: "Natural language and a photo become a structured issue — category, severity, location, risk." },
    { n: "02", t: "Consolidate", d: "Twenty reports about the same projector become one incident with twenty pieces of evidence." },
    { n: "03", t: "Prioritize", d: "Severity, safety risk, affected people, location criticality and duplicates produce one score." },
    { n: "04", t: "Route", d: "The right department gets the work with an SLA clock already running." },
    { n: "05", t: "Resolve & verify", d: "Staff upload evidence, AI reviews it, the reporter confirms. No silent closes." },
    { n: "06", t: "Learn", d: "Recurring failures, hotspots and department backlogs surface as operational insight." },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% -10%, rgba(56,189,248,0.16), transparent 45%), radial-gradient(circle at 85% 0%, rgba(129,140,248,0.14), transparent 40%), linear-gradient(rgba(148,163,184,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.055) 1px, transparent 1px)",
          backgroundSize: "100% 100%, 100% 100%, 56px 56px, 56px 56px",
        }}
      />

      <header className="relative z-10 flex h-16 items-center justify-between px-6 md:px-12">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent font-bold text-[#04121d]">⚡</span>
          <span className="text-[15px] font-semibold tracking-tight">CampusFix AI</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg px-4 py-2 text-[13px] text-muted transition hover:text-ink">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-[#04121d] transition hover:bg-sky-300"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-14 md:px-12 md:pt-24">
        <div className="animate-fade">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-blip" />
            <span className="label-xs !text-[10px]">Intelligent campus operations platform</span>
          </div>

          <h1 className="max-w-4xl text-[40px] font-semibold leading-[1.04] tracking-tight md:text-[64px]">
            Something broken?
            <br />
            <span className="bg-gradient-to-r from-accent via-sky-400 to-accent2 bg-clip-text text-transparent">
              Tell us. We&apos;ll route it.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-[15.5px] leading-relaxed text-muted md:text-[17px]">
            CampusFix AI turns messy campus complaints into intelligent, prioritized, trackable incidents —
            automatically routing problems to the right team and verifying that they&apos;re actually fixed.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-[15px] font-semibold text-[#04121d] shadow-[0_10px_30px_-12px_rgba(56,189,248,0.7)] transition hover:bg-sky-300"
            >
              Open the demo campus →
            </Link>
            <Link
              href="/register"
              className="inline-flex h-12 items-center rounded-xl border border-line2 px-6 text-[15px] text-ink transition hover:bg-white/5"
            >
              Report an issue
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap gap-x-7 gap-y-2 text-[12px] text-faint">
            <span>student@demo.com · admin@demo.com · staff@demo.com</span>
            <span>password: demo1234</span>
          </div>
        </div>

        <div className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {steps.map((s, i) => (
            <div
              key={s.n}
              className="panel grain animate-rise p-5 transition hover:border-slate-500/40"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="num text-[11px] font-bold text-accent">{s.n}</div>
              <div className="mt-2.5 text-[15px] font-semibold tracking-tight">{s.t}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{s.d}</p>
            </div>
          ))}
        </div>

        <div className="panel mt-16 overflow-hidden">
          <div className="border-b border-line px-6 py-4">
            <div className="label-xs">The pipeline</div>
            <p className="mt-1 text-[14px] text-ink">Report → AI triage → duplicate merge → routing → SLA → resolution → verification → insight</p>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "Classification", v: "11 categories", d: "Keyword, hazard and context signals" },
              { k: "Priority engine", v: "0–100 score", d: "5 weighted, admin-configurable factors" },
              { k: "Duplicate detection", v: "Semantic + geo", d: "Location, category, recency, wording" },
              { k: "Verification loop", v: "Human confirmed", d: "AI evidence check + reporter sign-off" },
            ].map((x) => (
              <div key={x.k} className="bg-panel p-5">
                <div className="label-xs">{x.k}</div>
                <div className="num mt-2 text-[19px] font-semibold text-ink">{x.v}</div>
                <div className="mt-1 text-[12px] text-muted">{x.d}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-14 max-w-3xl text-[13px] leading-relaxed text-faint">
          Principle: <span className="text-muted">AI recommends. Humans remain accountable.</span> Every classification,
          priority and routing decision is shown with its confidence and can be overridden by staff.
        </p>
      </main>
    </div>
  );
}
