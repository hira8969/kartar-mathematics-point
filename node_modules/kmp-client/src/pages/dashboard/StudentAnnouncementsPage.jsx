import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { announcementService } from "../../services/announcementService";
import { formatDate } from "../../utils/formatters";

export default function StudentAnnouncementsPage() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    announcementService.getAll().then(setItems);
  }, []);

  if (!items) return <LoadingState label="Loading announcements..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Announcements" title="Institute and course updates" description="Stay updated with faculty notices, exam alerts, and important messages." />
      <SectionCard title="Recent Updates">
        <div className="space-y-3">
          {items.length ? items.map((item) => (
            <div key={item._id} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold">{item.title}</p>
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.scope}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.message}</p>
              <p className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</p>
            </div>
          )) : <EmptyState title="No announcements" description="New notices will show up here." />}
        </div>
      </SectionCard>
    </div>
  );
}
