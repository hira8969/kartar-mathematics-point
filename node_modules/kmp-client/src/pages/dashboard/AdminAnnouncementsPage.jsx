import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { announcementService } from "../../services/announcementService";
import { formatDate } from "../../utils/formatters";

export default function AdminAnnouncementsPage() {
  const { push, refreshNotifications } = useNotifications();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", scope: "global" });

  const load = async () => {
    setLoading(true);
    try {
      setItems(await announcementService.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const publish = async () => {
    if (!form.title.trim() || !form.message.trim()) {
      push("Title and message are required", "error");
      return;
    }

    setSubmitting(true);
    try {
      await announcementService.create({
        title: form.title.trim(),
        message: form.message.trim(),
        scope: "global"
      });
      push("Global announcement published to admin, faculty, and students", "success");
      setForm({ title: "", message: "", scope: "global" });
      await Promise.all([load(), refreshNotifications()]);
    } catch (error) {
      push(error.response?.data?.message || "Unable to publish announcement", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState label="Loading announcement center..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Announcement Center" title="Post institute-wide announcements" description="Publish global notices that reach students, faculty, and admin instantly." />
      <SectionCard title="Publish Announcement">
        <div className="grid gap-3">
          <FormField label="Title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Message"><textarea className="input min-h-28" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></FormField>
        </div>
        <button onClick={publish} disabled={submitting} className="btn-secondary mt-4 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? "Publishing..." : "Publish"}
        </button>
      </SectionCard>
      <SectionCard title="Recent Announcements">
        <div className="space-y-3">
          {items.length ? items.map((item) => (
            <div key={item._id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
            </div>
          )) : <EmptyState title="No announcements" description="Create the first global notice above." />}
        </div>
      </SectionCard>
    </div>
  );
}
