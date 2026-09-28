"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  PenLine,
  Ticket,
  Users,
  ShieldCheck,
  BarChart3,
  Map,
  Settings,
  Bell,
  LogOut,
  Zap,
  Building2,
  MessageSquare,
  ChevronLeft,
} from "lucide-react";
import type { Role } from "@/lib/types";

type Me = { id: string; name: string; email: string; role: Role; department?: { name: string } | null } | null;

const NAV: {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  roles: Role[];
  group: string;
}[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["STUDENT", "FACULTY", "STAFF", "ADMIN"], group: "Overview" },
  { href: "/report", label: "Report an issue", icon: PenLine, roles: ["STUDENT", "FACULTY", "STAFF", "ADMIN"], group: "Overview" },
  { href: "/reports", label: "My reports", icon: Ticket, roles: ["STUDENT", "FACULTY"], group: "Overview" },
  { href: "/feed", label: "Issue feed", icon: MessageSquare, roles: ["STUDENT", "FACULTY", "STAFF", "ADMIN"], group: "Operations" },
  { href: "/staff", label: "Work queue", icon: Users, roles: ["STAFF", "ADMIN"], group: "Operations" },
  { href: "/admin", label: "Campus operations", icon: ShieldCheck, roles: ["ADMIN"], group: "Operations" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, roles: ["ADMIN", "STAFF"], group: "Operations" },
  { href: "/admin/map", label: "Campus map", icon: Map, roles: ["ADMIN"], group: "Management" },
  { href: "/admin/people", label: "People & departments", icon: Building2, roles: ["ADMIN"], group: "Management" },
  { href: "/admin/settings", label: "SLA & AI config", icon: Settings, roles: ["ADMIN"], group: "Management" },
  { href: "/notifications", label: "Notifications", icon: Bell, roles: ["STUDENT", "FACULTY", "STAFF", "ADMIN"], group: "You" },
];

export function Sidebar({ me, unread }: { me: Me; unread: number }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const role = me?.role ?? "STUDENT";
  const items = NAV.filter((n) => n.roles.includes(role));

  const groups = [...new Set(items.map((i) => i.group))];

  return (
    <aside
      className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-line bg-bg2 transition-all duration-200 md:flex ${
        collapsed ? "w-[70px]" : "w-[236px]"
      }`}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-line px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-[#04121d]">
          <Zap size={17} strokeWidth={2.6} />
        </span>
        {!collapsed && (
          <div className="min-w-0">
            <div className="truncate text-[13.5px] font-semibold tracking-tight">CampusFix AI</div>
            <div className="label-xs !text-[9px]">Campus operations</div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-4">
        {groups.map((group) => (
          <div key={group} className="mb-5">
            {!collapsed && <div className="label-xs mb-2 px-2.5">{group}</div>}
            <ul className="space-y-1">
              {items
                .filter((i) => i.group === group)
                .map((item) => {
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] transition ${
                          active
                            ? "bg-accent/12 text-accent font-medium"
                            : "text-muted hover:bg-white/4 hover:text-ink"
                        }`}
                      >
                        {active && <span className="absolute left-0 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-accent" />}
                        <Icon size={16} strokeWidth={2} className="shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                        {!collapsed && item.href === "/notifications" && unread > 0 && (
                          <span className="num ml-auto rounded-full bg-rose-500 px-1.5 py-[1px] text-[10px] font-bold text-white">
                            {unread > 99 ? "99+" : unread}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </div>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex h-10 items-center justify-center gap-2 border-t border-line text-[11.5px] text-faint transition hover:text-ink"
      >
        <ChevronLeft size={14} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
        {!collapsed && "Collapse"}
      </button>
    </aside>
  );
}

export function Topbar({ me, unread }: { me: Me; unread: number }) {
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-line bg-bg/85 px-4 backdrop-blur-xl md:px-7">
      <div className="flex items-center gap-3 md:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-[#04121d]">
          <Zap size={16} strokeWidth={2.6} />
        </span>
        <span className="text-[13.5px] font-semibold">CampusFix AI</span>
      </div>

      <div className="hidden items-center gap-2 md:flex">
        <span className="label-xs">Signed in as</span>
        <span className="text-[13px] font-medium text-ink">{me?.name}</span>
        <span className="rounded-md border border-line bg-panel2 px-2 py-[2px] text-[10.5px] font-semibold tracking-wider text-accent">
          {me?.role}
        </span>
        {me?.department?.name && <span className="text-[11.5px] text-faint">· {me.department.name}</span>}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted transition hover:border-line2 hover:text-ink"
          aria-label="Notifications"
        >
          <Bell size={16} />
          {unread > 0 && (
            <span className="num absolute -right-1 -top-1 min-w-[16px] rounded-full bg-rose-500 px-1 text-[9.5px] font-bold leading-4 text-white">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Link>

        <Link
          href="/report"
          className="hidden h-9 items-center gap-1.5 rounded-lg bg-accent px-3.5 text-[12.5px] font-semibold text-[#04121d] transition hover:bg-sky-300 sm:inline-flex"
        >
          <PenLine size={14} strokeWidth={2.4} /> Report
        </Link>

        <div className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            className="flex h-9 items-center gap-2 rounded-lg border border-line px-2.5 text-[12.5px] text-muted transition hover:text-ink"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent2/20 text-[11px] font-bold text-accent2">
              {me?.name?.charAt(0) ?? "?"}
            </span>
            <span className="hidden max-w-[110px] truncate sm:inline">{me?.name}</span>
          </button>
          {menu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenu(false)} />
              <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-line2 bg-panel2 shadow-2xl animate-fade">
                <div className="border-b border-line px-4 py-3">
                  <div className="truncate text-[13px] font-medium">{me?.name}</div>
                  <div className="truncate text-[11.5px] text-faint">{me?.email}</div>
                </div>
                <Link href="/reports" onClick={() => setMenu(false)} className="block px-4 py-2.5 text-[12.5px] text-muted hover:bg-white/5 hover:text-ink">
                  My reports
                </Link>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[12.5px] text-rose-300 hover:bg-rose-500/10"
                >
                  <LogOut size={14} /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileNav({ me }: { me: Me }) {
  const pathname = usePathname();
  const role = me?.role ?? "STUDENT";
  const [items, setItems] = useState<{ href: string; label: string; icon: React.ComponentType<{ size?: number }> }[]>([]);

  useEffect(() => {
    const relevant =
      role === "ADMIN"
        ? ["/dashboard", "/report", "/feed", "/admin", "/notifications"]
        : role === "STAFF"
          ? ["/dashboard", "/report", "/feed", "/staff", "/notifications"]
          : ["/dashboard", "/report", "/reports", "/feed", "/notifications"];
    setItems(NAV.filter((n) => relevant.includes(n.href)).map(({ href, label, icon }) => ({ href, label, icon })));
  }, [role]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-line bg-bg2/95 backdrop-blur-xl md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-[9.5px] font-medium tracking-wide uppercase ${
              active ? "text-accent" : "text-faint"
            }`}
          >
            <Icon size={17} />
            {item.label.split(" ")[0]}
          </Link>
        );
      })}
    </nav>
  );
}
