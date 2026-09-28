import { ok, requireRole } from "@/lib/api";
import { buildOverview } from "@/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireRole(["ADMIN", "STAFF"]);
  if (error) return error;
  const data = await buildOverview();
  return ok({ health: data.health, totals: data.totals, insights: data.insights });
}