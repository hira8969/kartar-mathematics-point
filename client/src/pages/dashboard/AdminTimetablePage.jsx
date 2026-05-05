import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { adminService } from "../../services/adminService";
import { courseService } from "../../services/courseService";
import { timetableService } from "../../services/timetableService";
import { getTimetableTheme } from "../../utils/timetableTheme";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const initialForm = {
  title: "",
  dayOfWeek: "Monday",
  startTime: "08:00",
  endTime: "09:00",
  room: "",
  notes: "",
  subject: "Mathematics",
  className: "",
  batchName: "",
  course: "",
  faculty: "",
  audienceRoles: ["student", "faculty"],
  isActive: true
};

export default function AdminTimetablePage() {
  const { push } = useNotifications();
  const [entries, setEntries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [draggingId, setDraggingId] = useState("");
  const [dropDay, setDropDay] = useState("");
  const [boardFilters, setBoardFilters] = useState({ facultyId: "all" });
  const [occupancyFilters, setOccupancyFilters] = useState({ facultyId: "all", room: "all" });

  const load = async () => {
    setLoading(true);
    try {
      const [timetableData, courseData, userData] = await Promise.all([
        timetableService.getAll(),
        courseService.getAll(),
        adminService.users()
      ]);
      setEntries(timetableData);
      setCourses(courseData);
      setFaculty(userData.filter((user) => user.role === "faculty"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredBoardEntries = useMemo(() => {
    if (boardFilters.facultyId === "all") {
      return entries;
    }

    return entries.filter((entry) => entry.faculty?._id === boardFilters.facultyId);
  }, [entries, boardFilters.facultyId]);

  const groupedEntries = useMemo(() => days.map((day) => ({
    day,
    items: filteredBoardEntries.filter((entry) => entry.dayOfWeek === day)
  })), [filteredBoardEntries]);

  const roomOptions = useMemo(() => {
    const values = Array.from(new Set(entries.map((entry) => entry.room?.trim() || "Room TBA")));
    return values.sort((a, b) => a.localeCompare(b));
  }, [entries]);

  const occupancySourceEntries = useMemo(() => {
    let next = entries;
    if (occupancyFilters.facultyId !== "all") {
      next = next.filter((entry) => entry.faculty?._id === occupancyFilters.facultyId);
    }
    if (occupancyFilters.room !== "all") {
      next = next.filter((entry) => (entry.room?.trim() || "Room TBA") === occupancyFilters.room);
    }
    return next;
  }, [entries, occupancyFilters]);

  const roomOccupancy = useMemo(() => {
    const roomsMap = occupancySourceEntries.reduce((accumulator, entry) => {
      const roomName = entry.room?.trim() || "Room TBA";
      if (!accumulator[roomName]) {
        accumulator[roomName] = { room: roomName, byDay: {} };
      }
      if (!accumulator[roomName].byDay[entry.dayOfWeek]) {
        accumulator[roomName].byDay[entry.dayOfWeek] = [];
      }
      accumulator[roomName].byDay[entry.dayOfWeek].push(entry);
      return accumulator;
    }, {});

    return Object.values(roomsMap)
      .map((item) => ({
        ...item,
        byDay: days.reduce((accumulator, day) => {
          accumulator[day] = (item.byDay[day] || []).sort((a, b) => a.startTime.localeCompare(b.startTime));
          return accumulator;
        }, {})
      }))
      .sort((a, b) => a.room.localeCompare(b.room));
  }, [occupancySourceEntries]);

  const toggleAudience = (role) => {
    setForm((current) => {
      const nextRoles = current.audienceRoles.includes(role)
        ? current.audienceRoles.filter((item) => item !== role)
        : [...current.audienceRoles, role];
      return { ...current, audienceRoles: nextRoles.length ? nextRoles : [role] };
    });
  };

  const onCourseChange = (courseId) => {
    const selectedCourse = courses.find((course) => course._id === courseId);
    setForm((current) => ({
      ...current,
      course: courseId,
      title: selectedCourse ? selectedCourse.title : current.title,
      subject: selectedCourse?.subject || current.subject,
      className: selectedCourse?.className || current.className,
      batchName: selectedCourse?.batchName || current.batchName,
      faculty: selectedCourse?.faculty?.[0]?._id || current.faculty
    }));
  };

  const editEntry = (entry) => {
    setEditingId(entry._id);
    setForm({
      title: entry.title || "",
      dayOfWeek: entry.dayOfWeek || "Monday",
      startTime: entry.startTime || "08:00",
      endTime: entry.endTime || "09:00",
      room: entry.room || "",
      notes: entry.notes || "",
      subject: entry.subject || "Mathematics",
      className: entry.className || "",
      batchName: entry.batchName || "",
      course: entry.course?._id || "",
      faculty: entry.faculty?._id || "",
      audienceRoles: entry.audienceRoles?.length ? entry.audienceRoles : ["student", "faculty"],
      isActive: entry.isActive !== false
    });
  };

  const resetForm = () => {
    setEditingId("");
    setForm(initialForm);
  };

  const submit = async () => {
    if (!form.title || !form.dayOfWeek || !form.startTime || !form.endTime) {
      push("Title, day, start time, and end time are required", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await timetableService.update(editingId, form);
        push("Timetable updated", "success");
      } else {
        await timetableService.create(form);
        push("Timetable entry created", "success");
      }
      resetForm();
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to save timetable", "error");
    } finally {
      setSaving(false);
    }
  };

  const removeEntry = async () => {
    if (!deleteTarget?._id) return;
    setDeleting(true);
    try {
      await timetableService.remove(deleteTarget._id);
      push("Timetable entry removed", "success");
      setDeleteTarget(null);
      await load();
    } catch (error) {
      push(error.response?.data?.message || "Unable to delete timetable", "error");
    } finally {
      setDeleting(false);
    }
  };

  const persistOrder = async (nextEntries) => {
    setEntries(nextEntries);
    try {
      const payload = nextEntries.map((entry, index) => ({
        id: entry._id,
        dayOfWeek: entry.dayOfWeek,
        displayOrder: index + 1
      }));
      const updated = await timetableService.reorder(payload);
      setEntries(updated);
      push("Timetable layout updated", "success");
    } catch (error) {
      push(error.response?.data?.message || "Unable to reorder timetable", "error");
      await load();
    }
  };

  const moveEntry = async (draggedId, targetDay, targetId = "") => {
    const draggedEntry = entries.find((entry) => entry._id === draggedId);
    if (!draggedEntry) return;

    const nextEntries = entries.filter((entry) => entry._id !== draggedId);
    const updatedDragged = { ...draggedEntry, dayOfWeek: targetDay };

    const beforeTargetIndex = targetId ? nextEntries.findIndex((entry) => entry._id === targetId) : -1;
    if (beforeTargetIndex >= 0) {
      nextEntries.splice(beforeTargetIndex, 0, updatedDragged);
    } else {
      const lastIndexForDay = nextEntries.reduce((lastIndex, entry, index) => entry.dayOfWeek === targetDay ? index : lastIndex, -1);
      nextEntries.splice(lastIndexForDay + 1, 0, updatedDragged);
    }

    await persistOrder(nextEntries.map((entry, index) => ({ ...entry, displayOrder: index + 1 })));
  };

  if (loading) return <LoadingState label="Loading timetable management..." />;

  return (
    <>
      <div className="space-y-6">
        <PageHeader eyebrow="Timetable" title="Assign timetable for students and faculty" description="Admin can create timetable entries, filter the drag-and-drop board faculty-wise, and inspect room occupancy across the full week from one scheduling workspace." />

        <SectionCard title={editingId ? "Update Timetable Entry" : "Create Timetable Entry"}>
          {editingId ? (
            <div className="mb-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              Update mode is active. Change the details below, then click Update Timetable to save this slot.
            </div>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-4">
            <FormField label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
            <FormField label="Day"><select className="input" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>{days.map((day) => <option key={day} value={day}>{day}</option>)}</select></FormField>
            <FormField label="Start Time"><input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} /></FormField>
            <FormField label="End Time"><input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} /></FormField>
            <FormField label="Course"><select className="input" value={form.course} onChange={(e) => onCourseChange(e.target.value)}><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></FormField>
            <FormField label="Faculty"><select className="input" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })}><option value="">Select faculty</option>{faculty.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></FormField>
            <FormField label="Subject"><input className="input" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></FormField>
            <FormField label="Class"><input className="input" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} /></FormField>
            <FormField label="Batch"><input className="input" value={form.batchName} onChange={(e) => setForm({ ...form, batchName: e.target.value })} /></FormField>
            <FormField label="Room"><input className="input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} /></FormField>
            <FormField label="Notes"><input className="input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></FormField>
            <FormField label="Status"><select className="input" value={String(form.isActive)} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}><option value="true">Active</option><option value="false">Inactive</option></select></FormField>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.audienceRoles.includes("student")} onChange={() => toggleAudience("student")} /> Students</label>
            <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.audienceRoles.includes("faculty")} onChange={() => toggleAudience("faculty")} /> Faculty</label>
          </div>
          <div className="mt-5 flex flex-wrap justify-end gap-3">
            {editingId ? <button onClick={resetForm} type="button" className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Cancel Update</button> : null}
            <button onClick={submit} disabled={saving} type="button" className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : editingId ? "Update Timetable" : "Create Timetable"}</button>
          </div>
        </SectionCard>

        <SectionCard
          title="Drag-And-Drop Weekly Layout"
          action={(
            <div className="flex flex-wrap items-center gap-3">
              <select className="input w-56" value={boardFilters.facultyId} onChange={(e) => setBoardFilters({ facultyId: e.target.value })}>
                <option value="all">All faculty</option>
                {faculty.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
              {boardFilters.facultyId !== "all" ? <button onClick={() => setBoardFilters({ facultyId: "all" })} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Clear Filter</button> : null}
            </div>
          )}
        >
          <div className="mb-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            {boardFilters.facultyId === "all"
              ? "Showing all timetable slots. Drag any card to another day or position to reorganize the weekly layout."
              : `Showing timetable slots only for ${faculty.find((item) => item._id === boardFilters.facultyId)?.name || "selected faculty"}. Drag-and-drop updates the saved schedule order for those visible entries as part of the full timetable.`}
          </div>
          <div className="grid gap-4 xl:grid-cols-3">
            {groupedEntries.map((group) => (
              <div
                key={group.day}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropDay(group.day);
                }}
                onDrop={async (event) => {
                  event.preventDefault();
                  const draggedId = event.dataTransfer.getData("text/plain");
                  if (!draggedId) return;
                  setDropDay("");
                  await moveEntry(draggedId, group.day);
                  setDraggingId("");
                }}
                className={`rounded-[2rem] border-2 border-dashed p-4 transition ${dropDay === group.day ? "border-orange-300 bg-orange-50" : "border-slate-200 bg-slate-50"}`}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-display text-xl font-bold text-ink">{group.day}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">{group.items.length} slot{group.items.length === 1 ? "" : "s"}</span>
                </div>
                <div className="space-y-3 min-h-[120px]">
                  {group.items.length ? group.items.map((entry) => {
                    const theme = getTimetableTheme(entry.subject, entry.dayOfWeek);
                    return (
                      <div
                        key={entry._id}
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", entry._id);
                          setDraggingId(entry._id);
                        }}
                        onDragEnd={() => {
                          setDraggingId("");
                          setDropDay("");
                        }}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={async (event) => {
                          event.preventDefault();
                          const draggedId = event.dataTransfer.getData("text/plain");
                          if (!draggedId || draggedId === entry._id) return;
                          await moveEntry(draggedId, group.day, entry._id);
                          setDraggingId("");
                          setDropDay("");
                        }}
                        className={`cursor-move rounded-3xl border p-4 shadow-sm ring-2 transition ${theme.card} ${theme.dayRing} ${draggingId === entry._id ? "opacity-50" : "opacity-100"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-ink">{entry.title}</p>
                            <p className={`mt-1 text-sm font-semibold ${theme.accent}`}>{entry.startTime} - {entry.endTime}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${theme.badge}`}>{entry.subject || "General"}</span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{entry.room || "Room TBA"} | Class {entry.className || entry.course?.className || "-"}</p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">Faculty: {entry.faculty?.name || "Not assigned"}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => editEntry(entry)} className="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">Update</button>
                          <button onClick={() => setDeleteTarget(entry)} className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">Delete</button>
                        </div>
                      </div>
                    );
                  }) : <div className="flex min-h-[80px] items-center justify-center rounded-3xl bg-white text-sm text-slate-400">Drop timetable slots here</div>}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Room-Wise Weekly Occupancy Board"
          action={(
            <div className="flex flex-wrap items-center gap-3">
              <select className="input w-56" value={occupancyFilters.facultyId} onChange={(e) => setOccupancyFilters((current) => ({ ...current, facultyId: e.target.value }))}>
                <option value="all">All faculty</option>
                {faculty.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
              </select>
              <select className="input w-56" value={occupancyFilters.room} onChange={(e) => setOccupancyFilters((current) => ({ ...current, room: e.target.value }))}>
                <option value="all">All rooms</option>
                {roomOptions.map((room) => <option key={room} value={room}>{room}</option>)}
              </select>
              {(occupancyFilters.facultyId !== "all" || occupancyFilters.room !== "all") ? <button onClick={() => setOccupancyFilters({ facultyId: "all", room: "all" })} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700">Clear Filters</button> : null}
            </div>
          )}
        >
          <div className="mb-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">
            View occupancy by room, narrow it to a specific faculty, or combine both filters to inspect one teacher's weekly room usage.
          </div>
          <div className="space-y-5">
            {roomOccupancy.length ? roomOccupancy.map((room) => (
              <div key={room.room} className="rounded-[2rem] border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-display text-xl font-bold text-ink">{room.room}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {days.reduce((count, day) => count + room.byDay[day].length, 0)} scheduled slot{days.reduce((count, day) => count + room.byDay[day].length, 0) === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="grid gap-3 xl:grid-cols-4">
                  {days.map((day) => (
                    <div key={`${room.room}-${day}`} className="rounded-3xl bg-white p-4 shadow-sm">
                      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">{day}</p>
                      <div className="mt-3 space-y-2 min-h-[60px]">
                        {room.byDay[day].length ? room.byDay[day].map((entry) => {
                          const theme = getTimetableTheme(entry.subject, entry.dayOfWeek);
                          return (
                            <div key={entry._id} className={`rounded-2xl border px-3 py-2 ${theme.card}`}>
                              <p className="text-sm font-semibold text-ink">{entry.title}</p>
                              <p className="text-xs text-slate-600">{entry.startTime} - {entry.endTime}</p>
                              <p className="text-xs text-slate-500">{entry.faculty?.name || "No faculty"}</p>
                            </div>
                          );
                        }) : <p className="text-sm text-slate-400">Free</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )) : <EmptyState title="No room occupancy found" description="Try another faculty or room filter, or add timetable entries with rooms to fill the weekly occupancy board." />}
          </div>
        </SectionCard>
      </div>

      <Modal open={Boolean(deleteTarget)} title="Delete Timetable Entry" onClose={() => !deleting && setDeleteTarget(null)}>
        {deleteTarget ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">Delete <span className="font-semibold text-ink">{deleteTarget.title}</span> scheduled on <span className="font-semibold text-ink">{deleteTarget.dayOfWeek}</span> from <span className="font-semibold text-ink">{deleteTarget.startTime}</span> to <span className="font-semibold text-ink">{deleteTarget.endTime}</span>?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} disabled={deleting} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
              <button onClick={removeEntry} disabled={deleting} className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white">{deleting ? "Deleting..." : "Delete Entry"}</button>
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
