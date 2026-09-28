import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fail } from "@/lib/api";

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

export async function GET(_req: NextRequest, ctx: RouteContext<"/api/uploads/[name]">) {
  const user = await getCurrentUser();
  if (!user) return fail("Not authenticated", 401);

  const { name } = await ctx.params;
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return fail("Invalid file name", 400);

  try {
    const buffer = await readFile(path.join(process.cwd(), "uploads", name));
    const ext = path.extname(name).toLowerCase();
    return new Response(new Uint8Array(buffer), {
      headers: {
        "content-type": MIME[ext] ?? "application/octet-stream",
        "cache-control": "private, max-age=3600",
      },
    });
  } catch {
    return fail("File not found", 404);
  }
}
