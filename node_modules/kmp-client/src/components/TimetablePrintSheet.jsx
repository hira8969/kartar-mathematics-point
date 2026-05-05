export default function TimetablePrintSheet({ title, subtitle, branding, groupedEntries }) {
  return (
    <div className="print-sheet rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200">
      <div className="flex items-start justify-between gap-6 border-b border-slate-200 pb-6">
        <div className="flex items-start gap-4">
          {branding?.logoDataUrl ? <img src={branding.logoDataUrl} alt="Institute logo" className="h-20 w-20 rounded-2xl border border-slate-200 bg-white object-contain p-2" /> : null}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Weekly Print View</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-ink">{branding?.name || "Institute Timetable"}</h2>
            <p className="mt-1 text-sm text-slate-500">{branding?.address || ""}</p>
            <p className="text-sm text-slate-500">Contact: {branding?.contact || "-"}</p>
          </div>
        </div>
        <div className="max-w-sm text-right">
          <p className="font-display text-2xl font-bold text-ink">{title}</p>
          <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {groupedEntries.map((group) => (
          <div key={group.day} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <p className="font-display text-2xl font-bold text-ink">{group.day}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {group.items.map((entry) => (
                <div key={entry._id} className="rounded-3xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{entry.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{entry.startTime} - {entry.endTime} | {entry.room || "Room TBA"}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">{entry.subject || "General"}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Class {entry.className || entry.course?.className || "-"} | Batch {entry.batchName || entry.course?.batchName || "-"}</p>
                  {entry.faculty?.name ? <p className="mt-1 text-sm text-slate-500">Faculty: {entry.faculty.name}</p> : null}
                  {entry.notes ? <p className="mt-2 text-sm text-slate-500">{entry.notes}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
