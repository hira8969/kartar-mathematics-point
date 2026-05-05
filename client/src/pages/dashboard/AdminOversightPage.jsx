import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { adminService } from "../../services/adminService";
import { announcementService } from "../../services/announcementService";
import { assignmentService } from "../../services/assignmentService";
import { examService } from "../../services/examService";
import { formatDate } from "../../utils/formatters";

export default function AdminOversightPage() {
  const { push } = useNotifications();
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [assignmentList, examList] = await Promise.all([assignmentService.getAll(), examService.getAll()]);
      setAssignments(assignmentList);
      setExams(examList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const deleteExam = async (id) => {
    await examService.remove(id);
    push("Exam deleted", "success");
    load();
  };

  if (loading) return <LoadingState label="Loading oversight tools..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Oversight" title="Assignments and exam oversight" description="Review published assignments and exams across the institute." />
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Assignments">
          <div className="space-y-3">
            {assignments.length ? assignments.map((item) => (
              <div key={item._id} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-slate-600">Due {formatDate(item.dueDate)}</p>
              </div>
            )) : <EmptyState title="No assignments" description="Faculty assignments will appear here." />}
          </div>
        </SectionCard>
        <SectionCard title="Exams">
          <div className="space-y-3">
            {exams.length ? exams.map((exam) => (
              <div key={exam._id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">{exam.title}</p>
                    <p className="text-sm text-slate-600">{formatDate(exam.date)}</p>
                  </div>
                  <button onClick={() => deleteExam(exam._id)} className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600">Delete</button>
                </div>
              </div>
            )) : <EmptyState title="No exams" description="Published exams will appear here." />}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
