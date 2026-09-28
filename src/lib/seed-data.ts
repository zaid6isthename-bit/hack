import { 
  User, 
  Department, 
  CampusLocation, 
  Incident, 
  RecurringIssuePattern,
  PriorityLevel
} from '@/types/campusfix';
import { DEMO_EVIDENCE_IMAGES } from './demo-images';

export const DEMO_USERS: User[] = [
  {
    id: 'user-student',
    name: 'Alex Rivera',
    email: 'student@demo.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roleTitle: 'Senior Undergrad (Computer Engineering)'
  },
  {
    id: 'user-faculty',
    name: 'Prof. Sarah Jenkins',
    email: 'faculty@demo.com',
    role: 'faculty',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    roleTitle: 'Faculty Chair, Dept. of Applied Sciences'
  },
  {
    id: 'user-staff',
    name: 'Marcus Vance',
    email: 'staff@demo.com',
    role: 'staff',
    departmentId: 'dept-facilities',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleTitle: 'Senior Field Technician (Facilities & HVAC)'
  },
  {
    id: 'user-admin',
    name: 'Dr. Evelyn Reed',
    email: 'admin@demo.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    roleTitle: 'Director of Campus Operations & Infrastructure'
  }
];

export const DEMO_DEPARTMENTS: Department[] = [
  {
    id: 'dept-facilities',
    name: 'Facilities & HVAC',
    code: 'FAC',
    description: 'Air conditioning, plumbing, structural repairs, and building services.',
    slaHours: 2,
    icon: 'Wrench',
    leadName: 'Arthur Dent',
    contactPhone: '+1 (555) 019-4821',
    color: '#0284c7'
  },
  {
    id: 'dept-electrical',
    name: 'Electrical Systems',
    code: 'ELEC',
    description: 'Power distribution, lighting, fans, high voltage safety, and backups.',
    slaHours: 2,
    icon: 'Zap',
    leadName: 'Vikram Joshi',
    contactPhone: '+1 (555) 019-4822',
    color: '#eab308'
  },
  {
    id: 'dept-it',
    name: 'IT Support & AV',
    code: 'IT',
    description: 'Campus Wi-Fi, classroom projectors, smart boards, and lab computers.',
    slaHours: 4,
    icon: 'Monitor',
    leadName: 'Rachel Lin',
    contactPhone: '+1 (555) 019-4823',
    color: '#6366f1'
  },
  {
    id: 'dept-housekeeping',
    name: 'Housekeeping & Sanitation',
    code: 'HK',
    description: 'Classroom cleanliness, trash disposal, restroom hygiene, and sanitization.',
    slaHours: 4,
    icon: 'Sparkles',
    leadName: 'Carlos Ruiz',
    contactPhone: '+1 (555) 019-4824',
    color: '#10b981'
  },
  {
    id: 'dept-security',
    name: 'Campus Security',
    code: 'SEC',
    description: 'Access control, door locks, perimeter safety, CCTV, and emergency response.',
    slaHours: 1,
    icon: 'ShieldAlert',
    leadName: 'Capt. David Vance',
    contactPhone: '+1 (555) 019-4825',
    color: '#ef4444'
  },
  {
    id: 'dept-lab',
    name: 'Laboratory Equipment',
    code: 'LAB',
    description: 'Specialized lab instruments, chemical fume hoods, and experiment gear.',
    slaHours: 6,
    icon: 'FlaskConical',
    leadName: 'Dr. Aris Thorne',
    contactPhone: '+1 (555) 019-4826',
    color: '#a855f7'
  },
  {
    id: 'dept-maintenance',
    name: 'General Maintenance',
    code: 'MAINT',
    description: 'Furniture, broken desks, window latches, doors, and carpentry.',
    slaHours: 8,
    icon: 'Hammer',
    leadName: 'Samuel Osei',
    contactPhone: '+1 (555) 019-4827',
    color: '#f97316'
  },
  {
    id: 'dept-admin',
    name: 'Administration',
    code: 'ADM',
    description: 'Policy oversight, space allocation, vendor contracts, and long-term capital fixes.',
    slaHours: 24,
    icon: 'Building2',
    leadName: 'Elena Rostova',
    contactPhone: '+1 (555) 019-4828',
    color: '#64748b'
  }
];

