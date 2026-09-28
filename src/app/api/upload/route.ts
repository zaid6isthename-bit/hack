import { NextRequest } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { fail, ok, requireRole } from "@/lib/api";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const MAX = 4 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const { error } = await requireRole();
  if (error) return error;

  const form = await req.formData().catch(() => null);
  if (!form) return fail("Expected multipart form data");

  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file supplied");
  if (!ALLOWED.has(file.type)) return fail("Only JPEG, PNG, WebP or GIF images are allowed");
  if (file.size > MAX) return fail("Image must be under 4MB");

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : file.type === "image/gif" ? "gif" : "jpg";
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);

  return ok({ url: `/api/uploads/${name}`, size: file.size, type: file.type });
}
