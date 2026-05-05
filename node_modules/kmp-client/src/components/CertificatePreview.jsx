import { instituteLogoDataUri, instituteSealDataUri, instituteSignatureDataUri } from "../utils/certificateArtwork";
import { formatDate } from "../utils/formatters";

const statusTone = {
  valid: "bg-emerald-100 text-emerald-700",
  expired: "bg-amber-100 text-amber-700",
  revoked: "bg-red-100 text-red-700"
};

const AUTHORIZED_BY_NAME = "Subodh Kumar Yadav";

export default function CertificatePreview({ certificate, compact = false }) {
  const logoSrc = certificate.instituteLogoDataUrl || instituteLogoDataUri;
  const signatureSrc = certificate.instituteSignatureDataUrl || instituteSignatureDataUri;
  const instituteName = certificate.instituteName || "Kartar Mathematics Point";
  const showUpdatedAt = certificate.updatedAt && new Date(certificate.updatedAt).getTime() !== new Date(certificate.issuedAt).getTime();

  return (
    <div className={`certificate-shell ${compact ? "certificate-shell-compact" : ""}`}>
      <div className="certificate-card-3d">
        <div className="certificate-orb certificate-orb-left" />
        <div className="certificate-orb certificate-orb-right" />
        <div className="certificate-grid" />
        <div className="certificate-ribbon">Certificate of Completion</div>
        <img src={logoSrc} alt={`${instituteName} logo`} className="certificate-logo" />
        <img src={instituteSealDataUri} alt={`${instituteName} seal`} className="certificate-seal" />
        {certificate.qrCodeDataUrl ? (
          <div className="certificate-qr-wrap">
            <img src={certificate.qrCodeDataUrl} alt="Certificate verification QR" className="certificate-qr" />
            <p className="certificate-qr-label">Scan to verify</p>
          </div>
        ) : null}
        <div className="certificate-content">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="certificate-brand">{instituteName}</p>
              {certificate.status ? <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${statusTone[certificate.status] || statusTone.valid}`}>{certificate.status}</span> : null}
            </div>
            <h3 className="certificate-title">Excellence Certificate</h3>
            <p className="certificate-subtitle">Awarded for disciplined attendance and successful course completion</p>
          </div>

          <div className="certificate-name-wrap">
            <p className="certificate-caption">Presented To</p>
            <p className="certificate-name">{certificate.student?.name}</p>
          </div>

          <div className="certificate-course-wrap">
            <p className="certificate-course">{certificate.course?.title}</p>
            <p className="certificate-meta">Class {certificate.course?.className || certificate.student?.studentClass || "-"} | {certificate.course?.subject || "Mathematics"}</p>
            <p className="certificate-meta">Attendance {certificate.attendancePercent}% | Issued {formatDate(certificate.issuedAt || new Date())}</p>
            {showUpdatedAt ? <p className="certificate-meta">Updated {formatDate(certificate.updatedAt)}</p> : null}
            {certificate.expiresAt ? <p className="certificate-meta">Valid Until: {formatDate(certificate.expiresAt)}</p> : null}
            {certificate.status === "revoked" ? <p className="certificate-meta text-red-700">Revoked: {certificate.revocationReason || "Administrative action"}</p> : null}
            {certificate.verificationUrl ? <p className="certificate-meta break-all">Verify: {certificate.verificationUrl}</p> : null}
          </div>

          <div className="certificate-footer-row">
            <div>
              <p className="certificate-foot-label">Certificate No.</p>
              <p className="certificate-foot-value">{certificate.certificateNumber || "Eligible"}</p>
            </div>
            <div>
              <p className="certificate-foot-label">Authorized By</p>
              <p className="certificate-foot-value">{AUTHORIZED_BY_NAME}</p>
            </div>
          </div>
          <div className="certificate-signature-block">
            <img src={signatureSrc} alt="Authorized signature" className="certificate-signature" />
          </div>
        </div>
      </div>
    </div>
  );
}
