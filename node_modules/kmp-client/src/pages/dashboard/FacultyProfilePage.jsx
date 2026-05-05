import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useAuth } from "../../context/AuthContext";

export default function FacultyProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile" title="Faculty profile" description="Registered teaching profile for the LMS/EMS portal." />
      <SectionCard title="Profile Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Name</p><p className="font-semibold">{user?.name}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Role</p><p className="font-semibold capitalize">{user?.role}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Email</p><p className="font-semibold">{user?.email || "Not provided"}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Phone</p><p className="font-semibold">{user?.phone}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2"><p className="text-sm text-slate-500">Subjects taught</p><p className="font-semibold">{(user?.subjectsTaught || []).join(", ") || "Mathematics"}</p></div>
        </div>
      </SectionCard>
    </div>
  );
}
