/* CampusFix AI demo seed — run with `npm run db:seed` */
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const db = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `s2$${salt}$${derived}`;
}

let seed = 1337;
function rand() {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

const SLA_HOURS = { Critical: 1, High: 4, Medium: 24, Low: 72 };
const HOURS = (d) => new Date(Date.now() + d * 3600000);
const DAYS = (d, h = 0) => new Date(Date.now() - d * 86400000 - h * 3600000);

const DEPARTMENTS = [
  { name: "IT Support", color: "#8b5cf6", description: "Network, projectors, lab systems and endpoints" },
  { name: "Electrical", color: "#f59e0b", description: "Lighting, fans, distribution boards and wiring" },
  { name: "Facilities", color: "#06b6d4", description: "HVAC, plumbing and building services" },
  { name: "Security", color: "#ef4444", description: "Access control, surveillance and incident response" },
  { name: "Housekeeping", color: "#10b981", description: "Cleaning, waste and sanitation" },
  { name: "Laboratory", color: "#14b8a6", description: "Lab equipment, consumables and calibration" },
  { name: "Maintenance", color: "#64748b", description: "Carpentry, civil repairs and furniture" },
  { name: "Administration", color: "#6366f1", description: "Policy, escalation and cross-department coordination" },
];

const LOCATIONS = [
  { building: "Block A", floor: "1", room: "101", critical: 3, mapX: 18, mapY: 22 },
  { building: "Block A", floor: "1", room: "102", critical: 3, mapX: 26, mapY: 22 },
  { building: "Block A", floor: "2", room: "201", critical: 4, mapX: 18, mapY: 34 },
  { building: "Block A", floor: "2", room: "204", critical: 4, mapX: 27, mapY: 34 },
  { building: "Block A", floor: "3", room: "301", critical: 4, mapX: 18, mapY: 46 },
  { building: "Block A", floor: "3", room: "302", critical: 5, mapX: 27, mapY: 46 },
  { building: "Block B", floor: "1", room: "101", critical: 3, mapX: 55, mapY: 20 },
  { building: "Block B", floor: "2", room: "201", critical: 4, mapX: 55, mapY: 33 },
  { building: "Block B", floor: "2", room: "204", critical: 4, mapX: 65, mapY: 33 },
  { building: "Block B", floor: "3", room: "301", critical: 4, mapX: 55, mapY: 46 },
  { building: "Block B", floor: "2", room: "Lab 3", critical: 5, mapX: 66, mapY: 46 },
  { building: "Block B", floor: "1", room: "Seminar Hall", critical: 5, mapX: 66, mapY: 20 },
  { building: "Block C", floor: "1", room: "Library", critical: 5, mapX: 40, mapY: 66 },
  { building: "Block C", floor: "1", room: "Canteen", critical: 3, mapX: 62, mapY: 68 },
  { building: "Block C", floor: "1", room: "Workshop", critical: 4, mapX: 80, mapY: 66 },
  { building: "Block C", floor: "1", room: "Washroom East", critical: 3, mapX: 80, mapY: 30 },
  { building: "Main Block", floor: "1", room: "Admin Office", critical: 5, mapX: 40, mapY: 16 },
  { building: "Main Block", floor: "2", room: "Exam Hall", critical: 5, mapX: 40, mapY: 40 },
];

const FIRST = ["Aarav", "Vivaan", "Aditya", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Rohan", "Kabir", "Ananya", "Diya", "Aadhya", "Saanvi", "Myra", "Anika", "Navya", "Pari", "Riya", "Ira", "Meera", "Kavya", "Tara", "Zoya", "Aisha", "Neha", "Priya", "Sneha", "Divya", "Kritika", "Aryan", "Dhruv", "Yash", "Dev", "Neel", "Karan", "Varun", "Nikhil", "Siddharth", "Harsh", "Tanvi", "Simran", "Fatima", "Sarah", "Joseph", "Michael", "Rahul", "Amit", "Pooja", "Shreya"];
const LAST = ["Sharma", "Verma", "Patel", "Reddy", "Nair", "Iyer", "Gupta", "Singh", "Kumar", "Das", "Banerjee", "Joshi", "Mehta", "Shah", "Kulkarni", "Chauhan", "Rao", "Menon", "Pillai", "Bose"];

const TEMPLATES = [
  { title: "Ceiling fan not rotating", category: "Electrical", subcategory: "Power & Fixtures", dept: "Electrical", severity: 3, risk: "None identified", priority: "Medium", text: "The ceiling fan in {loc} has stopped rotating completely. It makes a slight humming sound when switched on.", steps: ["Confirm the isolator switch and regulator position", "Check whether other fans on the same circuit fail", "Do not open the fan housing yourself", "Log the fixture ID for the electrician"] },
  { title: "Tube light flickering", category: "Electrical", subcategory: "Power & Fixtures", dept: "Electrical", severity: 2, risk: "None identified", priority: "Low", text: "One tube light in {loc} keeps flickering during lectures and it is distracting.", steps: ["Note the fixture position", "Check the starter/LED driver", "Replace the tube if the driver tests fine"] },
  { title: "Water leakage near socket", category: "Plumbing", subcategory: "Water Supply", dept: "Facilities", severity: 5, risk: "Electrical hazard", priority: "Critical", text: "Water is dripping from the ceiling in {loc} and pooling close to the electrical socket. This looks dangerous.", steps: ["Keep the area clear and do not touch the socket", "Close the nearest valve to stop the source", "Call facilities immediately and log the time", "Photograph the pool before mopping"] },
  { title: "Washroom tap continuously running", category: "Plumbing", subcategory: "Water Supply", dept: "Facilities", severity: 3, risk: "Water damage", priority: "Medium", text: "The tap in {loc} does not close fully and water runs all day, wasting supply.", steps: ["Close the isolation valve partially", "Report the washer/cartridge for replacement", "Check the floor drain is clear"] },
  { title: "Projector shows no display", category: "IT / Network", subcategory: "Network", dept: "IT Support", severity: 4, risk: "None identified", priority: "High", text: "The projector in {loc} powers on but shows no display from any laptop. Class is blocked until this works.", steps: ["Check HDMI seating at both ends", "Confirm the laptop detects the external display", "Restart the projector once", "Escalate to IT if the lamp indicator is red"] },
  { title: "Wi-Fi drops in lecture room", category: "IT / Network", subcategory: "Network", dept: "IT Support", severity: 3, risk: "None identified", priority: "Medium", text: "Wi-Fi in {loc} disconnects every few minutes. Notes and portals will not load during class.", steps: ["Note the access point ID", "Check whether other rooms report the same", "Restart the AP once from the panel", "Raise to network ops if it recurs"] },
  { title: "Computer lab system will not boot", category: "IT / Network", subcategory: "Network", dept: "IT Support", severity: 3, risk: "None identified", priority: "Medium", text: "System number 12 in {loc} stops at the BIOS screen and will not boot into the lab image.", steps: ["Record the asset tag", "Try one clean restart", "Check the disk indicator light", "Swap the machine for the next session"] },
  { title: "AC leaking onto classroom floor", category: "HVAC", subcategory: "Air Conditioning", dept: "Facilities", severity: 4, risk: "Slip / fall hazard", priority: "High", text: "The AC in {loc} is leaking water down the wall and the floor is getting slippery near the desks.", steps: ["Switch the unit off at the wall", "Place a container under the drip", "Keep the wet floor cordoned", "Ask facilities to clear the drain line"] },
  { title: "Room too hot, AC not cooling", category: "HVAC", subcategory: "Air Conditioning", dept: "Facilities", severity: 3, risk: "None identified", priority: "Medium", text: "The AC in {loc} runs but the room stays warm. It is uncomfortable for the afternoon batch.", steps: ["Check the filter and thermostat setting", "Confirm vents are not blocked", "Raise a service ticket if the compressor is silent"] },
  { title: "Classroom very dusty and bins overflowing", category: "Cleaning", subcategory: "Housekeeping", dept: "Housekeeping", severity: 2, risk: "Health hazard", priority: "Low", text: "{loc} has not been cleaned properly. Desks are dusty and the bin has overflowed onto the floor.", steps: ["Mark for the next cleaning cycle", "Photograph the area", "Check again after the evening sweep"] },
  { title: "Broken desk in row three", category: "Furniture", subcategory: "Classroom Furniture", dept: "Maintenance", severity: 2, risk: "None identified", priority: "Low", text: "One desk in {loc} has a loose leg and wobbles badly. A student nearly dropped a laptop on it.", steps: ["Tag the desk out of use", "Arrange an alternate seat", "Request repair from the store"] },
  { title: "Window pane cracked", category: "Infrastructure", subcategory: "Building", dept: "Maintenance", severity: 3, risk: "Structural risk", priority: "High", text: "A window pane in {loc} is cracked end to end. Pieces could fall on anyone sitting near it.", steps: ["Cordon the seats below the window", "Photograph the crack", "Request glazing replacement the same day"] },
  { title: "Corridor light out near stairs", category: "Electrical", subcategory: "Power & Fixtures", dept: "Electrical", severity: 3, risk: "Slip / fall hazard", priority: "Medium", text: "The corridor light outside {loc} is out. The staircase is very dark in the evening.", steps: ["Check the breaker for the corridor circuit", "Replace the lamp if the circuit is live", "Escalate if the whole run is dark"] },
  { title: "CCTV camera not recording", category: "Security", subcategory: "Safety & Access", dept: "Security", severity: 4, risk: "Security risk", priority: "High", text: "The CCTV camera covering the entrance near {loc} has not recorded for two days. The recorder shows it offline.", steps: ["Note the camera ID and recorder channel", "Check the PoE link light", "Preserve the gap in the log for the report"] },
  { title: "Door lock jammed", category: "Security", subcategory: "Safety & Access", dept: "Security", severity: 3, risk: "Security risk", priority: "Medium", text: "The main door of {loc} does not lock properly and swings open overnight.", steps: ["Secure the door with the temporary latch", "Report the lock cylinder for replacement", "Check the frame alignment"] },
  { title: "Oscilloscope calibration expired", category: "Lab Equipment", subcategory: "Equipment", dept: "Laboratory", severity: 3, risk: "None identified", priority: "Medium", text: "The oscilloscope in {loc} shows an expired calibration sticker and readings drift during experiments.", steps: ["Tag the instrument out of use", "Record the asset number", "Schedule recalibration before the next batch"] },
  { title: "Chemical spill on lab bench", category: "Lab Equipment", subcategory: "Equipment", dept: "Laboratory", severity: 5, risk: "Health hazard", priority: "Critical", text: "A beaker spilled on the bench in {loc}. The liquid is spreading towards the sink and smells strong.", steps: ["Evacuate the bench and ventilate the room", "Use the correct spill kit, do not wipe with water", "Notify the lab supervisor immediately", "Log what chemical was involved"] },
  { title: "Garbage not collected for three days", category: "Cleaning", subcategory: "Housekeeping", dept: "Housekeeping", severity: 3, risk: "Health hazard", priority: "Medium", text: "The bins around {loc} have not been emptied for three days and there is a strong smell now.", steps: ["Record which bins are full", "Request an extra collection run", "Check the waste schedule for the block"] },
  { title: "Exposed wiring above the switchboard", category: "Safety", subcategory: "Hazard", dept: "Electrical", severity: 5, risk: "Electrical hazard", priority: "Critical", text: "Wires are hanging exposed above the switchboard in {loc}. Anyone touching the panel could get a shock.", steps: ["Keep everyone away from the panel", "Isolate the circuit from the distribution board", "Call a licensed electrician at once", "Record the time the hazard was found"] },
  { title: "Staircase railing loose", category: "Infrastructure", subcategory: "Building", dept: "Maintenance", severity: 4, risk: "Structural risk", priority: "High", text: "The railing on the staircase near {loc} moves when you lean on it. Someone could fall from the landing.", steps: ["Cordon the affected flight", "Do not lean on the railing", "Request welding/fixing the same day"] },
  { title: "Printer out of toner before submissions", category: "IT / Network", subcategory: "Network", dept: "IT Support", severity: 3, risk: "None identified", priority: "Medium", text: "The printer in {loc} is out of toner and reports cannot be printed before the submission deadline.", steps: ["Check the spare toner cabinet", "Reroute jobs to the second printer", "Restock for the deadline week"] },
  { title: "Slow internet on lab systems", category: "IT / Network", subcategory: "Network", dept: "IT Support", severity: 3, risk: "None identified", priority: "Medium", text: "Internet on the systems in {loc} is extremely slow. Downloads stall and portals time out.", steps: ["Run a speed check on two machines", "Check uplink status on the switch", "Compare with an adjacent lab"] },
  { title: "Canteen area waste not cleared", category: "Cleaning", subcategory: "Housekeeping", dept: "Housekeeping", severity: 3, risk: "Health hazard", priority: "Medium", text: "Tables and the floor near {loc} are sticky and waste is not cleared during the rush.", steps: ["Request an extra sweep during rush hour", "Photograph the queue area", "Check again after the next cycle"] },
  { title: "Blackboard surface damaged", category: "Furniture", subcategory: "Classroom Furniture", dept: "Maintenance", severity: 2, risk: "None identified", priority: "Low", text: "The board in {loc} has patchy areas where chalk will not come off. Writing is barely visible from the back.", steps: ["Clean with the board solution", "Request resurfacing if staining persists"] },
  { title: "Power outage in one wing", category: "Electrical", subcategory: "Power & Fixtures", dept: "Electrical", severity: 5, risk: "Electrical hazard", priority: "Critical", text: "The entire wing around {loc} has no power. Lights, fans and systems are all dead since the last hour.", steps: ["Check the distribution board for a tripped breaker", "Do not reset repeatedly if it trips again", "Call the electrician and record the trip time"] },
];

const STATUS_POOL = [
  ...Array(8).fill("CLOSED"),
  ...Array(6).fill("RESOLVED"),
  ...Array(4).fill("IN_PROGRESS"),
  ...Array(4).fill("ASSIGNED"),
  ...Array(3).fill("ACKNOWLEDGED"),
  ...Array(2).fill("REPORTED"),
  ...Array(2).fill("ON_HOLD"),
  ...Array(1).fill("ESCALATED"),
];

const PRIORITY_WEIGHTS = ["Critical", "Critical", "Critical", "High", "High", "High", "High", "Medium", "Medium", "Medium", "Medium", "Low", "Low", "Low"];

async function main() {
  console.log("Seeding CampusFix AI demo campus...");

  await db.notification.deleteMany();
  await db.resolution.deleteMany();
  await db.historyEntry.deleteMany();
  await db.attachment.deleteMany();
  await db.comment.deleteMany();
  await db.report.deleteMany();
  await db.incident.deleteMany();
  await db.location.deleteMany();
  await db.user.deleteMany();
  await db.department.deleteMany();
  await db.slaRule.deleteMany();
  await db.counter.deleteMany();
  await db.aiConfig.deleteMany();

  fs.mkdirSync(path.join(process.cwd(), "uploads"), { recursive: true });

  const departments = [];
  for (const d of DEPARTMENTS) departments.push(await db.department.create({ data: d }));

  for (const [priority, hours] of Object.entries(SLA_HOURS)) {
    await db.slaRule.create({ data: { priority, hours } });
  }
  await db.aiConfig.create({ data: { id: 1 } });

  const locations = [];
  for (const l of LOCATIONS) locations.push(await db.location.create({ data: l }));

  const deptByName = Object.fromEntries(departments.map((d) => [d.name, d]));
  const pw = hashPassword("demo1234");

  const admin = await db.user.create({
    data: { name: "Priya Menon", email: "admin@demo.com", passwordHash: pw, role: "ADMIN", departmentId: deptByName.Administration.id, title: "Campus Operations Head" },
  });
  const admin2 = await db.user.create({
    data: { name: "Rahul Joshi", email: "admin2@demo.com", passwordHash: pw, role: "ADMIN", departmentId: deptByName.Administration.id, title: "Deputy Administrator" },
  });
  const staff = [];
  const staffSeeds = [
    ["staff@demo.com", "Amit Kulkarni", "Electrical", "Senior Electrician"],
    ["staff.facilities@demo.com", "Neha Iyer", "Facilities", "Facilities Engineer"],
    ["staff.it@demo.com", "Joseph Mathew", "IT Support", "IT Support Lead"],
    ["staff.clean@demo.com", "Sneha Rao", "Housekeeping", "Housekeeping Supervisor"],
    ["staff.sec@demo.com", "Karan Singh", "Security", "Security Officer"],
  ];
  for (const [email, name, dept, title] of staffSeeds) {
    staff.push(await db.user.create({ data: { name, email, passwordHash: pw, role: "STAFF", departmentId: deptByName[dept].id, title } }));
  }
  const faculty = await db.user.create({
    data: { name: "Dr. Meera Bose", email: "faculty@demo.com", passwordHash: pw, role: "FACULTY", departmentId: deptByName.Administration.id, title: "Associate Professor" },
  });

  const students = [];
  const demoStudent = await db.user.create({
    data: { name: "Aarav Sharma", email: "student@demo.com", passwordHash: pw, role: "STUDENT", title: "B.Tech CSE · Sem 5" },
  });
  students.push(demoStudent);
  for (let i = 0; i < 49; i++) {
    const name = `${FIRST[i % FIRST.length]} ${LAST[(i * 3) % LAST.length]}`;
    students.push(
      await db.user.create({
        data: { name, email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@campus.edu`, passwordHash: pw, role: rand() > 0.92 ? "FACULTY" : "STUDENT" },
      })
    );
  }

  let counter = 1000;
  let reportCounter = 900;

  const makeHistory = async (incidentId, createdBy, createdAt, steps) => {
    let t = createdAt.getTime();
    for (const step of steps) {
      t += step.after ?? 6 * 60000;
      await db.historyEntry.create({
        data: { incidentId, action: step.action, performedBy: step.by ?? createdBy, oldValue: step.old ?? "", newValue: step.next ?? "", timestamp: new Date(t) },
      });
    }
  };

  const evidenceSvg = (label, tone) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tone[0]}"/><stop offset="1" stop-color="${tone[1]}"/></linearGradient></defs><rect width="640" height="420" fill="url(#g)"/><rect x="24" y="24" width="592" height="372" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2" rx="14"/><circle cx="120" cy="120" r="46" fill="rgba(255,255,255,.16)"/><rect x="60" y="250" width="520" height="10" rx="5" fill="rgba(255,255,255,.18)"/><rect x="60" y="282" width="360" height="10" rx="5" fill="rgba(255,255,255,.12)"/><text x="60" y="200" font-family="ui-sans-serif, system-ui" font-size="34" fill="#fff" opacity=".92">${label}</text><text x="60" y="345" font-family="ui-monospace, monospace" font-size="18" fill="rgba(255,255,255,.7)">CampusFix evidence capture</text></svg>`;
    const name = `seed-${crypto.randomBytes(4).toString("hex")}.svg`;
    fs.writeFileSync(path.join(process.cwd(), "uploads", name), svg);
    return `/api/uploads/${name}`;
  };
  const TONES = [
    ["#1e293b", "#0f172a"],
    ["#3b2f1e", "#1c1509"],
    ["#1e3a3b", "#0b1a1c"],
    ["#312029", "#160c11"],
  ];

  async function createIncident(opts) {
    counter++;
    const createdAt = opts.createdAt ?? DAYS(int(0, 45), int(0, 23));
    const priority = opts.priority ?? pick(PRIORITY_WEIGHTS);
    const template = opts.template;
    const location = opts.location;
    const dept = deptByName[opts.dept ?? template.dept];
    const slaHours = SLA_HOURS[priority];
    const slaDeadline = new Date(createdAt.getTime() + slaHours * 3600000);

    const status = opts.status ?? pick(STATUS_POOL);
    const closedLike = ["CLOSED", "RESOLVED"].includes(status);
    const resolvedAt = opts.resolvedAt ?? (closedLike ? new Date(createdAt.getTime() + int(1, Math.max(2, slaHours + 12)) * 3600000) : null);
    if (resolvedAt && resolvedAt > new Date()) return null;

    const incident = await db.incident.create({
      data: {
        incidentNumber: counter,
        title: opts.title ?? `${template.title} — ${labelOf(location)}`,
        description: "",
        category: template.category,
        subcategory: template.subcategory,
        priority,
        priorityScore: { Critical: 84, High: 62, Medium: 40, Low: 18 }[priority] + int(-4, 4),
        severity: template.severity >= 5 ? "Critical" : template.severity === 4 ? "High" : template.severity === 3 ? "Medium" : "Low",
        risk: template.risk,
        status,
        departmentId: dept.id,
        assignedStaffId: opts.forceStaff ? opts.forceStaff.id : pick(staff).id,
        locationId: location.id,
        affectedUsers: int(10, 90),
        duplicateCount: opts.reports?.length ?? 1,
        confidence: 0.62 + rand() * 0.34,
        suggestedAction: template.steps[0],
        suggestedSteps: JSON.stringify(template.steps),
        escalationLevel: status === "ESCALATED" ? 1 : 0,
        reopenCount: opts.reopenCount ?? (rand() > 0.88 ? 1 : 0),
        slaDeadline,
        createdAt,
        updatedAt: resolvedAt ?? new Date(createdAt.getTime() + int(1, 48) * 3600000),
        resolvedAt,
        closedAt: status === "CLOSED" ? resolvedAt : null,
      },
    });

    const locLabel = labelOf(location);
    const description = (opts.text ?? template.text).replace("{loc}", locLabel);
    await db.incident.update({ where: { id: incident.id }, data: { description: `AI summary: ${description} Category ${template.category}, routed to ${dept.name}.` } });

    const reporterList = opts.reporters ?? [pick(students), pick(students)];
    const uniqueReporters = [...new Set(reporterList)].slice(0, opts.mergeDemo ? 1 : 3);
    const reportImages = [];
    for (const reporter of uniqueReporters) {
      reportCounter++;
      const withImage = rand() > 0.45;
      const imageUrl = withImage ? evidenceSvg(shortLabel(template.title), TONES[int(0, 3)]) : null;
      if (imageUrl) reportImages.push(imageUrl);
      await db.report.create({
        data: {
          reportNumber: reportCounter,
          userId: reporter.id,
          incidentId: incident.id,
          description,
          imageUrl,
          locationId: location.id,
          aiSummary: `Reported by ${reporter.name}: ${description.slice(0, 120)}`,
          aiCategory: template.category,
          aiSubcategory: template.subcategory,
          aiSeverity: incident.severity,
          aiRisk: template.risk,
          aiDepartment: dept.name,
          aiConfidence: incident.confidence,
          createdAt,
          joined: uniqueReporters.length > 1 && reporter !== uniqueReporters[0],
        },
      });
      if (imageUrl) {
        await db.attachment.create({ data: { incidentId: incident.id, uploadedBy: reporter.id, kind: "evidence", url: imageUrl, caption: "Reported evidence", createdAt } });
      }
    }

    const historySteps = [
      { action: "REPORTED", next: `Report #${reportCounter - uniqueReporters.length + 1} received`, after: 0 },
      { action: "AI_TRIAGED", next: `${template.category} · ${incident.severity} · ${Math.round(incident.confidence * 100)}% confidence`, after: 12000 },
      { action: "ASSIGNED", next: `Routed to ${dept.name}`, after: 9000 },
    ];
    if (["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED", "ON_HOLD", "ESCALATED"].includes(status)) {
      historySteps.push({ action: "STATUS_CHANGED", old: "ASSIGNED", next: "ACKNOWLEDGED", after: int(10, 90) * 60000 });
    }
    if (["IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
      historySteps.push({ action: "STATUS_CHANGED", old: "ACKNOWLEDGED", next: "IN_PROGRESS", after: int(10, 60) * 60000 });
    }
    if (closedLike) {
      const resolutionImage = evidenceSvg("After repair", TONES[int(0, 3)]);
      historySteps.push({ action: "RESOLVED", old: "IN_PROGRESS", next: "Resolved — AI evidence check passed", after: int(20, 180) * 60000 });
      if (status === "CLOSED") {
        historySteps.push({ action: "VERIFIED", old: "RESOLVED", next: "Confirmed fixed by reporter", after: int(30, 240) * 60000 });
        historySteps.push({ action: "CLOSED", old: "VERIFIED", next: "CLOSED", after: 300000 });
      }
      await db.resolution.create({
        data: {
          incidentId: incident.id,
          createdById: incident.assignedStaffId,
          description: opts.resolution ?? pick([
            "Replaced the faulty part and tested the fix twice before leaving the site.",
            "Cleared the blockage, dried the area and re-checked after 30 minutes.",
            "Swapped the unit, verified operation with the class teacher and added it to the watch list.",
            "Repaired the connection at the board and confirmed stable operation.",
          ]),
          resolutionImage,
          aiAppearsResolved: true,
          aiVerificationNote: "Evidence check passed: after-photo attached, describes work done, before and after evidence present.",
          studentConfirmed: status === "CLOSED" ? "CONFIRMED" : null,
          createdAt: resolvedAt ?? createdAt,
        },
      });
      await db.attachment.create({ data: { incidentId: incident.id, uploadedBy: incident.assignedStaffId, kind: "resolution", url: resolutionImage, caption: "Resolution evidence", createdAt: resolvedAt ?? createdAt } });
    }
    if (status === "ESCALATED") {
      historySteps.push({ action: "ESCALATED", old: "IN_PROGRESS", next: "ESCALATED", after: int(60, 200) * 60000 });
    }
    await makeHistory(incident.id, incident.assignedStaffId, createdAt, historySteps);

    if (rand() > 0.55) {
      await db.comment.create({
        data: {
          incidentId: incident.id,
          userId: pick(students).id,
          message: pick([
            "This is blocking our lab session, any update?",
            "Still the same this morning.",
            "Thanks, spotted the technician on site just now.",
            "Happening in the adjacent room too.",
          ]),
          createdAt: new Date(createdAt.getTime() + int(20, 300) * 60000),
        },
      });
    }

    return incident;
  }

  function labelOf(loc) {
    if (!loc) return "the reported area";
    if (loc.room === "Washroom East") return "the east washroom";
    if (loc.room === "Library") return "the library";
    if (loc.room === "Canteen") return "the canteen";
    if (loc.room === "Admin Office") return "the admin office";
    if (loc.room === "Exam Hall") return "the exam hall";
    if (loc.room === "Workshop") return "the workshop";
    if (/lab|seminar/i.test(loc.room)) return loc.room;
    return `Room ${loc.room}, ${loc.building}`;
  }
  function shortLabel(title) {
    return title.replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 34);
  }

  const byRoom = (room) => locations.find((l) => l.room === room);
  const byBuilding = (b) => locations.filter((l) => l.building === b);

  // ---- Recurring storyline: Room 204 ceiling fan (5 incidents / 60 days) ----
  const fanTemplate = TEMPLATES[0];
  for (const [daysAgo, status] of [[56, "CLOSED"], [41, "CLOSED"], [27, "CLOSED"], [14, "CLOSED"], [3, "IN_PROGRESS"]]) {
    await createIncident({
      template: fanTemplate,
      location: byRoom("204"),
      status,
      priority: daysAgo === 3 ? "High" : "Medium",
      createdAt: DAYS(daysAgo, int(1, 8)),
      reporters: [pick(students), pick(students)],
      title: `Ceiling fan not rotating — Room 204, ${daysAgo === 3 ? "repeat failure" : "repair"}`,
      resolution: "Replaced the capacitor and regulator; fan tested at all three speeds.",
    });
  }

  // ---- Duplicate-merge storyline: Projector in Lab 3 with 3 supporting reports ----
  const projectorTemplate = TEMPLATES[4];
  const projectorIncident = await createIncident({
    template: projectorTemplate,
    location: byRoom("Lab 3"),
    status: "IN_PROGRESS",
    priority: "High",
    createdAt: DAYS(0, 5),
    forceStaff: staff[2],
    reporters: [demoStudent, pick(students), pick(students)],
    title: "Projector malfunction — Lab 3",
    text: "The projector in Lab 3 powers on but shows no display from any laptop. Three of us tried different cables. Lab session is blocked.",
  });

  // ---- A second, nearly identical report left un-merged for the duplicate demo ----
  await createIncident({
    template: TEMPLATES[4],
    location: byRoom("Lab 3"),
    status: "ASSIGNED",
    priority: "Medium",
    createdAt: DAYS(0, 2),
    reporters: [pick(students)],
    title: "No display on lab projector",
    text: "Projector stopped showing display in Lab 3 today morning.",
  });

  // ---- Critical hero incident for the dashboard ----
  await createIncident({
    template: TEMPLATES[2],
    location: byRoom("301"),
    status: "IN_PROGRESS",
    priority: "Critical",
    createdAt: DAYS(0, 3),
    forceStaff: staff[1],
    reporters: [pick(students), pick(students)],
    title: "Water leakage near electrical panel — Block A",
    text: "Water is leaking from the ceiling right beside the electrical distribution panel in Room 301, Block A. The floor is wet and this is a live hazard.",
    resolution: null,
  });

  await createIncident({
    template: TEMPLATES[18],
    location: byRoom("101"),
    status: "ESCALATED",
    priority: "Critical",
    createdAt: DAYS(0, 6),
    forceStaff: staff[0],
    reporters: [pick(students), pick(students)],
    title: "Exposed wiring above switchboard — Block B Room 101",
    text: "Wires are hanging exposed above the switchboard in Room 101, Block B. Anyone touching the panel could get a shock.",
  });

  await createIncident({
    template: TEMPLATES[16],
    location: byRoom("Lab 3"),
    status: "ASSIGNED",
    priority: "Critical",
    createdAt: DAYS(0, 8),
    forceStaff: staff[2],
    reporters: [pick(students)],
    title: "Chemical spill on lab bench — Lab 3",
    text: "A beaker spilled on the bench in Lab 3. The liquid is spreading towards the sink and smells strong.",
  });

  await createIncident({
    template: TEMPLATES[20],
    location: byRoom("201"),
    status: "REPORTED",
    priority: "High",
    createdAt: DAYS(0, 1),
    reporters: [demoStudent],
    title: "Staircase railing loose — Block A",
    text: "The railing on the staircase near Room 201 moves when you lean on it. Someone could fall from the landing.",
  });

  // ---- Fill the remaining campus incidents ----
  let guard = 0;
  while (guard < 60) {
    guard++;
    const template = pick(TEMPLATES);
    const location = pick(locations);
    const priority = pick(PRIORITY_WEIGHTS);
    await createIncident({ template, location, priority });
  }

  // ---- Notifications for the demo accounts ----
  await db.notification.createMany({
    data: [
      { userId: demoStudent.id, incidentId: projectorIncident.id, type: "status", title: "INC-" + projectorIncident.incidentNumber + " is now in progress", body: "IT Support is working on the Lab 3 projector." },
      { userId: demoStudent.id, type: "resolved", title: "Is INC-1004 fixed?", body: "Staff marked the library Wi-Fi issue as resolved. Please confirm." },
      { userId: demoStudent.id, type: "info", title: "Welcome to CampusFix AI", body: "Describe any campus problem in your own words — we will route it for you." },
      { userId: admin.id, type: "escalation", title: "2 incidents past SLA", body: "Block A water leakage and Block B exposed wiring need attention now." },
      { userId: staff[0].id, type: "assign", title: "Critical incident assigned", body: "Exposed wiring above switchboard — Block B Room 101." },
    ],
  });

  await db.counter.upsert({ where: { key: "incident" }, create: { key: "incident", value: counter }, update: { value: counter } });
  await db.counter.upsert({ where: { key: "report" }, create: { key: "report", value: reportCounter }, update: { value: reportCounter } });

  const totals = {
    incidents: await db.incident.count(),
    reports: await db.report.count(),
    users: await db.user.count(),
    departments: await db.department.count(),
    locations: await db.location.count(),
  };
  console.log("Seed complete:", totals);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
