import { NextRequest } from "next/server";
import { db, fail, ok, readJson } from "@/lib/api";
import { createSession, hashPassword } from "@/lib/auth";
import { notify } from "@/lib/notify";
import type { Role } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = await readJson(req);
  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = (String(body.role ?? "STUDENT") as Role).toUpperCase() as Role;
  const departmentId = body.departmentId ? String(body.departmentId) : undefined;

  if (!name || name.length < 2) return fail("Please enter your full name");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return fail("Enter a valid college email");
  if (password.length < 6) return fail("Password must be at least 6 characters");

  const allowed: Role[] = ["STUDENT", "FACULTY"];
  if (!allowed.includes(role)) return fail("Self-registration is limited to students and faculty");

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return fail("An account with this email already exists", 409);

  const user = await db.user.create({
    data: { name, email, passwordHash: hashPassword(password), role, departmentId },
  });

  await createSession(user.id);
  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await notify({
    userIds: admins.map((a) => a.id),
    type: "signup",
    title: "New account registered",
    body: `${name} joined as ${role.toLowerCase()}.`,
  });

  return ok({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