export const DEMO_LOCATIONS: CampusLocation[] = [
  // Block A - Science & Labs
  { id: 'loc-a101', building: 'Block A', floor: 1, room: 'Computer Lab 1', type: 'lab', criticality: 4, x: 22, y: 26 },
  { id: 'loc-a102', building: 'Block A', floor: 1, room: 'Main Server Room A-1', type: 'facility', criticality: 5, x: 28, y: 24 },
  { id: 'loc-a201', building: 'Block A', floor: 2, room: 'Computer Lab 3', type: 'lab', criticality: 4, x: 24, y: 32 },
  { id: 'loc-a202', building: 'Block A', floor: 2, room: 'Physics Experiment Lab', type: 'lab', criticality: 4, x: 20, y: 38 },
  { id: 'loc-a301', building: 'Block A', floor: 3, room: 'Chemistry Analytical Lab', type: 'lab', criticality: 5, x: 26, y: 44 },

  // Block B - Engineering & Lecture Classrooms
  { id: 'loc-b101', building: 'Block B', floor: 1, room: 'Grand Seminar Hall', type: 'hall', criticality: 5, x: 74, y: 24 },
  { id: 'loc-b102', building: 'Block B', floor: 1, room: 'Lecture Hall 1', type: 'hall', criticality: 4, x: 80, y: 28 },
  { id: 'loc-b201', building: 'Block B', floor: 2, room: 'Classroom 204', type: 'classroom', criticality: 3, x: 72, y: 34 },
  { id: 'loc-b202', building: 'Block B', floor: 2, room: 'Classroom 201', type: 'classroom', criticality: 3, x: 78, y: 36 },
  { id: 'loc-b301', building: 'Block B', floor: 3, room: 'Classroom 302', type: 'classroom', criticality: 4, x: 75, y: 42 },
  { id: 'loc-b302', building: 'Block B', floor: 3, room: 'Classroom 305', type: 'classroom', criticality: 3, x: 82, y: 44 },

  // Block C - Library & Student Commons
  { id: 'loc-c101', building: 'Block C', floor: 1, room: 'Central Cafeteria', type: 'common', criticality: 4, x: 30, y: 74 },
  { id: 'loc-c102', building: 'Block C', floor: 1, room: 'Study Commons', type: 'common', criticality: 3, x: 36, y: 78 },
  { id: 'loc-c201', building: 'Block C', floor: 2, room: 'Main Library Reading Room', type: 'classroom', criticality: 4, x: 32, y: 84 },
  { id: 'loc-c202', building: 'Block C', floor: 2, room: 'Digital Media Lounge', type: 'lab', criticality: 3, x: 38, y: 86 },

  // Block D - Admin & Sports
  { id: 'loc-d101', building: 'Block D', floor: 1, room: 'Dean of Students Office', type: 'office', criticality: 3, x: 68, y: 76 },
  { id: 'loc-d102', building: 'Block D', floor: 1, room: 'Security Command Center', type: 'facility', criticality: 5, x: 74, y: 74 },
  { id: 'loc-d201', building: 'Block D', floor: 2, room: 'Faculty Conference Lounge', type: 'office', criticality: 2, x: 70, y: 84 }
];

