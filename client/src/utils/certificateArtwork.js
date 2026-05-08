export const instituteLogoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" fill="none">
  <defs>
    <linearGradient id="logoGrad" x1="24" y1="24" x2="136" y2="136" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F97316"/>
      <stop offset="0.55" stop-color="#FACC15"/>
      <stop offset="1" stop-color="#10B981"/>
    </linearGradient>
  </defs>
  <rect x="12" y="12" width="136" height="136" rx="34" fill="url(#logoGrad)"/>
  <circle cx="80" cy="80" r="42" fill="rgba(255,255,255,0.22)"/>
  <path d="M47 96L80 45L113 96H98L80 68L62 96H47Z" fill="white"/>
  <text x="80" y="122" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="800" fill="white">KMP</text>
</svg>`;

export const instituteSealSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" fill="none">
  <defs>
    <linearGradient id="sealGrad" x1="30" y1="30" x2="170" y2="170" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0F172A"/>
      <stop offset="1" stop-color="#334155"/>
    </linearGradient>
  </defs>
  <circle cx="100" cy="100" r="86" fill="url(#sealGrad)" opacity="0.94"/>
  <circle cx="100" cy="100" r="68" fill="none" stroke="#F8FAFC" stroke-width="4" stroke-dasharray="5 6"/>
  <circle cx="100" cy="100" r="46" fill="#F59E0B" opacity="0.95"/>
  <path d="M100 58L109 85H137L114 101L122 128L100 112L78 128L86 101L63 85H91L100 58Z" fill="#FFF7ED"/>
  <text x="100" y="164" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="800" fill="#F8FAFC">SEAL OF EXCELLENCE</text>
</svg>`;

export const instituteSignatureSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="380" height="120" viewBox="0 0 380 120" fill="none">
  <g stroke="#3D3540" stroke-linecap="round" stroke-linejoin="round">
    <path d="M35 74C8 68 11 32 48 20C87 8 139 18 145 43C151 68 106 75 72 74" stroke-width="5"/>
    <path d="M72 73V34C72 31 76 31 77 34C79 45 81 61 82 73" stroke-width="5"/>
    <path d="M106 72V33" stroke-width="5"/>
    <path d="M107 55C122 45 127 35 137 31" stroke-width="5"/>
    <path d="M158 72C166 59 173 50 184 53C193 55 190 70 198 70C208 70 211 55 222 56C234 57 229 72 240 72C250 72 256 63 266 63C277 63 284 69 297 70" stroke-width="5"/>
    <path d="M34 76C110 75 199 75 335 76" stroke-width="4"/>
    <path d="M328 72L348 77L329 81" stroke-width="3"/>
  </g>
</svg>`;

export const svgToDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export const instituteLogoDataUri = svgToDataUri(instituteLogoSvg);
export const instituteSealDataUri = svgToDataUri(instituteSealSvg);
export const instituteSignatureDataUri = svgToDataUri(instituteSignatureSvg);
