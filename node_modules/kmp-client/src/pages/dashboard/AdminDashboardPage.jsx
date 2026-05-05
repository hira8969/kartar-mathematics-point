import { useEffect, useMemo, useState } from "react";
import ChartCard from "../../components/ChartCard";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import StatCard from "../../components/StatCard";
import { adminService } from "../../services/adminService";
import { dashboardService } from "../../services/dashboardService";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [overview, setOverview] = useState(null);

  useEffect(() => {
    Promise.all([dashboardService.admin(), adminService.overview()]).then(([dashboardData, overviewData]) => {
      setDashboard(dashboardData);
      setOverview(overviewData);
    });
  }, []);

  const chartItems = useMemo(() => overview ? [
    { label: "Students", value: overview.stats.students },
    { label: "Faculty", value: overview.stats.faculty },
    { label: "Courses", value: overview.stats.courses },
    { label: "Exams", value: overview.stats.exams }
  ] : [], [overview]);

  if (!dashboard || !overview) return <LoadingState label="Loading admin dashboard..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin Portal" title="Operations dashboard" description="Monitor users, course delivery, exams, and institute-wide announcements." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Students" value={overview.stats.students} accent="bg-saffron" />
        <StatCard label="Faculty" value={overview.stats.faculty} accent="bg-emerald-500" />
        <StatCard label="Courses" value={overview.stats.courses} accent="bg-sky-500" />
        <StatCard label="Attendance Entries" value={overview.stats.attendance} accent="bg-amber-500" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <ChartCard title="Academic Snapshot" items={chartItems} />
        <SectionCard title="Recent Announcements">
          <div className="space-y-3">
            {dashboard.announcements.length ? dashboard.announcements.map((item) => (
              <div key={item._id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-600">{item.message}</p>
              </div>
            )) : <EmptyState title="No announcements" description="Global notices will appear here." />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
