import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ReportComposer } from "@/components/report-composer";

export const dynamic = "force-dynamic";

export default async function ReportPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locations = await db.location.findMany({ orderBy: [{ building: "asc" }, { floor: "asc" }, { room: "asc" }] });

  return <ReportComposer locations={locations} canOverride={user.role === "ADMIN" || user.role === "STAFF"} />;
}
