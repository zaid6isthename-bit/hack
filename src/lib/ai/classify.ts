import type { AIAnalysis } from "../types";

type Rule = {
  category: string;
  subcategory: string;
  keywords: { w: number; k: string[] }[];
};

const RULES: Rule[] = [
  {
    category: "Safety",
    subcategory: "Hazard",
    keywords: [
      { w: 5, k: ["fire", "smoke", "burning", "sparking", "spark", "live wire", "exposed wire", "electric shock", "shock", "short circuit", "gas leak", "emergency", "collapse", "collapsing", "ceiling caving"] },
      { w: 4, k: ["hazard", "dangerous", "unsafe", "risk of", "catching fire"] },
    ],
  },
  {
    category: "Electrical",
    subcategory: "Power & Fixtures",
    keywords: [
      { w: 4, k: ["fan not working", "fan stopped", "ceiling fan", "fan is", "fans not", "speed fan", "fan"] },
      { w: 4, k: ["light not", "lights not", "bulb", "tube light", "light is off", "lights are", "lamp"] },
      { w: 3, k: ["socket", "switch board", "power outlet", "extension", "mcb", "wiring", "wire", "electricity", "power cut", "power outage", "no power", "electric"] },
      { w: 2, k: ["plug", "voltage", "current", "inverter"] },
    ],
  },
  {
    category: "Plumbing",
    subcategory: "Water Supply",
    keywords: [
      { w: 5, k: ["leak", "leaking", "leakage", "dripping", "water leaking", "water leak"] },
      { w: 4, k: ["tap", "faucet", "toilet", "washroom", "urinal", "flush", "drain", "pipe", "sewage", "clog", "blocked sink", "water tank"] },
      { w: 2, k: ["water pressure", "no water", "water supply"] },
    ],
  },
  {
    category: "HVAC",
    subcategory: "Air Conditioning",
    keywords: [
      { w: 5, k: ["ac not", "a/c", "air conditioner", "air conditioning", "ac is", "ac leaking", "ac leak", "cooling", "ac unit", "ac "] },
      { w: 3, k: ["heater", "ventilator", "exhaust fan", "temperature", "humid"] },
    ],
  },
  {
    category: "IT / Network",
    subcategory: "Network",
    keywords: [
      { w: 5, k: ["wifi", "wi-fi", "wi fi", "internet", "network", "ethernet", "router", "hotspot", "no net", "slow internet", "lag"] },
      { w: 4, k: ["projector", "display", "hdmi", "screen mirroring", "no display", "monitor"] },
      { w: 3, k: ["computer", "laptop", "printer", "server", "software", "login", "password reset", "system is", "lab system"] },
    ],
  },
  {
    category: "Lab Equipment",
    subcategory: "Equipment",
    keywords: [
      { w: 5, k: ["microscope", "oscilloscope", "multimeter", "centrifuge", "spectrometer", "bunsen", "burner", "lab equipment", "reagent", "chemical spill", "apparatus"] },
      { w: 3, k: ["lab", "experiment", "practical"] },
    ],
  },
  {
    category: "Cleaning",
    subcategory: "Housekeeping",
    keywords: [
      { w: 5, k: ["dirty", "dust", "garbage", "trash", "litter", "stain", "spill", "spillage", "unhygienic", "smelly", "smell bad", "stench", "not cleaned", "sweep"] },
      { w: 3, k: ["cleaning", "clean the", "dusty", "cobweb"] },
    ],
  },
  {
    category: "Furniture",
    subcategory: "Classroom Furniture",
    keywords: [
      { w: 5, k: ["chair", "desk", "bench", "table", "stool", "blackboard", "whiteboard", "dais", "cupboard", "shelf"] },
      { w: 3, k: ["furniture", "seat is broken", "wobbly"] },
    ],
  },
  {
    category: "Infrastructure",
    subcategory: "Building",
    keywords: [
      { w: 5, k: ["window", "door", "roof", "ceiling", "wall", "tile", "glass", "shutter", "crack", "cracked", "paint", "plaster", "railing", "staircase", "leak from ceiling"] },
      { w: 3, k: ["building", "corridor", "floor is", "structural"] },
    ],
  },
  {
    category: "Security",
    subcategory: "Safety & Access",
    keywords: [
      { w: 5, k: ["theft", "stolen", "suspicious", "stranger", "harassment", "cctv", "camera not", "security guard", "gate not", "broken lock", "lost id", "unauthorized"] },
      { w: 3, k: ["security", "entry", "parking", "vehicle"] },
    ],
  },
];

