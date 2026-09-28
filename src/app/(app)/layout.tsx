import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar, Topbar, MobileNav } from "@/components/shell";
import type { Role } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const unread = await db.notification.count({ where: { userId: user.id, read: false } });
  const rawMe = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, department: { select: { name: true } } },
  });
  const me = rawMe ? { ...rawMe, role: rawMe.role as Role } : null;

  return (
    <div className="flex min-h-screen">
      <Sidebar me={me} unread={unread} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar me={me} unread={unread} />
        <main className="flex-1 px-4 pt-6 pb-24 md:px-7 md:pb-10">{children}</main>
        <MobileNav me={me} />
      </div>
    </div>
  );
}
