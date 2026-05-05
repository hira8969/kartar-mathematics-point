import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import TimetablePrintSheet from "../../components/TimetablePrintSheet";
import { timetableService } from "../../services/timetableService";
import { downloadTimetablePdf } from "../../utils/timetablePdf";
import { getTimetableTheme } from "../../utils/timetableTheme";

const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function StudentTimetablePage() {
  const [entries, setEntries] = useState(null);
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    Promise.all([timetableService.getMine(), timetableService.getBranding()]).then(([timetableData, brandingData]) => {
      setEntries(timetableData);
      setBranding(brandingData);
    });
  }, []);

  const grouped = useMemo(() => {
    if (!entries) return [];
    return dayOrder.map((day) => ({
      day,
      items: entries.filter((entry) => entry.dayOfWeek === day)
    })).filter((group) => group.items.length);
  }, [entries]);

  const exportPdf = () => {
    downloadTimetablePdf({
      fileName: "student-timetable.pdf",
      title: "Student Weekly Timetable",
      subtitle: "Published weekly class schedule",
      entries: entries || [],
      branding
    });
  };

  if (!entries || !branding) return <LoadingState label="Loading student timetable..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Timetable" title="Student class timetable" description="View your assigned weekly timetable published by admin for your enrolled classes and batches." />
      <div className="no-print flex justify-end gap-3">
        <button onClick={() => window.print()} className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Print View</button>
        <button onClick={exportPdf} className="btn-secondary">Download Timetable PDF</button>
      </div>
      <SectionCard title="Weekly Schedule">
        <div className="space-y-5">
          {grouped.length ? grouped.map((group) => (
            <div key={group.day} className="rounded-3xl bg-slate-50 p-5">
              <p className="font-display text-2xl font-bold text-ink">{group.day}</p>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {group.items.map((entry) => {
                  const theme = getTimetableTheme(entry.subject, entry.dayOfWeek);
                  return (
                    <div key={entry._id} className={`rounded-3xl border p-4 shadow-sm ring-2 ${theme.card} ${theme.dayRing}`}>
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-ink">{entry.title}</p>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${theme.badge}`}>{entry.subject || "General"}</span>
                      </div>
                      <p className={`mt-2 text-sm font-semibold ${theme.accent}`}>{entry.dayOfWeek} | {entry.startTime} - {entry.endTime}</p>
                      <p className="mt-1 text-sm text-slate-600">{entry.room || "Room TBA"}</p>
                      <p className="mt-1 text-sm text-slate-500">Class {entry.className || entry.course?.className || "-"} | Batch {entry.batchName || entry.course?.batchName || "-"}</p>
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Faculty: {entry.faculty?.name || "To be assigned"}</p>
                      {entry.notes ? <p className="mt-2 text-sm text-slate-500">{entry.notes}</p> : null}
                    </div>
                  );
                })}
              </div>
            </div>
          )) : <EmptyState title="No timetable assigned yet" description="Admin timetable entries for your classes will appear here." />}
        </div>
      </SectionCard>

      <div className="print-only-block hidden">
        <TimetablePrintSheet
          title="Student Weekly Timetable"
          subtitle="Published weekly class schedule"
          branding={branding}
          groupedEntries={grouped}
        />
      </div>
    </div>
  );
}