const HAZARDS: { label: string; k: string[] }[] = [
  { label: "Electrical hazard", k: ["spark", "sparking", "live wire", "exposed wire", "socket", "short circuit", "electric", "shock", "wet near", "water near", "water close"] },
  { label: "Fire risk", k: ["fire", "smoke", "burning", "burn"] },
  { label: "Slip / fall hazard", k: ["leak", "leaking", "water on floor", "wet floor", "spill", "slippery"] },
  { label: "Structural risk", k: ["ceiling", "roof", "crack", "collapse", "plaster", "glass"] },
  { label: "Health hazard", k: ["garbage", "sewage", "stagnant", "smell", "hygiene", "urine", "mould", "mold"] },
  { label: "Security risk", k: ["theft", "stolen", "suspicious", "harassment", "unauthorized", "lock"] },
  { label: "Water damage", k: ["leakage", "dripping", "tank overflow", "flooding", "flood"] },
];

const URGENCY = ["immediately", "urgent", "asap", "emergency", "danger", "hazardous", "unsafe", "flooding", "flood", "sparking", "sparks", "smoke", "fire", "whole floor", "entire", "completely", "totally", "all the", "stopped working", "since morning", "not at all", "major", "severe", "critical"];
const LOW_WORDS = ["minor", "slight", "small", "little", "sometimes", "occasionally", "cosmetic", "aesthetic", "dust", "paint", "flicker", "wobbly"];

const BUILDINGS = ["main block", "block a", "block b", "block c", "block d", "science block", "lab block", "library", "hostel", "canteen", "auditorium", "seminar hall", "admin block", "workshop", "gymkhana"];

function norm(text: string) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

