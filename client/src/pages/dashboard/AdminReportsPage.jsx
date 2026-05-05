import { useEffect, useMemo, useState } from "react";
import ChartCard from "../../components/ChartCard";
import CertificatePreview from "../../components/CertificatePreview";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { adminService } from "../../services/adminService";
import { attendanceService } from "../../services/attendanceService";
import { certificateService } from "../../services/certificateService";
import { downloadBlobFile, downloadCertificateSvg } from "../../utils/certificateDownload";
import { formatDate } from "../../utils/formatters";

const initialStatusForm = {
  certificateId: "",
  revoke: false,
  revocationReason: "",
  expiresAt: ""
};

const initialAttendanceForm = {
  course: "",
  student: "",
  date: new Date().toISOString().slice(0, 10),
  status: "present"
};

const initialAttendanceEditForm = {
  id: "",
  course: "",
  student: "",
  date: "",
  status: "present"
};

export default function AdminReportsPage() {
  const { push } = useNotifications();
  const [data, setData] = useState(null);
  const [eligibleCertificates, setEligibleCertificates] = useState([]);
  const [issuedCertificates, setIssuedCertificates] = useState([]);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [issuingKey, setIssuingKey] = useState("");
  const [historyFilters, setHistoryFilters] = useState({ search: "", className: "all", status: "all" });
  const [statusForm, setStatusForm] = useState(initialStatusForm);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [attendanceForm, setAttendanceForm] = useState(initialAttendanceForm);
  const [attendanceSaving, setAttendanceSaving] = useState(false);
  const [attendanceHistoryFilter, setAttendanceHistoryFilter] = useState("");
  const [attendanceEditForm, setAttendanceEditForm] = useState(initialAttendanceEditForm);
  const [attendanceEditOpen, setAttendanceEditOpen] = useState(false);
  const [attendanceEditSaving, setAttendanceEditSaving] = useState(false);
  const [attendanceDeleteTarget, setAttendanceDeleteTarget] = useState(null);
  const [attendanceDeleteSaving, setAttendanceDeleteSaving] = useState(false);
  const [branding, setBranding] = useState({ name: "Kartar Mathematics Point", logoDataUrl: "", signatureDataUrl: "" });

  const load = async () => {
    const [reportData, eligibleData, issuedData, settingsData] = await Promise.all([
      adminService.reports(),
      certificateService.getEligible(),
      certificateService.getIssued(),
      adminService.getInstituteSettings()
    ]);
    setData(reportData);
    setEligibleCertificates(eligibleData);
    setIssuedCertificates(issuedData);
    setBranding({
      name: settingsData.name || "Kartar Mathematics Point",
      logoDataUrl: settingsData.logoDataUrl || "",
      signatureDataUrl: settingsData.signatureDataUrl || ""
    });
  };

  useEffect(() => {
    load();
  }, []);

  const attendanceChart = useMemo(() => {
    if (!data) return [];
    const summary = data.attendance.reduce((accumulator, item) => {
      accumulator[item.status] = (accumulator[item.status] || 0) + 1;
      return accumulator;
    }, {});
    return [
      { label: "Present", value: summary.present || 0 },
      { label: "Absent", value: summary.absent || 0 }
    ];
  }, [data]);

  const filteredIssuedCertificates = useMemo(() => {
    const query = historyFilters.search.trim().toLowerCase();
    return issuedCertificates.filter((certificate) => {
      if (historyFilters.className !== "all" && certificate.course?.className !== historyFilters.className) return false;
      if (historyFilters.status !== "all" && certificate.status !== historyFilters.status) return false;
      if (!query) return true;
      return [certificate.student?.name, certificate.student?.email, certificate.course?.title, certificate.certificateNumber, certificate.issuedBy?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [issuedCertificates, historyFilters]);

  const availableStudents = useMemo(() => {
    if (!data) return [];

    if (!attendanceForm.course) {
      return data.students || [];
    }

    const enrolled = (data.enrollments || [])
      .filter((item) => item.status === "approved" && item.course?._id === attendanceForm.course)
      .map((item) => item.student)
      .filter(Boolean);

    const unique = new Map();
    enrolled.forEach((student) => {
      unique.set(student._id, student);
    });

    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [data, attendanceForm.course]);

  const filteredAttendanceHistory = useMemo(() => {
    if (!data) return [];
    const query = attendanceHistoryFilter.trim().toLowerCase();
    return (data.attendance || []).filter((item) => {
      if (!query) return true;
      return [item.student?.name, item.course?.title, item.status, item.faculty?.name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [data, attendanceHistoryFilter]);

  const handleIssueCertificate = async (item) => {
    const key = `${item.student._id}-${item.course._id}`;
    setIssuingKey(key);
    try {
      const certificate = await certificateService.issue({ studentId: item.student._id, courseId: item.course._id });
      push("Certificate issued successfully", "success");
      await load();
      setPreviewCertificate(certificate);
    } catch (error) {
      push(error.response?.data?.message || "Unable to issue certificate", "error");
    } finally {
      setIssuingKey("");
    }
  };

  const downloadPdf = async (certificate) => {
    try {
      const blob = await certificateService.downloadPdf(certificate._id);
      const safeName = (certificate.student?.name || "student").replace(/\s+/g, "-").toLowerCase();
      downloadBlobFile(blob, `${safeName}-certificate.pdf`);
    } catch (error) {
      push(error.response?.data?.message || "Unable to download PDF", "error");
    }
  };

  const openStatusModal = (certificate) => {
    setStatusForm({
      certificateId: certificate._id,
      revoke: certificate.status === "revoked",
      revocationReason: certificate.revocationReason || "",
      expiresAt: certificate.expiresAt ? new Date(certificate.expiresAt).toISOString().slice(0, 10) : ""
    });
    setStatusModalOpen(true);
  };

  const saveStatusChanges = async () => {
    if (statusForm.revoke && !statusForm.revocationReason.trim()) {
      push("Please enter a revoke reason", "error");
      return;
    }

    setStatusSaving(true);
    try {
      await certificateService.updateStatus(statusForm.certificateId, {
        revoke: statusForm.revoke,
        revocationReason: statusForm.revocationReason,
        expiresAt: statusForm.expiresAt
      });
      push("Certificate details updated", "success");
      setStatusModalOpen(false);
      setStatusForm(initialStatusForm);
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to update certificate", "error");
    } finally {
      setStatusSaving(false);
    }
  };

  const saveAttendanceAdjustment = async () => {
    if (!attendanceForm.course || !attendanceForm.student) {
      push("Select a course and student first", "error");
      return;
    }

    setAttendanceSaving(true);
    try {
      await attendanceService.mark({
        course: attendanceForm.course,
        date: attendanceForm.date,
        entries: [{ student: attendanceForm.student, status: attendanceForm.status }]
      });
      push(attendanceForm.status === "present" ? "Attendance increased successfully" : "Attendance updated successfully", "success");
      setAttendanceForm((current) => ({ ...current, student: "", status: "present" }));
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to update attendance", "error");
    } finally {
      setAttendanceSaving(false);
    }
  };

  const openAttendanceEditModal = (record) => {
    setAttendanceEditForm({
      id: record._id,
      course: record.course?._id || "",
      student: record.student?._id || "",
      date: record.date ? new Date(record.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      status: record.status || "present"
    });
    setAttendanceEditOpen(true);
  };

  const saveAttendanceEdit = async () => {
    if (!attendanceEditForm.id || !attendanceEditForm.course || !attendanceEditForm.student) {
      push("Course and student are required", "error");
      return;
    }

    setAttendanceEditSaving(true);
    try {
      await attendanceService.update(attendanceEditForm.id, {
        course: attendanceEditForm.course,
        student: attendanceEditForm.student,
        date: attendanceEditForm.date,
        status: attendanceEditForm.status
      });
      push("Attendance record updated", "success");
      setAttendanceEditOpen(false);
      setAttendanceEditForm(initialAttendanceEditForm);
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to update attendance record", "error");
    } finally {
      setAttendanceEditSaving(false);
    }
  };

  const deleteAttendanceRecord = async () => {
    if (!attendanceDeleteTarget?._id) {
      return;
    }

    setAttendanceDeleteSaving(true);
    try {
      await attendanceService.remove(attendanceDeleteTarget._id);
      push("Attendance record deleted", "success");
      setAttendanceDeleteTarget(null);
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to delete attendance record", "error");
    } finally {
      setAttendanceDeleteSaving(false);
    }
  };

  if (!data) return <LoadingState label="Loading reports and certificates..." />;

  return (
    <>
      <div className="space-y-6">
        <PageHeader eyebrow="Reports" title="Performance, attendance, and certificates" description="Review attendance summaries, student outcomes, issue certificates after 75% attendance, manage certificate validity, and fully control attendance records from the admin side." />
        <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <ChartCard title="Attendance Summary" items={attendanceChart} />
          <SectionCard title="Student Performance">
            <div className="space-y-3">
              {data.results.length ? data.results.map((item) => (
                <div key={item._id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold">{item.student?.name}</p>
                  <p className="text-sm text-slate-600">{item.assignment?.title} | Marks: {item.marks ?? "Pending"}</p>
                </div>
              )) : <EmptyState title="No performance data" description="Assignment grading data will appear here." />}
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Attendance Adjustment">
          <div className="grid gap-4 lg:grid-cols-4">
            <FormField label="Course" hint="Choose the course where attendance should be increased or corrected.">
              <select className="input" value={attendanceForm.course} onChange={(e) => setAttendanceForm({ ...attendanceForm, course: e.target.value, student: "" })}>
                <option value="">Select course</option>
                {(data.courses || []).map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
              </select>
            </FormField>
            <FormField label="Student">
              <select className="input" value={attendanceForm.student} onChange={(e) => setAttendanceForm({ ...attendanceForm, student: e.target.value })}>
                <option value="">Select student</option>
                {availableStudents.map((student) => <option key={student._id} value={student._id}>{student.name} {student.studentClass ? `| Class ${student.studentClass}` : ""}</option>)}
              </select>
            </FormField>
            <FormField label="Date">
              <input type="date" className="input" value={attendanceForm.date} onChange={(e) => setAttendanceForm({ ...attendanceForm, date: e.target.value })} />
            </FormField>
            <FormField label="Status">
              <select className="input" value={attendanceForm.status} onChange={(e) => setAttendanceForm({ ...attendanceForm, status: e.target.value })}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </FormField>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-800">
            <p>Saving a `present` entry here will increase that student&apos;s attendance for the selected course/date. Existing entries for the same day will be updated.</p>
            <button onClick={saveAttendanceAdjustment} disabled={attendanceSaving} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-60">{attendanceSaving ? "Saving..." : "Save Attendance Adjustment"}</button>
          </div>
        </SectionCard>

        <SectionCard title="Attendance History Manager" action={<input className="input w-72" placeholder="Search student, course, status, marker..." value={attendanceHistoryFilter} onChange={(e) => setAttendanceHistoryFilter(e.target.value)} />}>
          <div className="space-y-3">
            {filteredAttendanceHistory.length ? filteredAttendanceHistory.map((record) => (
              <div key={record._id} className="rounded-3xl bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{record.student?.name}</p>
                    <p className="text-sm text-slate-600">{record.course?.title} | {formatDate(record.date)} | {record.status}</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">Recorded by {record.faculty?.name || "Admin"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openAttendanceEditModal(record)} className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">Edit</button>
                    <button onClick={() => setAttendanceDeleteTarget(record)} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">Delete</button>
                  </div>
                </div>
              </div>
            )) : <EmptyState title="No attendance history found" description="Try another search or start recording attendance from the admin controls above." />}
          </div>
        </SectionCard>

        <SectionCard title="Certificate Center">
          <div className="grid gap-5 xl:grid-cols-2">
            {eligibleCertificates.length ? eligibleCertificates.map((item) => {
              const certificate = item.certificate || {
                student: item.student,
                course: item.course,
                attendancePercent: item.attendancePercent,
                issuedAt: new Date().toISOString(),
                issuedBy: { name: "Admin Approval Pending" },
                certificateNumber: "Pending Approval",
                status: "valid",
                instituteName: branding.name,
                instituteLogoDataUrl: branding.logoDataUrl,
                instituteSignatureDataUrl: branding.signatureDataUrl
              };
              const key = `${item.student._id}-${item.course._id}`;
              return (
                <div key={key} className="card p-5">
                  <CertificatePreview certificate={certificate} compact />
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{item.student.name}</p>
                      <p className="text-sm text-slate-600">{item.course.title} | Attendance {item.attendancePercent}%</p>
                      <p className="text-xs uppercase tracking-wide text-slate-400">{item.presentSessions}/{item.totalSessions} sessions present</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => setPreviewCertificate(certificate)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Preview</button>
                      {item.certificate ? (
                        <>
                          <button onClick={() => downloadCertificateSvg(item.certificate)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">SVG</button>
                          <button onClick={() => downloadPdf(item.certificate)} className="btn-secondary">PDF</button>
                        </>
                      ) : (
                        <button onClick={() => handleIssueCertificate(item)} disabled={issuingKey === key} className="btn-primary disabled:opacity-60">
                          {issuingKey === key ? "Issuing..." : "Issue Certificate"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : <EmptyState title="No eligible certificates yet" description="Certificates will appear here once a student reaches 75% attendance in an approved course." />}
          </div>
        </SectionCard>

        <SectionCard title="Issued Certificates History" action={<div className="flex flex-wrap gap-3"><input className="input w-64" placeholder="Search student, course, certificate..." value={historyFilters.search} onChange={(e) => setHistoryFilters({ ...historyFilters, search: e.target.value })} /><select className="input w-32" value={historyFilters.className} onChange={(e) => setHistoryFilters({ ...historyFilters, className: e.target.value })}><option value="all">All classes</option>{Array.from({ length: 7 }, (_, index) => index + 6).map((value) => <option key={value} value={String(value)}>{value}</option>)}</select><select className="input w-32" value={historyFilters.status} onChange={(e) => setHistoryFilters({ ...historyFilters, status: e.target.value })}><option value="all">All status</option><option value="valid">Valid</option><option value="expired">Expired</option><option value="revoked">Revoked</option></select></div>}>
          <div className="space-y-3">
            {filteredIssuedCertificates.length ? filteredIssuedCertificates.map((certificate) => (
              <div key={certificate._id} className="rounded-3xl bg-slate-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-ink">{certificate.student?.name}</p>
                    <p className="text-sm text-slate-600">{certificate.course?.title} | Attendance {certificate.attendancePercent}%</p>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{certificate.certificateNumber} | {certificate.status} | Issued by {certificate.issuedBy?.name} on {formatDate(certificate.issuedAt)}</p>
                    <p className="text-xs text-slate-500">Valid Until: {certificate.expiresAt ? formatDate(certificate.expiresAt) : "No expiry"}</p>
                    {certificate.status === "revoked" ? <p className="text-xs font-semibold text-red-600">Reason: {certificate.revocationReason || "Administrative action"}</p> : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setPreviewCertificate(certificate)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Preview</button>
                    <button onClick={() => downloadCertificateSvg(certificate)} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Download SVG</button>
                    <button onClick={() => downloadPdf(certificate)} className="btn-secondary">Download PDF</button>
                    <button onClick={() => openStatusModal(certificate)} className="rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">Manage Status</button>
                  </div>
                </div>
              </div>
            )) : <EmptyState title="No certificates found" description="Try another search, class, or status filter." />}
          </div>
        </SectionCard>

        <SectionCard title="Enrollment Summary">
          <div className="space-y-3">
            {data.enrollments.length ? data.enrollments.map((item) => (
              <div key={item._id} className="rounded-2xl bg-white p-4 shadow-sm">
                <p className="font-semibold">{item.student?.name}</p>
                <p className="text-sm text-slate-600">{item.course?.title}</p>
              </div>
            )) : <EmptyState title="No enrollments" description="Enrollment records will appear here." />}
          </div>
        </SectionCard>
        <SectionCard title="Fee Status">
          <p className="text-sm text-slate-600">Fee reporting is kept ready as an extension point. Once a fee model is added on the backend, this page can be connected directly.</p>
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

      <Modal open={statusModalOpen} title="Manage Certificate Status" onClose={() => !statusSaving && setStatusModalOpen(false)}>
        <div className="space-y-4">
          <FormField label="Expiry Date" hint="Leave empty if the certificate should not expire.">
            <input type="date" className="input" value={statusForm.expiresAt} onChange={(e) => setStatusForm({ ...statusForm, expiresAt: e.target.value })} />
          </FormField>
          <FormField label="Certificate State">
            <select className="input" value={String(statusForm.revoke)} onChange={(e) => setStatusForm({ ...statusForm, revoke: e.target.value === "true" })}>
              <option value="false">Active / Valid</option>
              <option value="true">Revoked</option>
            </select>
          </FormField>
          {statusForm.revoke ? (
            <FormField label="Revoke Reason" hint="This will appear on verification and certificate history.">
              <textarea className="input min-h-28" value={statusForm.revocationReason} onChange={(e) => setStatusForm({ ...statusForm, revocationReason: e.target.value })} />
            </FormField>
          ) : null}
          <div className="flex justify-end gap-3">
            <button onClick={() => setStatusModalOpen(false)} disabled={statusSaving} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
            <button onClick={saveStatusChanges} disabled={statusSaving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{statusSaving ? "Saving..." : "Save Changes"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={attendanceEditOpen} title="Edit Attendance Record" onClose={() => !attendanceEditSaving && setAttendanceEditOpen(false)}>
        <div className="space-y-4">
          <FormField label="Course">
            <select className="input" value={attendanceEditForm.course} onChange={(e) => setAttendanceEditForm({ ...attendanceEditForm, course: e.target.value })}>
              <option value="">Select course</option>
              {(data.courses || []).map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}
            </select>
          </FormField>
          <FormField label="Student">
            <select className="input" value={attendanceEditForm.student} onChange={(e) => setAttendanceEditForm({ ...attendanceEditForm, student: e.target.value })}>
              <option value="">Select student</option>
              {(data.students || []).map((student) => <option key={student._id} value={student._id}>{student.name}</option>)}
            </select>
          </FormField>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Date">
              <input type="date" className="input" value={attendanceEditForm.date} onChange={(e) => setAttendanceEditForm({ ...attendanceEditForm, date: e.target.value })} />
            </FormField>
            <FormField label="Status">
              <select className="input" value={attendanceEditForm.status} onChange={(e) => setAttendanceEditForm({ ...attendanceEditForm, status: e.target.value })}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
              </select>
            </FormField>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setAttendanceEditOpen(false)} disabled={attendanceEditSaving} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
            <button onClick={saveAttendanceEdit} disabled={attendanceEditSaving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{attendanceEditSaving ? "Saving..." : "Save Attendance Record"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={Boolean(attendanceDeleteTarget)} title="Delete Attendance Record" onClose={() => !attendanceDeleteSaving && setAttendanceDeleteTarget(null)}>
        {attendanceDeleteTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Delete attendance for <span className="font-semibold text-ink">{attendanceDeleteTarget.student?.name}</span> in <span className="font-semibold text-ink">{attendanceDeleteTarget.course?.title}</span> on <span className="font-semibold text-ink">{formatDate(attendanceDeleteTarget.date)}</span>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setAttendanceDeleteTarget(null)} disabled={attendanceDeleteSaving} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
              <button onClick={deleteAttendanceRecord} disabled={attendanceDeleteSaving} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{attendanceDeleteSaving ? "Deleting..." : "Delete Record"}</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
