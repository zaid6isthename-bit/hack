export type VerifyInput = {
  originalText: string;
  resolutionNote: string;
  hasResolutionImage: boolean;
  originalHasImage: boolean;
  reopenCount?: number;
};

const ACTION_WORDS = ["replaced", "replace", "fixed", "fix", "repair", "repaired", "restored", "cleaned", "tightened", "installed", "reinstalled", "rewired", "unclogged", "recharged", "tested", "working", "resolved", "cleared", "sealed", "realigned", "refilled", "unclogged"];

export function verifyResolution(input: VerifyInput): {
  appearsResolved: boolean;
  confidence: number;
  reason: string;
  score: number;
} {
  const note = input.resolutionNote.toLowerCase().trim();
  const signals: string[] = [];
  let score = 0;

  if (input.hasResolutionImage) {
    score += 0.32;
    signals.push("after-photo attached");
  }

  const matched = ACTION_WORDS.filter((w) => note.includes(w));
  if (matched.length) {
    score += 0.28;
    signals.push(`describes work done (${[...new Set(matched)].slice(0, 3).join(", ")})`);
  }

  if (note.length >= 60) {
    score += 0.16;
    signals.push("detailed hand note");
  } else if (note.length >= 25) {
    score += 0.08;
    signals.push("some detail in hand note");
  }

  if (input.originalHasImage && input.hasResolutionImage) {
    score += 0.14;
    signals.push("before and after evidence present");
  }

  if (input.reopenCount && input.reopenCount > 0) {
    score -= 0.12 * input.reopenCount;
    signals.push(`previously reopened ${input.reopenCount}×`);
  }

  if (!note) {
    score -= 0.2;
    signals.push("no technician note");
  }

  score = Math.max(0, Math.min(1, score));
  const appearsResolved = score >= 0.58;
  const confidence = Math.round(Math.max(0.4, Math.min(0.96, score)) * 100) / 100;

  const reason = appearsResolved
    ? `Evidence check passed: ${signals.join("; ")}. Final confirmation still rests with the reporter.`
    : `Evidence is thin: ${signals.length ? signals.join("; ") : "no supporting evidence supplied"}. Request a photo and a technician note.`;

  return { appearsResolved, confidence, reason, score: Math.round(score * 100) / 100 };
}
