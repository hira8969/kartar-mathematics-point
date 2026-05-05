import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FileUploadField from "../../components/FileUploadField";
import LoadingState from "../../components/LoadingState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { assignmentService } from "../../services/assignmentService";
import { formatDate } from "../../utils/formatters";

export default function StudentAssignmentsPage() {
  const { push } = useNotifications();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setAssignments(await assignmentService.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async () => {
    await assignmentService.submit(selected._id, { textAnswer, file });
    push("Assignment submitted", "success");
    setSelected(null);
    setTextAnswer("");
    setFile(null);
  };

  const rows = useMemo(() => assignments.map((item) => ({
    ...item,
    status: new Date(item.dueDate) < new Date() ? "closed" : "pending"
  })), [assignments]);

  if (loading) return <LoadingState label="Loading assignments..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Assignments" title="Homework and graded practice" description="Open an assignment to read instructions and submit a written response or file." />
      <SectionCard title="Assignment List">
        <div className="space-y-4">
          {rows.length ? rows.map((item) => (
            <div key={item._id} className="rounded-3xl bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-slate-500">Due {formatDate(item.dueDate)} | Max {item.maxMarks} marks</p>
                  <p className="mt-2 text-sm text-slate-600">Status: {item.status}</p>
                </div>
                <button onClick={() => setSelected(item)} className="btn-primary">View & Submit</button>
              </div>
            </div>
          )) : <EmptyState title="No assignments yet" description="Faculty assignments will appear here." />}
        </div>
      </SectionCard>

      <Modal open={Boolean(selected)} title={selected?.title || "Assignment"} onClose={() => setSelected(null)}>
        <p className="text-sm text-slate-600">{selected?.instructions || "No instructions provided."}</p>
        <textarea className="input mt-4 min-h-40" placeholder="Write your answer here" value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)} />
        <div className="mt-4">
          <FileUploadField label="Attach assignment file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={submit} className="btn-secondary">Submit Assignment</button>
        </div>
      </Modal>
    </div>
  );
}
