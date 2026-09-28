import { ok, requireRole } from "@/lib/api";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireRole();
  if (error) return error;

  const locations = await db.location.findMany({
    orderBy: [{ building: "asc" }, { floor: "asc" }, { room: "asc" }],
    include: { _count: { select: { incidents: true } } },
  });
  const buildings = [...new Set(locations.map((l) => l.building))];
  return ok({ locations, buildings });
}
