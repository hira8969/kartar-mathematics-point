import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useAuth } from "../../context/AuthContext";
import { INSTITUTE } from "../../utils/constants";

export default function StudentProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Profile" title="Student profile" description="Your registered account details for Kartar Mathematics Point." />
      <SectionCard title="Profile Details">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Name</p><p className="font-semibold">{user?.name}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Role</p><p className="font-semibold capitalize">{user?.role}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Email</p><p className="font-semibold">{user?.email || "Not provided"}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Phone</p><p className="font-semibold">{user?.phone}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Class</p><p className="font-semibold">{user?.studentClass || "Not assigned"}</p></div>
          <div className="rounded-2xl bg-slate-50 p-4"><p className="text-sm text-slate-500">Institute Contact</p><p className="font-semibold">{INSTITUTE.contact}</p></div>
        </div>
      </SectionCard>
    </div>
  );
}
