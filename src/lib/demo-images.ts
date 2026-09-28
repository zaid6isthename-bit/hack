// High-fidelity SVG Data URIs for realistic campus incident evidence (Before & After)
// Crisp, fully self-contained, no external network or CORS dependencies

function createSvgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const DEMO_EVIDENCE_IMAGES = {
  // AC Leaking onto power socket
  acWaterLeakBefore: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#1e2430"/>
      <!-- Wall and room texture -->
      <rect x="0" y="0" width="600" height="320" fill="#2d3748"/>
      <rect x="0" y="320" width="600" height="80" fill="#1a202c"/>
      <line x1="0" y1="320" x2="600" y2="320" stroke="#4a5568" stroke-width="3"/>
      <!-- AC Indoor Unit -->
      <rect x="120" y="50" width="360" height="110" rx="8" fill="#e2e8f0" stroke="#cbd5e0" stroke-width="2"/>
      <rect x="140" y="130" width="320" height="15" rx="3" fill="#94a3b8"/>
      <circle x="440" y="80" r="5" fill="#ef4444"/>
      <text x="445" y="84" font-family="sans-serif" font-size="9" fill="#e2e8f0">ERR-302</text>
      <!-- Leaking Water Streams -->
      <path d="M 220 145 Q 225 190 222 240 Q 220 280 224 320" stroke="#38bdf8" stroke-width="4" fill="none" opacity="0.85" stroke-dasharray="8,4"/>
      <path d="M 280 145 Q 275 200 282 250 Q 285 290 280 320" stroke="#0284c7" stroke-width="5" fill="none" opacity="0.9"/>
      <!-- Water puddle on floor -->
      <ellipse cx="260" cy="335" rx="110" ry="22" fill="#0284c7" opacity="0.75"/>
      <ellipse cx="260" cy="335" rx="60" ry="12" fill="#38bdf8" opacity="0.6"/>
      <!-- Wall electrical outlet nearby -->
      <rect x="330" y="210" width="55" height="75" rx="6" fill="#f8fafc" stroke="#dc2626" stroke-width="3"/>
      <rect x="345" y="225" width="8" height="18" rx="2" fill="#334155"/>
      <rect x="362" y="225" width="8" height="18" rx="2" fill="#334155"/>
      <circle cx="357" cy="260" r="4" fill="#334155"/>
      <!-- Spark warning near outlet -->
      <path d="M 320 230 L 335 240 L 325 245 L 340 260" stroke="#eab308" stroke-width="3" fill="none"/>
      <!-- Caution banner overlay -->
      <rect x="20" y="20" width="220" height="32" rx="6" fill="#7f1d1d" opacity="0.95"/>
      <text x="32" y="41" font-family="sans-serif" font-weight="bold" font-size="13" fill="#fef2f2">⚠️ HAZARD: WATER + ELECTRICAL</text>
    </svg>
  `),

  // AC Fixed / Repaired
  acWaterLeakAfter: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#1e2430"/>
      <rect x="0" y="0" width="600" height="320" fill="#2d3748"/>
      <rect x="0" y="320" width="600" height="80" fill="#1a202c"/>
      <line x1="0" y1="320" x2="600" y2="320" stroke="#4a5568" stroke-width="3"/>
      <!-- AC Unit Clean & Serviced -->
      <rect x="120" y="50" width="360" height="110" rx="8" fill="#f8fafc" stroke="#10b981" stroke-width="3"/>
      <rect x="140" y="130" width="320" height="15" rx="3" fill="#cbd5e1"/>
      <circle cx="440" cy="80" r="5" fill="#10b981"/>
      <text x="430" y="98" font-family="sans-serif" font-size="9" fill="#10b981">NORMAL</text>
      <!-- New insulated drain pipe rerouted away from socket -->
      <path d="M 450 145 L 450 320 L 580 320" stroke="#94a3b8" stroke-width="8" fill="none"/>
      <!-- Dry Wall & Floor -->
      <rect x="330" y="210" width="55" height="75" rx="6" fill="#f8fafc" stroke="#10b981" stroke-width="2"/>
      <rect x="345" y="225" width="8" height="18" rx="2" fill="#334155"/>
      <rect x="362" y="225" width="8" height="18" rx="2" fill="#334155"/>
      <circle cx="357" cy="260" r="4" fill="#334155"/>
      <!-- Resolution stamp -->
      <rect x="20" y="20" width="220" height="32" rx="6" fill="#065f46" opacity="0.95"/>
      <text x="32" y="41" font-family="sans-serif" font-weight="bold" font-size="13" fill="#ecfdf5">✓ RESOLVED: DRAIN REROUTED &amp; DRY</text>
    </svg>
  `),

  // Broken Projector in Lab 3
  projectorBrokenBefore: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#0f172a"/>
      <!-- Ceiling mount -->
      <rect x="280" y="0" width="40" height="70" fill="#64748b"/>
      <rect x="220" y="70" width="160" height="60" rx="8" fill="#334155" stroke="#ef4444" stroke-width="2"/>
      <circle cx="260" cy="100" r="16" fill="#1e293b" stroke="#475569" stroke-width="2"/>
      <circle cx="340" cy="90" r="4" fill="#ef4444"/>
      <text x="325" y="112" font-family="sans-serif" font-size="8" fill="#ef4444">LAMP FAIL</text>
      <!-- Projection Screen with static/glitch -->
      <rect x="80" y="170" width="440" height="190" fill="#020617" stroke="#475569" stroke-width="4"/>
      <line x1="80" y1="210" x2="520" y2="210" stroke="#ef4444" stroke-width="2" stroke-dasharray="10,5"/>
      <line x1="80" y1="260" x2="520" y2="260" stroke="#38bdf8" stroke-width="3" stroke-dasharray="5,15"/>
      <line x1="80" y1="300" x2="520" y2="300" stroke="#eab308" stroke-width="1"/>
      <text x="210" y="270" font-family="monospace" font-size="18" fill="#ef4444" font-weight="bold">NO SIGNAL / LAMP FAULT</text>
      <!-- Tag -->
      <rect x="20" y="20" width="190" height="32" rx="6" fill="#7f1d1d" opacity="0.95"/>
      <text x="32" y="41" font-family="sans-serif" font-weight="bold" font-size="13" fill="#fef2f2">❌ HARDWARE ERROR</text>
    </svg>
  `),

  // Projector Fixed
  projectorFixedAfter: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#0f172a"/>
      <rect x="280" y="0" width="40" height="70" fill="#64748b"/>
      <rect x="220" y="70" width="160" height="60" rx="8" fill="#334155" stroke="#10b981" stroke-width="2"/>
      <circle cx="260" cy="100" r="16" fill="#38bdf8" opacity="0.9"/>
      <circle cx="340" cy="90" r="4" fill="#10b981"/>
      <!-- Crystal clear projection light cone -->
      <polygon points="260,110 80,170 520,170" fill="#38bdf8" opacity="0.12"/>
      <!-- Screen with crisp display -->
      <rect x="80" y="170" width="440" height="190" fill="#0f766e" stroke="#10b981" stroke-width="3"/>
      <text x="140" y="250" font-family="sans-serif" font-size="22" fill="#ffffff" font-weight="bold">CS304: Distributed Systems</text>
      <text x="140" y="280" font-family="sans-serif" font-size="14" fill="#a7f3d0">HDMI-1 Output 4K 60Hz • Audio OK</text>
      <!-- Tag -->
      <rect x="20" y="20" width="190" height="32" rx="6" fill="#065f46" opacity="0.95"/>
      <text x="32" y="41" font-family="sans-serif" font-weight="bold" font-size="13" fill="#ecfdf5">✓ BULB REPLACED &amp; TESTED</text>
    </svg>
  `),

  // Sparking Fan in Room 204
  fanSparkingBefore: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#1e293b"/>
      <!-- Ceiling -->
      <rect x="0" y="0" width="600" height="60" fill="#0f172a"/>
      <!-- Fan Rod & Motor Housing tilted -->
      <line x1="300" y1="60" x2="300" y2="170" stroke="#475569" stroke-width="12"/>
      <circle cx="300" cy="190" r="45" fill="#334155" stroke="#ef4444" stroke-width="3"/>
      <!-- Damaged / Bent Blades -->
      <path d="M 300 190 L 150 140" stroke="#64748b" stroke-width="14" stroke-linecap="round"/>
      <path d="M 300 190 L 450 160" stroke="#64748b" stroke-width="14" stroke-linecap="round"/>
      <path d="M 300 190 L 320 320" stroke="#ef4444" stroke-width="14" stroke-linecap="round"/>
      <!-- Sparks & smoke -->
      <circle cx="300" cy="180" r="15" fill="#eab308" opacity="0.8"/>
      <path d="M 280 160 L 260 140 M 310 160 L 330 130 M 320 180 L 350 190" stroke="#f97316" stroke-width="3"/>
      <circle cx="280" cy="140" r="18" fill="#475569" opacity="0.5"/>
      <!-- Hazard banner -->
      <rect x="20" y="20" width="220" height="32" rx="6" fill="#7f1d1d" opacity="0.95"/>
      <text x="32" y="41" font-family="sans-serif" font-weight="bold" font-size="13" fill="#fef2f2">⚠️ RECURRING SPARK HAZARD</text>
    </svg>
  `),

  // Fan Replaced
  fanRepairedAfter: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#1e293b"/>
      <rect x="0" y="0" width="600" height="60" fill="#0f172a"/>
      <line x1="300" y1="60" x2="300" y2="170" stroke="#64748b" stroke-width="12"/>
      <circle cx="300" cy="190" r="45" fill="#f8fafc" stroke="#10b981" stroke-width="3"/>
      <!-- Balanced blades spinning smoothly -->
      <path d="M 300 190 L 140 190" stroke="#e2e8f0" stroke-width="16" stroke-linecap="round"/>
      <path d="M 300 190 L 380 90" stroke="#e2e8f0" stroke-width="16" stroke-linecap="round"/>
      <path d="M 300 190 L 380 290" stroke="#e2e8f0" stroke-width="16" stroke-linecap="round"/>
      <circle cx="300" cy="190" r="10" fill="#10b981"/>
      <!-- Resolution tag -->
      <rect x="20" y="20" width="240" height="32" rx="6" fill="#065f46" opacity="0.95"/>
      <text x="32" y="41" font-family="sans-serif" font-weight="bold" font-size="13" fill="#ecfdf5">✓ NEW COMMERCIAL UNIT INSTALLED</text>
    </svg>
  `),

  // Wi-Fi Access Point Failure
  wifiBrokenBefore: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#0f172a"/>
      <!-- AP on wall -->
      <rect x="220" y="100" width="160" height="180" rx="16" fill="#1e293b" stroke="#ef4444" stroke-width="3"/>
      <!-- Red status LED -->
      <circle cx="300" cy="160" r="12" fill="#ef4444"/>
      <text x="250" y="220" font-family="monospace" font-size="14" fill="#ef4444" font-weight="bold">LINK DOWN</text>
      <text x="245" y="245" font-family="monospace" font-size="11" fill="#94a3b8">AP-ENG-FL2-04</text>
      <!-- Offline Wi-Fi Waves with Cross -->
      <line x1="200" y1="80" x2="400" y2="280" stroke="#ef4444" stroke-width="6"/>
      <line x1="400" y1="80" x2="200" y2="280" stroke="#ef4444" stroke-width="6"/>
    </svg>
  `),

  // Wi-Fi Fixed
  wifiFixedAfter: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="100%" height="100%">
      <rect width="600" height="400" fill="#0f172a"/>
      <rect x="220" y="100" width="160" height="180" rx="16" fill="#1e293b" stroke="#10b981" stroke-width="3"/>
      <circle cx="300" cy="160" r="12" fill="#10b981"/>
      <text x="260" y="220" font-family="monospace" font-size="14" fill="#10b981" font-weight="bold">ONLINE</text>
      <text x="245" y="245" font-family="monospace" font-size="11" fill="#94a3b8">AP-ENG-FL2-04</text>
      <!-- Radiating Green Waves -->
      <path d="M 230 60 A 90 90 0 0 1 370 60" fill="none" stroke="#10b981" stroke-width="4"/>
      <path d="M 250 80 A 60 60 0 0 1 350 80" fill="none" stroke="#10b981" stroke-width="4"/>
    </svg>
  `),
};
