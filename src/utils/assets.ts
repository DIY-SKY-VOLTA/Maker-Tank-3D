/**
 * Vector SVG and illustration assets matching Maker Tank 3D branding and visual mockups.
 * Provides high-fidelity rendering without relying on external third-party hosts.
 */

export const ASSETS = {
  // 3D Printer Hero Asset (Bambu Lab style with glass chamber, toolhead printing spiral vase)
  heroPrinter: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
      <defs>
        <linearGradient id="bgG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#e2e8f0"/>
        </linearGradient>
        <linearGradient id="metalG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="50%" stop-color="#334155"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <linearGradient id="bedG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#475569"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
        <linearGradient id="vaseG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#f1f5f9"/>
          <stop offset="100%" stop-color="#cbd5e1"/>
        </linearGradient>
        <linearGradient id="amberG" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f97316"/>
          <stop offset="100%" stop-color="#ea580c"/>
        </linearGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-opacity="0.15"/>
        </filter>
      </defs>
      <rect width="800" height="600" fill="url(#bgG)"/>
      <ellipse cx="400" cy="510" rx="280" ry="25" fill="#94a3b8" opacity="0.3"/>
      
      <!-- Base Chassis -->
      <g filter="url(#shadow)">
        <rect x="180" y="440" width="440" height="70" rx="16" fill="url(#metalG)"/>
        <!-- Brand on printer -->
        <text x="400" y="482" fill="#94a3b8" font-family="Plus Jakarta Sans, sans-serif" font-size="16" font-weight="700" letter-spacing="3" text-anchor="middle">BAMBU LAB • MAKER TANK</text>
        <circle cx="215" cy="475" r="5" fill="#22c55e"/>
      </g>

      <!-- Vertical Z-Columns & Top Gantry -->
      <rect x="220" y="110" width="36" height="340" rx="6" fill="#334155"/>
      <rect x="544" y="110" width="36" height="340" rx="6" fill="#334155"/>
      <rect x="200" y="90" width="400" height="36" rx="8" fill="url(#metalG)"/>
      
      <!-- Lead Screws & Rods -->
      <line x1="265" y1="120" x2="265" y2="440" stroke="#cbd5e1" stroke-width="6"/>
      <line x1="535" y1="120" x2="535" y2="440" stroke="#cbd5e1" stroke-width="6"/>

      <!-- Heated Build Plate & Platform -->
      <rect x="260" y="380" width="280" height="24" rx="4" fill="url(#bedG)"/>
      <rect x="275" y="375" width="250" height="6" rx="2" fill="#d97706" opacity="0.8"/>

      <!-- Spiral 3D Printed Vase on Bed -->
      <g>
        <path d="M 360,375 C 335,320 330,260 355,200 C 375,180 425,180 445,200 C 470,260 465,320 440,375 Z" fill="url(#vaseG)" stroke="#94a3b8" stroke-width="2"/>
        <!-- Spiral ridges -->
        <path d="M 345,340 Q 400,320 455,340" fill="none" stroke="#64748b" stroke-width="2.5" opacity="0.6"/>
        <path d="M 338,295 Q 400,270 462,295" fill="none" stroke="#64748b" stroke-width="2.5" opacity="0.6"/>
        <path d="M 346,250 Q 400,225 454,250" fill="none" stroke="#64748b" stroke-width="2.5" opacity="0.6"/>
        <path d="M 360,210 Q 400,195 440,210" fill="none" stroke="#64748b" stroke-width="2.5" opacity="0.6"/>
      </g>

      <!-- Extruder Toolhead & X-Axis Beam -->
      <rect x="210" y="170" width="380" height="20" rx="4" fill="#1e293b"/>
      <g>
        <rect x="365" y="145" width="70" height="55" rx="8" fill="#0f172a"/>
        <circle cx="400" cy="172" r="14" fill="#334155"/>
        <path d="M 390,200 L 410,200 L 402,212 L 398,212 Z" fill="#f59e0b"/>
        <!-- Hotend glowing tip -->
        <circle cx="400" cy="214" r="3" fill="#ef4444"/>
        <line x1="400" y1="214" x2="400" y2="200" stroke="#f97316" stroke-width="2"/>
      </g>

      <!-- Filament Spool and Guide Tube -->
      <circle cx="580" cy="75" r="45" fill="#475569"/>
      <circle cx="580" cy="75" r="24" fill="#0f172a"/>
      <path d="M 570,110 C 530,120 450,110 410,145" fill="none" stroke="#f97316" stroke-width="4"/>
    </svg>
  `)}`,

  // Concept to Physical Product (Laptop CAD screen + 3D printed mechanical gears)
  conceptCad: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
      <defs>
        <linearGradient id="cadBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#090d16"/>
          <stop offset="100%" stop-color="#1e293b"/>
        </linearGradient>
      </defs>
      <rect width="800" height="500" rx="16" fill="#f1f5f9"/>
      <!-- Laptop body -->
      <rect x="80" y="100" width="360" height="240" rx="12" fill="#334155"/>
      <rect x="95" y="115" width="330" height="210" rx="6" fill="url(#cadBg)"/>
      <rect x="40" y="340" width="440" height="16" rx="8" fill="#64748b"/>
      
      <!-- CAD Wireframe Grid on Laptop Screen -->
      <g stroke="#38bdf8" stroke-width="1.2" opacity="0.6">
        <line x1="120" y1="130" x2="400" y2="130"/>
        <line x1="120" y1="170" x2="400" y2="170"/>
        <line x1="120" y1="210" x2="400" y2="210"/>
        <line x1="120" y1="250" x2="400" y2="250"/>
        <line x1="120" y1="290" x2="400" y2="290"/>
        <line x1="150" y1="120" x2="150" y2="310"/>
        <line x1="210" y1="120" x2="210" y2="310"/>
        <line x1="270" y1="120" x2="270" y2="310"/>
        <line x1="330" y1="120" x2="330" y2="310"/>
        <line x1="390" y1="120" x2="390" y2="310"/>
      </g>
      <!-- CAD Gear Isometric on Screen -->
      <circle cx="260" cy="220" r="50" fill="none" stroke="#f97316" stroke-width="3"/>
      <circle cx="260" cy="220" r="22" fill="#0284c7" opacity="0.4"/>
      <text x="110" y="135" fill="#38bdf8" font-family="monospace" font-size="11">MAKER_CAD_V2 // EXTRUDE_3D</text>

      <!-- Physical 3D Printed Parts Next to Laptop -->
      <!-- Big Black Gear -->
      <g transform="translate(560, 240)">
        <circle cx="0" cy="0" r="85" fill="#0f172a"/>
        <circle cx="0" cy="0" r="55" fill="#1e293b"/>
        <circle cx="0" cy="0" r="24" fill="#f1f5f9"/>
        <!-- Gear teeth -->
        <rect x="-12" y="-105" width="24" height="20" rx="3" fill="#0f172a"/>
        <rect x="-12" y="85" width="24" height="20" rx="3" fill="#0f172a"/>
        <rect x="-105" y="-12" width="20" height="24" rx="3" fill="#0f172a"/>
        <rect x="85" y="-12" width="20" height="24" rx="3" fill="#0f172a"/>
        <rect x="55" y="55" width="20" height="24" rx="3" transform="rotate(45 65 67)" fill="#0f172a"/>
        <rect x="-75" y="-75" width="20" height="24" rx="3" transform="rotate(45 -65 -63)" fill="#0f172a"/>
        <rect x="55" y="-75" width="20" height="24" rx="3" transform="rotate(-45 65 -63)" fill="#0f172a"/>
        <rect x="-75" y="55" width="20" height="24" rx="3" transform="rotate(-45 -65 67)" fill="#0f172a"/>
      </g>

      <!-- White Spiral Voronoi Ball / Stand -->
      <g transform="translate(680, 310)">
        <circle cx="0" cy="0" r="55" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <circle cx="-15" cy="-10" r="14" fill="#e2e8f0"/>
        <circle cx="20" cy="-15" r="12" fill="#e2e8f0"/>
        <circle cx="5" cy="22" r="16" fill="#e2e8f0"/>
      </g>
    </svg>
  `)}`,

  // Spiral Plant Pot
  spiralPlantPot: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#f8fafc"/>
      <ellipse cx="200" cy="350" rx="90" ry="12" fill="#cbd5e1" opacity="0.6"/>
      <!-- Pot -->
      <path d="M 140,340 C 120,280 115,220 135,160 L 265,160 C 285,220 280,280 260,340 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
      <!-- Spiral grooves -->
      <path d="M 125,190 Q 200,215 275,190" fill="none" stroke="#e2e8f0" stroke-width="4"/>
      <path d="M 120,230 Q 200,255 280,230" fill="none" stroke="#e2e8f0" stroke-width="4"/>
      <path d="M 125,270 Q 200,295 275,270" fill="none" stroke="#e2e8f0" stroke-width="4"/>
      <path d="M 135,310 Q 200,335 265,310" fill="none" stroke="#e2e8f0" stroke-width="4"/>
      <!-- Succulent Plant -->
      <ellipse cx="200" cy="160" rx="65" ry="14" fill="#334155"/>
      <path d="M 200,160 C 180,110 130,90 120,110 C 130,130 170,145 200,160 Z" fill="#22c55e"/>
      <path d="M 200,160 C 220,110 270,90 280,110 C 270,130 230,145 200,160 Z" fill="#16a34a"/>
      <path d="M 200,160 C 200,90 170,60 190,55 C 210,60 210,110 200,160 Z" fill="#15803d"/>
      <path d="M 200,160 C 160,130 160,80 175,80 C 190,90 195,130 200,160 Z" fill="#4ade80"/>
      <path d="M 200,160 C 240,130 240,80 225,80 C 210,90 205,130 200,160 Z" fill="#86efac"/>
    </svg>
  `)}`,

  // Moon Lamp
  moonLamp: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#090d16"/>
      <defs>
        <radialGradient id="moonG" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#fffbeb"/>
          <stop offset="40%" stop-color="#fef3c7"/>
          <stop offset="80%" stop-color="#fde68a"/>
          <stop offset="100%" stop-color="#d97706"/>
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <!-- Tripod Wooden Stand -->
      <g stroke="#78350f" stroke-width="8" stroke-linecap="round">
        <line x1="200" y1="260" x2="140" y2="350"/>
        <line x1="200" y1="260" x2="260" y2="350"/>
        <line x1="200" y1="260" x2="200" y2="360"/>
      </g>
      <!-- Moon Sphere -->
      <circle cx="200" cy="180" r="100" fill="url(#moonG)" filter="url(#glow)"/>
      <!-- Moon Craters (3D lithophane texture) -->
      <g fill="#b45309" opacity="0.25">
        <circle cx="160" cy="150" r="18"/>
        <circle cx="170" cy="155" r="8"/>
        <circle cx="220" cy="130" r="24"/>
        <circle cx="240" cy="200" r="16"/>
        <circle cx="180" cy="220" r="28"/>
        <circle cx="150" cy="210" r="12"/>
      </g>
    </svg>
  `)}`,

  // Phone Stand
  phoneStand: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#f8fafc"/>
      <ellipse cx="200" cy="340" rx="100" ry="12" fill="#cbd5e1" opacity="0.6"/>
      <!-- Matte Black Phone Stand -->
      <path d="M 140,320 L 250,320 L 280,310 L 170,310 Z" fill="#1e293b"/>
      <path d="M 160,315 L 230,130 L 255,140 L 185,325 Z" fill="#0f172a"/>
      <!-- Lip holder -->
      <path d="M 185,325 L 180,285 L 205,290 L 210,330 Z" fill="#334155"/>
      <!-- Cable pass-through hole -->
      <ellipse cx="207" cy="220" rx="14" ry="24" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
    </svg>
  `)}`,

  // Custom Name Keychain
  keychain: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#f8fafc"/>
      <ellipse cx="200" cy="330" rx="120" ry="14" fill="#cbd5e1" opacity="0.5"/>
      <!-- Metal Ring -->
      <circle cx="100" cy="180" r="35" fill="none" stroke="#94a3b8" stroke-width="8"/>
      <circle cx="100" cy="180" r="42" fill="none" stroke="#e2e8f0" stroke-width="2"/>
      <rect x="130" y="172" width="25" height="16" rx="4" fill="#64748b"/>
      <!-- 3D Printed Name Tag (Dual Color Red/White) -->
      <g transform="rotate(-15 220 200)">
        <rect x="140" y="170" width="220" height="60" rx="12" fill="#dc2626"/>
        <rect x="145" y="175" width="210" height="50" rx="8" fill="#ef4444"/>
        <text x="250" y="210" fill="#ffffff" font-family="Plus Jakarta Sans, sans-serif" font-weight="800" font-size="28" letter-spacing="2" text-anchor="middle">MAKER</text>
      </g>
    </svg>
  `)}`,

  // Dragon Figurine STL
  dragonStl: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <rect width="400" height="400" fill="#f1f5f9"/>
      <!-- Low poly wireframe dragon concept -->
      <path d="M 120,320 L 190,140 L 260,180 L 320,120 L 280,240 L 300,320 Z" fill="#64748b" opacity="0.2"/>
      <path d="M 180,320 L 200,200 L 250,220 L 270,320 Z" fill="#334155"/>
      <path d="M 200,200 L 220,120 L 270,160 Z" fill="#475569"/>
      <path d="M 150,240 L 110,180 L 170,190 Z" fill="#0f172a"/>
      <path d="M 270,160 L 330,140 L 290,220 Z" fill="#1e293b"/>
      <text x="200" y="360" fill="#475569" font-family="monospace" font-size="14" font-weight="700" text-anchor="middle">STL • ARTICULATED DRAGON</text>
    </svg>
  `)}`,

  // Events Gift Box
  eventGifting: `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="100%" height="100%">
      <defs>
        <linearGradient id="boxG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff1f2"/>
          <stop offset="100%" stop-color="#ffe4e6"/>
        </linearGradient>
      </defs>
      <rect width="800" height="400" rx="16" fill="url(#boxG)"/>
      <ellipse cx="400" cy="340" rx="180" ry="20" fill="#fecdd3" opacity="0.6"/>
      <!-- 3D Printed Hexagonal Gift Box -->
      <rect x="310" y="160" width="180" height="150" rx="12" fill="#ffffff" stroke="#f43f5e" stroke-width="3"/>
      <rect x="295" y="140" width="210" height="30" rx="8" fill="#fda4af" stroke="#f43f5e" stroke-width="2"/>
      <!-- Ribbon -->
      <rect x="385" y="140" width="30" height="170" fill="#f43f5e"/>
      <circle cx="400" cy="135" r="22" fill="#e11d48"/>
      <text x="400" y="70" fill="#9f1239" font-family="Plus Jakarta Sans, sans-serif" font-size="28" font-weight="800" text-anchor="middle">MAKE EVERY MOMENT MEMORABLE</text>
      <text x="400" y="100" fill="#be123c" font-family="Plus Jakarta Sans, sans-serif" font-size="15" text-anchor="middle">Unique 3D Printed Return Gifts, Trophies &amp; Celebration Keepsakes</text>
    </svg>
  `)}`,
};
