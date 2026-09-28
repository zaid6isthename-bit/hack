import { getCurrentUser } from "@/lib/auth";
import { db, ok } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return ok({ user: null });
  const full = await db.user.findUnique({
    where: { id: user.id },
    select: { id: true, name: true, email: true, role: true, departmentId: true, title: true, department: { select: { name: true } } },
  });
  return ok({ user: full });
}
