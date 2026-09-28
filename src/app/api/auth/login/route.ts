import { NextRequest } from "next/server";
import { db, fail, ok, readJson } from "@/lib/api";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  if (!email || !password) return fail("Email and password are required");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !verifyPassword(password, user.passwordHash)) return fail("Invalid email or password", 401);

  await createSession(user.id);
  return ok({
    user: { id: user.id, name: user.name, email: user.email, role: user.role, departmentId: user.departmentId },
  });
}
