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
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="110" viewBox="0 0 320 110" fill="none">
  <path d="M22 72C39 64 47 34 57 34C64 34 63 53 70 53C77 53 79 30 92 30C104 30 96 74 109 74C118 74 124 47 134 47C143 47 143 68 151 68C162 68 169 28 182 28C195 28 185 74 200 74C210 74 213 49 225 49C237 49 239 72 252 72C264 72 272 54 294 38" stroke="#0F172A" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M22 88H298" stroke="#94A3B8" stroke-width="2"/>
  <text x="28" y="104" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#475569">Authorized Signature</text>
</svg>`;

export const svgToDataUri = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

export const instituteLogoDataUri = svgToDataUri(instituteLogoSvg);
export const instituteSealDataUri = svgToDataUri(instituteSealSvg);
export const instituteSignatureDataUri = svgToDataUri(instituteSignatureSvg);
