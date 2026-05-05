import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CertificatePreview from "../../components/CertificatePreview";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { certificateService } from "../../services/certificateService";
import { downloadBlobFile, downloadCertificateSvg } from "../../utils/certificateDownload";
import { formatDate } from "../../utils/formatters";

const statusText = {
  valid: "This certificate is valid and active.",
  expired: "This certificate is genuine but has expired.",
  revoked: "This certificate was issued by the institute but has been revoked."
};

export default function CertificateVerifyPage() {
  const { certificateNumber } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    certificateService.verify(certificateNumber)
      .then(setCertificate)
      .catch((err) => setError(err.response?.data?.message || "Certificate not found"))
      .finally(() => setLoading(false));
  }, [certificateNumber]);

  const downloadPdf = async () => {
    if (!certificate?.certificateNumber) return;
    const blob = await certificateService.downloadPublicPdf(certificate.certificateNumber);
    const safeName = (certificate.student?.name || "student").replace(/\s+/g, "-").toLowerCase();
    downloadBlobFile(blob, `${safeName}-certificate.pdf`);
  };

  const details = certificate ? [
    { label: "Student Name", value: certificate.student?.name || "-" },
    { label: "Student Class", value: certificate.course?.className || certificate.student?.studentClass || "-" },
    { label: "Phone", value: certificate.student?.phone || "-" },
    { label: "Email", value: certificate.student?.email || "-" },
    { label: "Coaching", value: certificate.instituteName || "-" },
    { label: "Coaching Contact", value: certificate.instituteContact || "-" },
    { label: "Coaching Address", value: certificate.instituteAddress || "-" },
    { label: "Course", value: certificate.course?.title || "-" },
    { label: "Subject", value: certificate.course?.subject || "-" },
    { label: "Board", value: certificate.course?.board || "-" },
    { label: "Batch", value: certificate.course?.batchName || "-" },
    { label: "Certificate No.", value: certificate.certificateNumber || "-" },
    { label: "Issue Date", value: formatDate(certificate.issuedAt) },
    { label: "Updated Date", value: formatDate(certificate.updatedAt || certificate.issuedAt) }
  ] : [];

  if (loading) return <LoadingState label="Verifying certificate..." />;

  return (
    <div className="bg-app min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader eyebrow="Certificate Verification" title={certificate ? "Verified Certificate" : "Verification Failed"} description={certificate ? statusText[certificate.status] || statusText.valid : "We could not find a certificate matching this verification code."} />
        {certificate ? (
          <SectionCard title="Verified Record">
            <div className="space-y-5">
              <CertificatePreview certificate={certificate} />
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {details.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50/80 p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500">{item.label}</p>
                    <p className="mt-2 break-words text-base font-semibold text-slate-900">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <button onClick={() => downloadCertificateSvg(certificate)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Download SVG</button>
                <button onClick={downloadPdf} className="btn-secondary">Download PDF</button>
              </div>
            </div>
          </SectionCard>
        ) : <EmptyState title="Certificate not found" description={error || "Please check the certificate number or QR code and try again."} />}
      </div>
    </div>
  );
}
