import { NextRequest } from "next/server";
import { fail, ok, readJson, requireRole } from "@/lib/api";
import { answerCopilot, gatherFacts } from "@/lib/ai/copilot";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { error } = await requireRole(["ADMIN", "STAFF"]);
  if (error) return error;

  const body = await readJson(req);
  const question = String(body.question ?? "").trim();
  if (!question) return fail("Ask a question");

  const facts = await gatherFacts();
  const result = await answerCopilot(question, facts);
  return ok({ question, ...result, facts: { totals: facts.totals, resolutionRate: facts.resolutionRate } });
}