export const DEMO_RECURRING_PATTERNS: RecurringIssuePattern[] = [
  {
    id: 'rec-204-fan',
    locationName: 'Classroom 204 (Block B)',
    category: 'Electrical / Ceiling Fan',
    equipment: 'Ceiling Fan Unit #CF-204B',
    incidentCount: 5,
    timeframeDays: 60,
    dates: ['June 4', 'June 21', 'July 2', 'July 19', 'August 5'],
    severity: 'critical',
    aiInsight: 'The same ceiling fan fixture in Classroom 204 has generated 5 repetitive spark & wobble complaints in 60 days. Prior staff actions were limited to capacitor re-lubrication.',
    recommendedPermanentAction: 'Authorize permanent replacement with commercial-grade BLDC inverter motor assembly rather than recurring patch repair.',
    estimatedCostSavings: '$420 in maintenance hours saved'
  },
  {
    id: 'rec-302-hvac',
    locationName: 'Classroom 302 (Block B)',
    category: 'Facilities / HVAC',
    equipment: 'Split AC Unit #AC-302-B',
    incidentCount: 4,
    timeframeDays: 45,
    dates: ['July 10', 'July 24', 'August 8', 'August 22'],
    severity: 'warning',
    aiInsight: 'Condensate drip tray overflows periodically due to undersized drainage slope near north-facing facade.',
    recommendedPermanentAction: 'Re-route condensate drain pipe with a 15-degree gravity gradient and install an inline float switch cutoff.',
    estimatedCostSavings: 'Prevents drywall and electrical short replacement'
  },
  {
    id: 'rec-lab3-projector',
    locationName: 'Computer Lab 3 (Block A)',
    category: 'IT Support / AV',
    equipment: 'Optoma 4K Projector #PRJ-A3',
    incidentCount: 3,
    timeframeDays: 30,
    dates: ['August 2', 'August 14', 'August 25'],
    severity: 'warning',
    aiInsight: 'Repeated HDMI sync dropouts caused by a loose termination inside the wall faceplate rather than projector hardware malfunction.',
    recommendedPermanentAction: 'Replace internal in-wall shielded cat6 HDMI extender balun with latching locking connectors.',
    estimatedCostSavings: 'Eliminates recurring lab lecture interruptions'
  }
];

