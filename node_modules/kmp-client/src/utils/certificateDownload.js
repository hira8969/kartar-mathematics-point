import { instituteLogoDataUri, instituteSealDataUri, instituteSignatureDataUri } from "./certificateArtwork";

const AUTHORIZED_BY_NAME = "Subodh Kumar Yadav";

const escapeXml = (value = "") => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

export const buildCertificateSvg = (certificate) => {
  const studentName = escapeXml(certificate.student?.name || "Student");
  const courseTitle = escapeXml(certificate.course?.title || "Course");
  const className = escapeXml(certificate.course?.className || certificate.student?.studentClass || "-");
  const subject = escapeXml(certificate.course?.subject || "Mathematics");
  const board = escapeXml(certificate.course?.board || "Bihar Board");
  const batch = escapeXml(certificate.course?.batchName || "General Batch");
  const certNo = escapeXml(certificate.certificateNumber || "Pending");
  const issuedBy = escapeXml(AUTHORIZED_BY_NAME);
  const attendance = escapeXml(`${certificate.attendancePercent || 0}%`);
  const issueDate = escapeXml(new Date(certificate.issuedAt || Date.now()).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }));
  const qrCode = certificate.qrCodeDataUrl || "";
  const verificationUrl = escapeXml(certificate.verificationUrl || "");
  const instituteName = escapeXml(certificate.instituteName || "Kartar Mathematics Point");
  const logoDataUrl = certificate.instituteLogoDataUrl || instituteLogoDataUri;
  const signatureDataUrl = certificate.instituteSignatureDataUrl || instituteSignatureDataUri;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1100" viewBox="0 0 1600 1100">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#fff7ed"/>
        <stop offset="50%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#ecfccb"/>
      </linearGradient>
      <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f97316"/>
        <stop offset="50%" stop-color="#eab308"/>
        <stop offset="100%" stop-color="#10b981"/>
      </linearGradient>
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#c2410c" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect width="1600" height="1100" rx="40" fill="url(#bg)"/>
    <circle cx="190" cy="170" r="150" fill="#fdba74" opacity="0.28"/>
    <circle cx="1430" cy="180" r="160" fill="#86efac" opacity="0.26"/>
    <circle cx="1360" cy="920" r="200" fill="#38bdf8" opacity="0.14"/>
    <rect x="50" y="50" width="1500" height="1000" rx="34" fill="#ffffff" filter="url(#shadow)"/>
    <rect x="80" y="80" width="1440" height="940" rx="28" fill="none" stroke="url(#accent)" stroke-width="8"/>
    <rect x="120" y="120" width="1360" height="120" rx="24" fill="url(#accent)" opacity="0.12"/>
    <image href="${logoDataUrl}" x="130" y="118" width="120" height="120" />
    <image href="${instituteSealDataUri}" x="1290" y="800" width="150" height="150" opacity="0.95" />
    ${qrCode ? `<image href="${qrCode}" x="1240" y="320" width="155" height="155" />` : ""}
    <text x="1318" y="500" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="700" fill="#475569">Scan to verify</text>
    <text x="800" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="34" font-weight="700" fill="#9a3412">${instituteName}</text>
    <text x="800" y="245" text-anchor="middle" font-family="Georgia, serif" font-size="72" font-weight="700" fill="#111827">Course Completion Certificate</text>
    <text x="800" y="305" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#475569">Awarded for strong attendance, dedication, and successful completion</text>
    <text x="800" y="430" text-anchor="middle" font-family="Georgia, serif" font-size="36" fill="#64748b">This certifies that</text>
    <text x="800" y="520" text-anchor="middle" font-family="Georgia, serif" font-size="74" font-weight="700" fill="#0f172a">${studentName}</text>
    <text x="800" y="595" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" fill="#334155">has successfully completed</text>
    <text x="800" y="665" text-anchor="middle" font-family="Georgia, serif" font-size="54" font-weight="700" fill="#ea580c">${courseTitle}</text>
    <text x="800" y="720" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#475569">Class ${className} • ${subject} • ${board} • ${batch}</text>
    <rect x="220" y="790" width="1160" height="120" rx="26" fill="#fff7ed" stroke="#fed7aa" stroke-width="3"/>
    <text x="320" y="840" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#9a3412">Attendance</text>
    <text x="320" y="885" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#111827">${attendance}</text>
    <text x="630" y="840" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#9a3412">Certificate No.</text>
    <text x="630" y="885" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">${certNo}</text>
    <text x="1040" y="840" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#9a3412">Issued On</text>
    <text x="1040" y="885" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#111827">${issueDate}</text>
    <image href="${signatureDataUrl}" x="240" y="895" width="220" height="90" preserveAspectRatio="xMinYMid meet" />
    <line x1="250" y1="980" x2="520" y2="980" stroke="#94a3b8" stroke-width="3"/>
    <text x="250" y="1015" font-family="Arial, sans-serif" font-size="24" fill="#475569">Authorized By: ${issuedBy}</text>
    <line x1="1080" y1="980" x2="1350" y2="980" stroke="#94a3b8" stroke-width="3"/>
    <text x="1080" y="1015" font-family="Arial, sans-serif" font-size="24" fill="#475569">Seal of Excellence</text>
    <text x="800" y="1060" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#64748b">${verificationUrl}</text>
  </svg>`;
};

const getSafeName = (certificate) => (certificate.student?.name || "student").replace(/\s+/g, "-").toLowerCase();

export const downloadCertificateSvg = (certificate) => {
  const svg = buildCertificateSvg(certificate);
  const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${getSafeName(certificate)}-certificate.svg`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const downloadBlobFile = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.URL.revokeObjectURL(url);
};
