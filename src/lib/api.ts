import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { db } from "./db";
import { getCurrentUser, getSessionUserId, type SessionUser } from "./auth";
import type { Role } from "./types";

export function ok(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}

export function fail(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function requireRole(roles?: Role[]): Promise<{ user: SessionUser; error: null } | { user: null; error: Response }> {
  const user = await getCurrentUser();
  if (!user) return { user: null, error: fail("Not authenticated", 401) };
  if (roles && !roles.includes(user.role)) return { user: null, error: fail("Not authorized for this action", 403) };
  return { user, error: null };
}

export async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export async function bodySizeOk(req: NextRequest, limit = 6 * 1024 * 1024) {
  const len = Number(req.headers.get("content-length") ?? 0);
  return len === 0 || len <= limit;
}

export { getSessionUserId, db };
