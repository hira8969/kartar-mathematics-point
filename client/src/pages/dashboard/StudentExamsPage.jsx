import { useEffect, useMemo, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { examService } from "../../services/examService";
import { formatDate } from "../../utils/formatters";

export default function StudentExamsPage() {
  const { push } = useNotifications();
  const [exams, setExams] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeExam, setActiveExam] = useState(null);
  const [answers, setAnswers] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [examList, resultList] = await Promise.all([examService.getAll(), examService.getResults()]);
      setExams(examList);
      setResults(resultList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resultByExam = useMemo(() => Object.fromEntries(results.map((item) => [item.exam?._id, item])), [results]);

  const submit = async () => {
    await examService.submit(activeExam._id, { answers });
    push("Exam submitted", "success");
    setActiveExam(null);
    setAnswers({});
    load();
  };

  if (loading) return <LoadingState label="Loading exams..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="EMS Exams" title="Upcoming tests and published results" description="Attempt objective and subjective papers once faculty schedules them." />
      <SectionCard title="Upcoming Exams">
        <div className="space-y-4">
          {exams.length ? exams.map((exam) => (
            <div key={exam._id} className="rounded-3xl bg-slate-50 p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{exam.title}</p>
                  <p className="text-sm text-slate-500">{formatDate(exam.date, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                  <p className="mt-1 text-sm text-slate-600">Duration {exam.durationMinutes} mins | Total {exam.totalMarks} marks</p>
                </div>
                <button onClick={() => setActiveExam(exam)} className="btn-primary">Attempt</button>
              </div>
            </div>
          )) : <EmptyState title="No exams scheduled" description="Upcoming exams will be listed here." />}
        </div>
      </SectionCard>
      <SectionCard title="Results">
        <div className="space-y-3">
          {results.length ? results.map((item) => (
            <div key={item._id} className="rounded-2xl bg-orange-50 p-4">
              <p className="font-semibold">{item.exam?.title}</p>
              <p className="text-sm text-slate-600">Score: {item.obtainedMarks} / {item.exam?.totalMarks}</p>
            </div>
          )) : <EmptyState title="No results yet" description="Exam scores will appear here after submission and publication." />}
        </div>
      </SectionCard>

      <Modal open={Boolean(activeExam)} title={activeExam?.title || "Exam"} onClose={() => setActiveExam(null)}>
        <p className="text-sm text-slate-600">Timer preview: {activeExam?.durationMinutes} minutes.</p>
        <div className="mt-4 space-y-4">
          {(activeExam?.questions || []).map((question, index) => (
            <div key={question._id} className="rounded-2xl bg-slate-50 p-4">
              <p className="font-semibold">Q{index + 1}. {question.prompt}</p>
              {question.type === "mcq" ? (
                <div className="mt-3 space-y-2">
                  {question.options.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="radio" name={question._id} onChange={() => setAnswers((current) => ({ ...current, [question._id]: option }))} />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea className="input mt-3 min-h-28" onChange={(e) => setAnswers((current) => ({ ...current, [question._id]: e.target.value }))} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={submit} className="btn-secondary">Submit Exam</button>
        </div>
      </Modal>
    </div>
  );
}
