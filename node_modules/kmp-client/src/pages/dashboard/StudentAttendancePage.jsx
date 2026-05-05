import { useEffect, useMemo, useState } from "react";
import CertificatePreview from "../../components/CertificatePreview";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { certificateService } from "../../services/certificateService";
import { attendanceService } from "../../services/attendanceService";
import { downloadBlobFile, downloadCertificateSvg } from "../../utils/certificateDownload";
import { downloadStudentAttendanceReportPdf } from "../../utils/attendanceReportPdf";
import { formatDate } from "../../utils/formatters";

export default function StudentAttendancePage() {
  const [data, setData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [previewCertificate, setPreviewCertificate] = useState(null);

  useEffect(() => {
    Promise.all([attendanceService.getMine(), certificateService.getMine()]).then(([attendanceData, certificateData]) => {
      setData(attendanceData);
      setCertificates(certificateData);
    });
  }, []);

  const totals = useMemo(() => {
    if (!data) {
      return { total: 0, present: 0, absent: 0, percentage: 0 };
    }

    const total = data.records.length;
    const present = data.records.filter((record) => record.status === "present").length;
    const absent = Math.max(total - present, 0);
    return { total, present, absent, percentage: data.percentage || 0 };
  }, [data]);

  const dayWiseSummary = useMemo(() => {
    if (!data) return [];

    const grouped = data.records.reduce((accumulator, record) => {
      const dateKey = new Date(record.date).toISOString().slice(0, 10);
      if (!accumulator[dateKey]) {
        accumulator[dateKey] = { dateKey, dateLabel: formatDate(record.date), total: 0, present: 0, absent: 0, courses: [] };
      }

      accumulator[dateKey].total += 1;
      if (record.status === "present") {
        accumulator[dateKey].present += 1;
      } else {
        accumulator[dateKey].absent += 1;
      }
      accumulator[dateKey].courses.push(`${record.course?.title || "Course"} (${record.status})`);
      return accumulator;
    }, {});

    return Object.values(grouped).sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));
  }, [data]);

  const subjectWiseSummary = useMemo(() => {
    if (!data) return [];

    const grouped = data.records.reduce((accumulator, record) => {
      const subject = record.course?.subject || "General";
      if (!accumulator[subject]) {
        accumulator[subject] = { subject, total: 0, present: 0, absent: 0, courses: new Set() };
      }

      accumulator[subject].total += 1;
      if (record.status === "present") {
        accumulator[subject].present += 1;
      } else {
        accumulator[subject].absent += 1;
      }
      if (record.course?.title) {
        accumulator[subject].courses.add(record.course.title);
      }
      return accumulator;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        percentage: Math.round((item.present / Math.max(item.total, 1)) * 100),
        courses: Array.from(item.courses)
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [data]);

  const monthWiseSummary = useMemo(() => {
    if (!data) return [];

    const grouped = data.records.reduce((accumulator, record) => {
      const monthKey = new Date(record.date).toISOString().slice(0, 7);
      const monthLabel = new Date(record.date).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      if (!accumulator[monthKey]) {
        accumulator[monthKey] = { monthKey, monthLabel, total: 0, present: 0, absent: 0 };
      }

      accumulator[monthKey].total += 1;
      if (record.status === "present") {
        accumulator[monthKey].present += 1;
      } else {
        accumulator[monthKey].absent += 1;
      }
      return accumulator;
    }, {});

    return Object.values(grouped)
      .map((item) => ({
        ...item,
        percentage: Math.round((item.present / Math.max(item.total, 1)) * 100)
      }))
      .sort((a, b) => (a.monthKey < b.monthKey ? 1 : -1));
  }, [data]);

  const exportAttendancePdf = () => {
    downloadStudentAttendanceReportPdf({
      studentName: data?.studentName || "student",
      totals,
      monthWiseSummary,
      subjectWiseSummary,
      dayWiseSummary
    });
  };

  const downloadPdf = async (certificate) => {
    const blob = await certificateService.downloadPdf(certificate._id);
    const safeName = (certificate.student?.name || "student").replace(/\s+/g, "-").toLowerCase();
    downloadBlobFile(blob, `${safeName}-certificate.pdf`);
  };

  if (!data) return <LoadingState label="Loading attendance and certificates..." />;

  return (
    <>
      <div className="space-y-6">
        <PageHeader eyebrow="Attendance" title={`Attendance Overview - ${totals.percentage}%`} description="Track your overall attendance, check month-wise, day-wise, and subject-wise records, monitor course eligibility, and export your attendance report as PDF." />

        <div className="flex justify-end">
          <button onClick={exportAttendancePdf} className="btn-secondary">Download Attendance PDF</button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.8rem] bg-gradient-to-br from-emerald-500 to-green-600 p-6 text-white shadow-xl shadow-emerald-200">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">Present</p>
            <p className="mt-4 text-4xl font-extrabold">{totals.present}</p>
            <p className="mt-2 text-sm text-white/80">Days or sessions marked present</p>
          </div>
          <div className="rounded-[1.8rem] bg-gradient-to-br from-rose-500 to-orange-500 p-6 text-white shadow-xl shadow-rose-200">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">Absent</p>
            <p className="mt-4 text-4xl font-extrabold">{totals.absent}</p>
            <p className="mt-2 text-sm text-white/80">Days or sessions marked absent</p>
          </div>
          <div className="rounded-[1.8rem] bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-xl shadow-sky-200">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">Total</p>
            <p className="mt-4 text-4xl font-extrabold">{totals.total}</p>
            <p className="mt-2 text-sm text-white/80">Overall attendance entries</p>
          </div>
          <div className="rounded-[1.8rem] bg-gradient-to-br from-violet-500 to-fuchsia-600 p-6 text-white shadow-xl shadow-violet-200">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/80">Overall %</p>
            <p className="mt-4 text-4xl font-extrabold">{totals.percentage}%</p>
            <p className="mt-2 text-sm text-white/80">Current attendance percentage</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <SectionCard title="Month-Wise Attendance Summary">
            <div className="space-y-3">
              {monthWiseSummary.length ? monthWiseSummary.map((item) => (
                <div key={item.monthKey} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">{item.monthLabel}</p>
                      <p className="text-sm text-slate-600">Present {item.present} | Absent {item.absent} | Total {item.total}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${item.percentage >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{item.percentage}%</span>
                  </div>
                </div>
              )) : <EmptyState title="No monthly summary yet" description="Month-wise attendance will appear once records are available." />}
            </div>
          </SectionCard>

          <SectionCard title="Subject-Wise Attendance">
            <div className="space-y-3">
              {subjectWiseSummary.length ? subjectWiseSummary.map((item) => (
                <div key={item.subject} className="rounded-3xl bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">{item.subject}</p>
                      <p className="text-sm text-slate-600">Attendance {item.percentage}%</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${item.percentage >= 75 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.percentage >= 75 ? "Strong" : "Improve"}
                    </span>
                  </div>
                  <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-4 rounded-full ${item.percentage >= 75 ? "bg-emerald-500" : item.percentage >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${item.percentage}%` }} />
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Present</p>
                      <p className="mt-2 text-2xl font-extrabold text-emerald-600">{item.present}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Absent</p>
                      <p className="mt-2 text-2xl font-extrabold text-rose-500">{item.absent}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Total</p>
                      <p className="mt-2 text-2xl font-extrabold text-sky-600">{item.total}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">Courses: {item.courses.join(", ") || "-"}</p>
                </div>
              )) : <EmptyState title="No subject summary yet" description="Subject-wise attendance will appear once attendance entries exist." />}
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard title="Day-Wise Attendance">
            <div className="space-y-3">
              {dayWiseSummary.length ? dayWiseSummary.map((item) => (
                <div key={item.dateKey} className="rounded-3xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-ink">{item.dateLabel}</p>
                      <p className="text-sm text-slate-600">Present {item.present} | Absent {item.absent} | Total {item.total}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${item.absent === 0 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {item.absent === 0 ? "Full Present" : "Mixed Day"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{item.courses.join(" | ")}</p>
                </div>
              )) : <EmptyState title="No daily attendance yet" description="Day-wise attendance will appear once your faculty uploads it." />}
            </div>
          </SectionCard>

          <SectionCard title="Overall Attendance Register">
            <div className="space-y-3">
              {data.records.length ? data.records.map((record) => (
                <div key={record._id} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold">{record.course?.title}</p>
                      <p className="text-sm text-slate-600">{record.course?.subject || "General"} | {formatDate(record.date)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${record.status === "present" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              )) : <EmptyState title="No attendance records" description="Attendance will appear once faculty marks your class." />}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Course Certificate Eligibility">
          <div className="grid gap-4 lg:grid-cols-2">
            {data.courseSummaries?.length ? data.courseSummaries.map((item) => (
              <div key={item.courseId} className="rounded-3xl bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink">{item.course?.title}</p>
                    <p className="text-sm text-slate-600">Class {item.course?.className} | {item.course?.subject || "Mathematics"}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${item.eligibleForCertificate ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {item.eligibleForCertificate ? "Eligible" : "Keep Going"}
                  </span>
                </div>
                <p className="mt-3 text-sm text-slate-600">Attendance: {item.percentage}%</p>
                <p className="text-sm text-slate-500">Present {item.presentSessions} of {item.totalSessions} sessions</p>
                <p className="mt-3 text-sm text-slate-500">
                  {item.eligibleForCertificate
                    ? "You can receive a certificate after admin approval and issuance."
                    : "Reach at least 75% attendance in this course to qualify for a certificate."}
                </p>
              </div>
            )) : <EmptyState title="No course summaries yet" description="Course-wise attendance eligibility will appear once your attendance starts getting recorded." />}
          </div>
        </SectionCard>

        <SectionCard title="Issued Certificates">
          <div className="grid gap-5 xl:grid-cols-2">
            {certificates.length ? certificates.map((certificate) => (
              <div key={certificate._id} className="card p-5">
                <CertificatePreview certificate={certificate} compact />
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button onClick={() => setPreviewCertificate(certificate)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Preview</button>
                  <button onClick={() => downloadCertificateSvg(certificate)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Download SVG</button>
                  <button onClick={() => downloadPdf(certificate)} className="btn-secondary">Download PDF</button>
                </div>
              </div>
            )) : <EmptyState title="No certificates issued yet" description="Once admin approves your 75%+ attendance for a completed course, your certificate will appear here." />}
          </div>
        </SectionCard>
      </div>

      <Modal open={Boolean(previewCertificate)} title="Certificate Preview" onClose={() => setPreviewCertificate(null)}>
        {previewCertificate ? (
          <div className="space-y-4">
            <CertificatePreview certificate={previewCertificate} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setPreviewCertificate(null)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Close</button>
              <button onClick={() => downloadCertificateSvg(previewCertificate)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Download SVG</button>
              <button onClick={() => downloadPdf(previewCertificate)} className="btn-secondary">Download PDF</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