export function getInitialIncidents(): Incident[] {
  const now = new Date();
  const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  const hoursAhead = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();

  // Primary Anchor Incident: INC-1042 (Water leakage near electrical socket in Classroom 302)
  const inc1042: Incident = {
    id: 'inc-1042',
    incidentNumber: 'INC-1042',
    title: 'Water leakage near electrical socket in Classroom 302',
    description: 'The AC indoor unit in Classroom 302 is overflowing water that is dripping directly onto the 230V wall socket below. Puddle forming on floor.',
    category: 'Facilities / HVAC',
    subcategory: 'Critical Water Leakage / Electrical Hazard',
    priority: 'critical',
    priorityScore: 92,
    scoreBreakdown: {
      severity: 5,
      safetyRisk: 5,
      affectedUsers: 45,
      locationCriticality: 4,
      duplicateCount: 2,
      totalScore: 92,
      formulaDescription: 'Severity(5×8) + Safety(5×5) + Users(14) + Location(8) + Duplicate(5) = 92/100'
    },
    severity: 5,
    safetyRisk: 5,
    status: 'IN_PROGRESS',
    departmentId: 'dept-facilities',
    departmentName: 'Facilities & HVAC',
    assignedStaffId: 'user-staff',
    assignedStaffName: 'Marcus Vance',
    locationId: 'loc-b301',
    building: 'Block B',
    floor: 3,
    room: 'Classroom 302',
    duplicateCount: 2,
    supportingReports: [
      {
        id: 'rep-981',
        reportNumber: 'REP-981',
        userId: 'user-student',
        userName: 'Alex Rivera',
        userRole: 'student',
        incidentId: 'inc-1042',
        description: 'The AC in classroom 302 has been leaking since this morning and water is collecting near the electrical socket.',
        imageUrl: DEMO_EVIDENCE_IMAGES.acWaterLeakBefore,
        locationId: 'loc-b301',
        locationName: 'Classroom 302 (Block B)',
        aiSummary: 'Critical water leak directly above electrical socket. High shock hazard.',
        aiCategory: 'Facilities / HVAC',
        aiSeverity: 'Critical',
        aiConfidence: 0.94,
        createdAt: minsAgo(42)
      },
      {
        id: 'rep-992',
        reportNumber: 'REP-992',
        userId: 'user-student-2',
        userName: 'Priya Sharma',
        userRole: 'student',
        incidentId: 'inc-1042',
        description: 'Water is dripping from the AC unit right onto the wall plug in room 302. Please turn it off!',
        imageUrl: DEMO_EVIDENCE_IMAGES.acWaterLeakBefore,
        locationId: 'loc-b301',
        locationName: 'Classroom 302 (Block B)',
        aiSummary: 'Corroborating report: AC condensate water leaking over active power outlet.',
        aiCategory: 'Facilities / HVAC',
        aiSeverity: 'Critical',
        aiConfidence: 0.92,
        createdAt: minsAgo(22)
      }
    ],
    slaHours: 2,
    slaDeadline: hoursAhead(1),
    isSlaBreached: false,
    aiSuggestedActions: [
      '⚠️ SAFETY FIRST: Immediately isolate access to Classroom 302 near the hazard area.',
      'De-energize sub-circuit breaker for north wall sockets at Floor 3 distribution panel.',
      'Inspect AC condensate drain line for blockages or dislodged PVC elbows.',
      'Check surrounding drywall for moisture saturation before re-enabling electrical line.'
    ],
    aiConfidence: 0.94,
    imageUrl: DEMO_EVIDENCE_IMAGES.acWaterLeakBefore,
    createdAt: minsAgo(42),
    updatedAt: minsAgo(10),
    recurringDetected: true,
    history: [
      {
        id: 'hist-1',
        incidentId: 'inc-1042',
        action: 'Report Submitted',
        performedBy: 'Alex Rivera',
        performedByRole: 'student',
        timestamp: minsAgo(42),
        notes: 'Initial mobile report with photo evidence'
      },
      {
        id: 'hist-2',
        incidentId: 'inc-1042',
        action: 'AI Triaged & Prioritized',
        performedBy: 'CampusFix AI Engine',
        performedByRole: 'admin',
        timestamp: minsAgo(41),
        notes: 'Calculated 92/100 Priority Score (Critical). Auto-routed to Facilities with Electrical Hazard flag.'
      },
      {
        id: 'hist-3',
        incidentId: 'inc-1042',
        action: 'Duplicate Consolidated',
        performedBy: 'CampusFix AI Duplicate Engine',
        performedByRole: 'student',
        timestamp: minsAgo(22),
        notes: 'Report #REP-992 merged into INC-1042 (94% similarity score)'
      },
      {
        id: 'hist-4',
        incidentId: 'inc-1042',
        action: 'Staff Assigned & Work Started',
        performedBy: 'Marcus Vance',
        performedByRole: 'staff',
        timestamp: minsAgo(15),
        notes: 'Dispatched with emergency isolation kit. In progress.',
        oldStatus: 'ASSIGNED',
        newStatus: 'IN_PROGRESS'
      }
    ]
  };

  // Anchor Incident 2: INC-1024 (Projector malfunction in Lab 3)
  const inc1024: Incident = {
    id: 'inc-1024',
    incidentNumber: 'INC-1024',
    title: 'Ceiling projector display malfunction in Computer Lab 3',
    description: 'Projector turns on but displays distorted lines and lamp error code. Class cannot view presentation slides.',
    category: 'IT Support',
    subcategory: 'Classroom AV & Display',
    priority: 'high',
    priorityScore: 71,
    scoreBreakdown: {
      severity: 4,
      safetyRisk: 0,
      affectedUsers: 45,
      locationCriticality: 4,
      duplicateCount: 3,
      totalScore: 71,
      formulaDescription: 'Severity(4×8) + Safety(0) + Users(14) + Location(8) + Duplicate(17) = 71/100'
    },
    severity: 4,
    safetyRisk: 0,
    status: 'IN_PROGRESS',
    departmentId: 'dept-it',
    departmentName: 'IT Support & AV',
    assignedStaffId: 'user-it-tech',
    assignedStaffName: 'Rachel Lin',
    locationId: 'loc-a201',
    building: 'Block A',
    floor: 2,
    room: 'Computer Lab 3',
    duplicateCount: 3,
    supportingReports: [
      {
        id: 'rep-840',
        reportNumber: 'REP-840',
        userId: 'user-faculty',
        userName: 'Prof. Sarah Jenkins',
        userRole: 'faculty',
        incidentId: 'inc-1024',
        description: 'Projector display dead in Lab 3. We have lab exams scheduled this afternoon.',
        imageUrl: DEMO_EVIDENCE_IMAGES.projectorBrokenBefore,
        locationId: 'loc-a201',
        locationName: 'Computer Lab 3 (Block A)',
        aiSummary: 'AV display failure in Computer Lab 3 impacting lecture and exams.',
        aiCategory: 'IT Support',
        aiSeverity: 'High',
        aiConfidence: 0.96,
        createdAt: hoursAgo(2)
      }
    ],
    slaHours: 4,
    slaDeadline: hoursAhead(2),
    isSlaBreached: false,
    aiSuggestedActions: [
      'Verify HDMI input selection and check projector control board diagnostic LED.',
      'Inspect auxiliary wall panel HDMI socket for pin corrosion or mechanical damage.',
      'Swap with spare hot-standby projector if ballast replacement is required.'
    ],
    aiConfidence: 0.95,
    imageUrl: DEMO_EVIDENCE_IMAGES.projectorBrokenBefore,
    createdAt: hoursAgo(2),
    updatedAt: minsAgo(30),
    recurringDetected: true,
    history: [
      {
        id: 'hist-10',
        incidentId: 'inc-1024',
        action: 'Reported by Faculty',
        performedBy: 'Prof. Sarah Jenkins',
        performedByRole: 'faculty',
        timestamp: hoursAgo(2)
      },
      {
        id: 'hist-11',
        incidentId: 'inc-1024',
        action: 'Assigned to IT Support',
        performedBy: 'Campus Operations',
        performedByRole: 'admin',
        timestamp: hoursAgo(1.8)
      }
    ]
  };

  // Anchor Incident 3: INC-1033 (Classroom 204 Fan Sparking - Recurring Issue Anchor)
  const inc1033: Incident = {
    id: 'inc-1033',
    incidentNumber: 'INC-1033',
    title: 'Ceiling fan sparking and wobbling violently in Classroom 204',
    description: 'Fan is wobbling loudly and emits periodic electrical sparks from the motor dome. Students evacuated the rows underneath.',
    category: 'Electrical',
    subcategory: 'Ceiling Fan System',
    priority: 'critical',
    priorityScore: 88,
    scoreBreakdown: {
      severity: 5,
      safetyRisk: 5,
      affectedUsers: 35,
      locationCriticality: 3,
      duplicateCount: 5,
      totalScore: 88,
      formulaDescription: 'Severity(5×8) + Safety(5×5) + Users(11) + Location(6) + Recurring(6) = 88/100'
    },
    severity: 5,
    safetyRisk: 5,
    status: 'ACKNOWLEDGED',
    departmentId: 'dept-electrical',
    departmentName: 'Electrical Systems',
    assignedStaffId: 'user-elec-tech',
    assignedStaffName: 'Vikram Joshi',
    locationId: 'loc-b201',
    building: 'Block B',
    floor: 2,
    room: 'Classroom 204',
    duplicateCount: 5,
    supportingReports: [],
    slaHours: 2,
    slaDeadline: hoursAgo(0.5), // SLA Breached!
    isSlaBreached: true,
    aiSuggestedActions: [
      '⚠️ Switch off the master fan isolator switch for Classroom 204 immediately.',
      'Check motor shaft bearing play and capacitor coil winding for scorched insulation.',
      'RECURRING INCIDENT ALERT: Authorize complete replacement with commercial inverter unit.'
    ],
    aiConfidence: 0.97,
    imageUrl: DEMO_EVIDENCE_IMAGES.fanSparkingBefore,
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(1),
    recurringDetected: true,
    history: [
      {
        id: 'hist-20',
        incidentId: 'inc-1033',
        action: 'Critical Alert Raised',
        performedBy: 'Alex Rivera',
        performedByRole: 'student',
        timestamp: hoursAgo(3)
      },
      {
        id: 'hist-21',
        incidentId: 'inc-1033',
        action: 'SLA Breached - Auto Escalated to Dept Head',
        performedBy: 'System Watchdog',
        performedByRole: 'admin',
        timestamp: hoursAgo(0.5),
        notes: 'Target SLA of 2 hours exceeded. Marked for escalation.'
      }
    ]
  };

  // Anchor Incident 4: INC-1012 (Already Resolved & Ready for Verification Demo)
  const inc1012: Incident = {
    id: 'inc-1012',
    incidentNumber: 'INC-1012',
    title: 'Water filter drain clog & overflow at Central Cafeteria',
    description: 'Drinking water dispenser drainage blocked, creating puddle near seating booths.',
    category: 'Facilities / HVAC',
    subcategory: 'Plumbing & Water Flow',
    priority: 'medium',
    priorityScore: 48,
    scoreBreakdown: {
      severity: 2,
      safetyRisk: 2,
      affectedUsers: 30,
      locationCriticality: 4,
      duplicateCount: 1,
      totalScore: 48,
      formulaDescription: 'Severity(2×8) + Safety(2×5) + Users(9) + Location(8) + Duplicate(5) = 48/100'
    },
    severity: 2,
    safetyRisk: 2,
    status: 'RESOLVED',
    departmentId: 'dept-facilities',
    departmentName: 'Facilities & HVAC',
    assignedStaffId: 'user-staff',
    assignedStaffName: 'Marcus Vance',
    locationId: 'loc-c101',
    building: 'Block C',
    floor: 1,
    room: 'Central Cafeteria',
    duplicateCount: 1,
    supportingReports: [],
    slaHours: 4,
    slaDeadline: hoursAhead(3),
    isSlaBreached: false,
    aiSuggestedActions: [
      'Unclog p-trap and run hot water pressure flush.',
      'Sanitize surrounding splash back.'
    ],
    aiConfidence: 0.91,
    imageUrl: DEMO_EVIDENCE_IMAGES.acWaterLeakBefore,
    createdAt: hoursAgo(4),
    updatedAt: minsAgo(15),
    resolvedAt: minsAgo(15),
    resolutionDetails: {
      resolvedBy: 'Marcus Vance',
      resolvedAt: minsAgo(15),
      notes: 'Cleared sediment blockage from drain line. Replaced filter cartridge and sanitized drinking basin.',
      beforeImageUrl: DEMO_EVIDENCE_IMAGES.acWaterLeakBefore,
      afterImageUrl: DEMO_EVIDENCE_IMAGES.acWaterLeakAfter,
      aiVerificationScore: 0.93,
      aiVerificationVerdict: 'VERIFIED',
      aiVerificationReason: 'AI visual inspection confirms clean, clear water basin with dry surrounding perimeter tiles. Full resolution criteria met.'
    },
    history: [
      {
        id: 'hist-30',
        incidentId: 'inc-1012',
        action: 'Reported',
        performedBy: 'Alex Rivera',
        performedByRole: 'student',
        timestamp: hoursAgo(4)
      },
      {
        id: 'hist-31',
        incidentId: 'inc-1012',
        action: 'Marked Resolved with Photographic Evidence',
        performedBy: 'Marcus Vance',
        performedByRole: 'staff',
        timestamp: minsAgo(15),
        notes: 'Uploaded after photo. AI Verification scored 93% confidence.'
      }
    ]
  };

  // Generate 56 additional realistic incidents to achieve a full 60+ dataset
  const extraIncidents: Incident[] = [];
  const categoriesPool = [
    { cat: 'Electrical', sub: 'Lighting Fixture', dept: 'dept-electrical', deptName: 'Electrical Systems', prio: 'medium', sev: 3, risk: 1 },
    { cat: 'IT Support', sub: 'Network Access Point', dept: 'dept-it', deptName: 'IT Support & AV', prio: 'high', sev: 4, risk: 0 },
    { cat: 'Housekeeping', sub: 'Sanitation & Hygiene', dept: 'dept-housekeeping', deptName: 'Housekeeping & Sanitation', prio: 'low', sev: 2, risk: 1 },
    { cat: 'Laboratory', sub: 'Chemical Fume Hood', dept: 'dept-lab', deptName: 'Laboratory Equipment', prio: 'critical', sev: 5, risk: 5 },
    { cat: 'Security', sub: 'Door Latch & Card Reader', dept: 'dept-security', deptName: 'Campus Security', prio: 'high', sev: 4, risk: 3 },
    { cat: 'General Maintenance', sub: 'Broken Desk & Furniture', dept: 'dept-maintenance', deptName: 'General Maintenance', prio: 'low', sev: 1, risk: 0 },
    { cat: 'Facilities / HVAC', sub: 'Window Weather Seal', dept: 'dept-facilities', deptName: 'Facilities & HVAC', prio: 'medium', sev: 3, risk: 1 }
  ];

  const statuses: ('REPORTED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED')[] = [
    'REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'IN_PROGRESS', 'RESOLVED'
  ];

  for (let i = 1; i <= 56; i++) {
    const loc = DEMO_LOCATIONS[i % DEMO_LOCATIONS.length];
    const catObj = categoriesPool[i % categoriesPool.length];
    const status = statuses[i % statuses.length];
    const num = 1043 + i;
    const isCritical = catObj.prio === 'critical' || i % 6 === 0;
    const prio: PriorityLevel = isCritical ? 'critical' : (catObj.prio as PriorityLevel);
    const score = isCritical ? 82 + (i % 12) : 25 + (i * 3) % 45;
    const ageHours = (i * 2.5) % 96;

    extraIncidents.push({
      id: `inc-${num}`,
      incidentNumber: `INC-${num}`,
      title: `${catObj.sub} anomaly in ${loc.room}`,
      description: `Reported issue involving ${catObj.sub.toLowerCase()} in ${loc.room} (${loc.building}, Floor ${loc.floor}). Routine or urgent inspection logged.`,
      category: catObj.cat,
      subcategory: catObj.sub,
      priority: prio,
      priorityScore: score,
      scoreBreakdown: {
        severity: catObj.sev,
        safetyRisk: catObj.risk,
        affectedUsers: loc.type === 'hall' ? 60 : 25,
        locationCriticality: loc.criticality,
        duplicateCount: 1,
        totalScore: score,
        formulaDescription: `Computed weighted score: ${score}/100`
      },
      severity: catObj.sev,
      safetyRisk: catObj.risk,
      status: status,
      departmentId: catObj.dept,
      departmentName: catObj.deptName,
      assignedStaffId: 'user-staff',
      assignedStaffName: 'Marcus Vance',
      locationId: loc.id,
      building: loc.building,
      floor: loc.floor,
      room: loc.room,
      duplicateCount: 1 + (i % 3),
      supportingReports: [],
      slaHours: isCritical ? 2 : 8,
      slaDeadline: hoursAhead(Math.max(-2, 10 - ageHours)),
      isSlaBreached: ageHours > 12 && (status === 'REPORTED' || status === 'ASSIGNED' || status === 'IN_PROGRESS'),
      aiSuggestedActions: [
        `Dispatch assigned ${catObj.deptName} personnel for visual inspection.`,
        `Cross-check safety disconnect switches and service logs.`
      ],
      aiConfidence: 0.88 + ((i % 10) / 100),
      createdAt: hoursAgo(ageHours),
      updatedAt: hoursAgo(Math.max(0.5, ageHours / 2)),
      resolvedAt: (status === 'RESOLVED' || status === 'CLOSED') ? hoursAgo(ageHours / 3) : undefined,
      closedAt: status === 'CLOSED' ? hoursAgo(ageHours / 4) : undefined,
      history: [
        {
          id: `hist-extra-${i}`,
          incidentId: `inc-${num}`,
          action: 'Created & AI Triaged',
          performedBy: 'Alex Rivera',
          performedByRole: 'student',
          timestamp: hoursAgo(ageHours)
        }
      ]
    });
  }

  return [inc1042, inc1024, inc1033, inc1012, ...extraIncidents];
}
