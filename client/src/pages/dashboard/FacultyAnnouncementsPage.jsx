import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { announcementService } from "../../services/announcementService";
import { courseService } from "../../services/courseService";
import { formatDate } from "../../utils/formatters";

export default function FacultyAnnouncementsPage() {
  const { push } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", message: "", scope: "global", course: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [courseList, announcementList] = await Promise.all([courseService.getAll(), announcementService.getAll()]);
      setCourses(courseList);
      setAnnouncements(announcementList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const publish = async () => {
    await announcementService.create(form);
    push("Announcement published", "success");
    setForm({ title: "", message: "", scope: "global", course: "" });
    load();
  };

  if (loading) return <LoadingState label="Loading announcements..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Faculty Announcements" title="Post notices for your students" description="Share exam alerts, assignment reminders, and course notices." />
      <SectionCard title="Create Announcement">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Scope"><select className="input" value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}><option value="global">Global</option><option value="course">Course</option></select></FormField>
          {form.scope === "course" ? <div className="md:col-span-2"><FormField label="Course"><select className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></FormField></div> : null}
          <div className="md:col-span-2"><FormField label="Message"><textarea className="input min-h-28" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></FormField></div>
        </div>
        <button onClick={publish} className="btn-secondary mt-4">Publish Notice</button>
      </SectionCard>
      <SectionCard title="Recent Announcements">
        <div className="space-y-3">
          {announcements.length ? announcements.map((item) => (
            <div key={item._id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
            </div>
          )) : <EmptyState title="No announcements yet" description="Publish your first notice above." />}
        </div>
      </SectionCard>
    </div>
  );
}