export function parseLocation(text: string) {
  const t = text.toLowerCase();
  const out = { building: "", floor: "", room: "", explicit: false };

  const room =
    t.match(/(?:room|classroom|class room|lab|laboratory|hall|office|lecture)\s*(?:no\.?|number|#)?\s*([a-z]?\s?\d{1,4})\b/)?.[1] ??
    t.match(/\b([a-z]?\d{2,4})\b(?=\s*(?:is|has|was|room|floor|hall))/)?.[1];
  if (room) {
    out.room = room.replace(/\s/g, "").toUpperCase();
    out.explicit = true;
  }

  const floor = t.match(/\b(?:floor|storey)\s*(?:no\.?|number)?\s*(\d{1,2})\b/)?.[1] ?? t.match(/\b(\d{1,2})(?:st|nd|rd|th)\s*floor\b/)?.[1];
  if (floor) {
    out.floor = floor;
    out.explicit = true;
  }

  const block = t.match(/\bblock\s*([a-z])\b/)?.[1];
  const named = BUILDINGS.find((b) => t.includes(` ${b} `));
  if (block) {
    out.building = `Block ${block.toUpperCase()}`;
    out.explicit = true;
  } else if (named) {
    out.building = named.replace(/\b\w/g, (c) => c.toUpperCase());
    out.explicit = true;
  } else if (/seminar hall/.test(t)) {
    out.building = "Seminar Hall";
    out.explicit = true;
  }

  return out;
}

export function locationLabel(loc: { building: string; floor: string; room: string }) {
  const parts = [loc.room ? `Room ${loc.room}` : "", loc.floor ? `Floor ${loc.floor}` : "", loc.building].filter(Boolean);
  return parts.join(", ");
}

const PLAYBOOKS: Record<string, { action: string; steps: string[] }> = {
  Safety: {
    action: "Restrict access to the affected area immediately and escalate to the duty officer.",
    steps: [
      "Keep people away from the hazard and do not touch the affected fixture",
      "Cut power to the circuit from the distribution board only if it is safe to do so",
      "Notify the department head and campus security by phone",
      "Log the time the hazard was first observed",
    ],
  },
  Electrical: {
    action: "Isolate the circuit if safe, then have a licensed electrician inspect the fixture.",
    steps: [
      "Confirm whether other points on the same circuit are affected",
      "Switch off the local breaker and do not attempt internal repairs yourself",
      "Record the fixture ID and any visible damage",
      "Escalate to the electrician if the fault repeats after reset",
    ],
  },
  Plumbing: {
    action: "Shut off the local valve, contain the water, and dispatch a plumber.",
    steps: [
      "Close the nearest shut-off valve to stop further leakage",
      "Contain or mop standing water to prevent slip hazards",
      "Photograph the source of the leak before any repair",
      "Check whether adjacent rooms show the same symptom",
    ],
  },
  HVAC: {
    action: "Inspect the unit drainage and isolate nearby electrical outlets if water is present.",
    steps: [
      "Switch the unit off and disconnect power at the wall",
      "Check the drain pan and condensate line for blockage",
      "Keep the area below the unit dry and clear",
      "Escalate to facilities for a refrigerant or compressor check",
    ],
  },
  "IT / Network": {
    action: "Verify power and cabling first, then escalate to IT if the fault persists.",
    steps: [
      "Check power, indicator lights, and cable seating at both ends",
      "Restart the device or access point once and retest",
      "Note the exact error message or LED pattern",
      "Raise to IT support with the device identifier if unresolved",
    ],
  },
  "Lab Equipment": {
    action: "Tag the equipment out of service and notify the laboratory technician.",
    steps: [
      "Label the equipment as out of service to prevent use",
      "Record the model and any error codes displayed",
      "Check whether calibration or consumables are the cause",
      "Escalate to the lab technician before any practical session",
    ],
  },
  Cleaning: {
    action: "Raise a housekeeping task with the affected area and re-check after the next sweep.",
    steps: [
      "Mark the spot for the next cleaning cycle",
      "Photograph the area for verification",
      "Check whether the issue recurs at the same location",
      "Escalate if the same spot fails two consecutive cycles",
    ],
  },
  Furniture: {
    action: "Tag the item for repair or replacement and provide an alternate seat.",
    steps: [
      "Remove the damaged item from use if unsafe",
      "Arrange alternate seating for the next session",
      "Record an asset tag if one is present",
      "Request repair or replacement from the maintenance store",
    ],
  },
  Infrastructure: {
    action: "Cordon the area if debris can fall, then dispatch maintenance for inspection.",
    steps: [
      "Move people away from falling debris, glass, or water",
      "Photograph the damage with a scale reference",
      "Check whether adjacent rooms show the same damage",
      "Escalate to structural maintenance if damage is spreading",
    ],
  },
  Security: {
    action: "Notify campus security and preserve any available camera footage.",
    steps: [
      "Contact campus security and note the exact time",
      "Preserve CCTV footage covering the reported window",
      "Avoid confronting unknown individuals",
      "Record witness details where available",
    ],
  },
  Other: {
    action: "Route to the duty desk for manual classification.",
    steps: [
      "Confirm the exact location and affected asset",
      "Gather one clear photograph if possible",
      "Await triage confirmation from the operations desk",
    ],
  },
};

export function classify(input: {
  text: string;
  locationOverride?: { building?: string; floor?: string; room?: string };
  hasImage?: boolean;
  priorReports?: number;
}): AIAnalysis {
  const raw = input.text || "";
  const t = norm(raw);
  const words = t.trim().split(/\s+/);
  const wordCount = words.length;

  const scores = new Map<string, { score: number; subcategory: string; hits: string[] }>();
  for (const rule of RULES) {
    let score = 0;
    const hits: string[] = [];
    for (const group of rule.keywords) {
      for (const kw of group.k) {
        if (t.includes(` ${kw}`) || t.includes(`${kw} `)) {
          score += group.w;
          hits.push(kw);
        }
      }
    }
    if (score > 0) scores.set(rule.category, { score, subcategory: rule.subcategory, hits });
  }

  let category = "Other";
  let subcategory = "General";
  let hits: string[] = [];
  let best = 0;
  let total = 0;
  for (const [cat, v] of scores) {
    total += v.score;
    if (v.score > best) {
      best = v.score;
      category = cat;
      subcategory = v.subcategory;
      hits = v.hits;
    }
  }

  // Specific categories win ties against broad ones
  if (scores.has("Safety") && (scores.get("Safety")?.score ?? 0) >= 5) {
    category = "Safety";
    subcategory = "Hazard";
    hits = scores.get("Safety")?.hits ?? hits;
    best = scores.get("Safety")?.score ?? best;
  }

  let confidence =
    best === 0
      ? 0.35
      : Math.min(0.97, 0.55 + (best / Math.max(total, best)) * 0.35 + Math.min(wordCount, 30) / 200 + (input.hasImage ? 0.05 : 0));
  if (best > 0 && best < 4) confidence = Math.min(confidence, 0.66);
  if (wordCount < 4) confidence = Math.min(confidence, 0.5);

  const risk = HAZARDS.find((h) => h.k.some((k) => t.includes(k)))?.label ?? "";

  let severity = 3;
  if (category === "Safety" || risk === "Electrical hazard" || risk === "Fire risk") severity = 5;
  else if (risk === "Structural risk" && /leak|water/.test(t)) severity = 5;
  else if (URGENCY.some((u) => t.includes(u))) severity = 4;
  else if (risk === "Water damage" || risk === "Slip / fall hazard") severity = 4;
  else if (LOW_WORDS.some((u) => t.includes(u))) severity = 2;
  if (category === "Cleaning" && severity === 3) severity = 2;
  if (input.hasImage && severity < 5) severity = Math.min(5, severity + 0);

  const severityLabel: AIAnalysis["severityLabel"] =
    severity >= 5 ? "Critical" : severity === 4 ? "High" : severity === 3 ? "Medium" : "Low";

  const loc = parseLocation(raw);
  const building = input.locationOverride?.building || loc.building || "";
  const floor = input.locationOverride?.floor || loc.floor || "";
  const room = input.locationOverride?.room || loc.room || "";
  const location = { building, floor, room, explicit: loc.explicit || !!input.locationOverride?.building };

  const roomType = /lab|laboratory/.test(t) ? "lab" : /seminar|hall|auditorium|lecture/.test(t) ? "hall" : /library/.test(t) ? "library" : /exam/.test(t) ? "exam" : "classroom";
  const baseAffected = roomType === "lab" ? 30 : roomType === "hall" ? 80 : roomType === "library" ? 120 : roomType === "exam" ? 45 : 40;
  const affectedUsers = Math.max(5, Math.round(baseAffected * (severity >= 5 ? 1 : severity >= 4 ? 0.75 : severity >= 3 ? 0.5 : 0.2)));

  const playbook = PLAYBOOKS[category] ?? PLAYBOOKS.Other;
  const safetySensitive = severity >= 4 || category === "Safety" || risk === "Electrical hazard";

  const label = subcategory === "Hazard" ? "Safety hazard" : subcategory;
  const locText = locationLabel(location);
  const title = `${label}${locText ? ` — ${locText}` : ""}`.replace(/—\s*$/, "").trim();
  const summary = buildSummary(raw, category, location, risk);

  return {
    category,
    subcategory,
    severity,
    severityLabel,
    risk: risk || "None identified",
    department: "",
    summary,
    title,
    confidence: Math.round(confidence * 100) / 100,
    affectedUsers,
    locationHint: location,
    suggestedAction: playbook.action,
    suggestedSteps: safetySensitive && category !== "Safety" ? [playbook.steps[0], "Do not attempt repairs yourself — wait for authorized staff", ...playbook.steps.slice(1)] : playbook.steps,
    safetySensitive,
  };
}

function buildSummary(text: string, category: string, loc: { building: string; floor: string; room: string }, risk: string) {
  const clean = text.trim().replace(/\s+/g, " ");
  const short = clean.length > 180 ? `${clean.slice(0, 177)}...` : clean;
  const where = locationLabel(loc);
  const riskBit = risk && risk !== "None identified" ? ` Risk flagged: ${risk.toLowerCase()}.` : "";
  return `${short}${where ? ` (${where})` : ""}${riskBit} Classified as ${category}.`;
}

export function departmentFor(category: string, text: string): string {
  const t = text.toLowerCase();
  if (/water.*server|server.*water|server room/.test(t)) return "IT Support";
  if (/projector|wifi|internet|network|computer|printer/.test(t) && category === "Electrical") return "IT Support";
  const map: Record<string, string> = {
    Electrical: "Electrical",
    HVAC: "Facilities",
    Plumbing: "Facilities",
    "IT / Network": "IT Support",
    Cleaning: "Housekeeping",
    Infrastructure: "Maintenance",
    Furniture: "Maintenance",
    "Lab Equipment": "Laboratory",
    Security: "Security",
    Safety: "Security",
    Other: "Administration",
  };
  return map[category] ?? "Administration";
}
