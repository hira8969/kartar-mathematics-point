import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingState from "../../components/LoadingState";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { courseService } from "../../services/courseService";
import { examService } from "../../services/examService";
import { formatDate } from "../../utils/formatters";

export default function FacultyExamsPage() {
  const { push } = useNotifications();
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", date: "", durationMinutes: 60, totalMarks: 100, course: "", questions: [] });
  const [question, setQuestion] = useState({ type: "mcq", prompt: "", options: "", correctAnswer: "", marks: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const [courseList, examList] = await Promise.all([courseService.getAll(), examService.getAll()]);
      setCourses(courseList);
      setExams(examList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const addQuestion = () => {
    const normalized = {
      ...question,
      options: question.type === "mcq" ? question.options.split(",").map((item) => item.trim()).filter(Boolean) : []
    };
    setForm((current) => ({ ...current, questions: [...current.questions, normalized] }));
    setQuestion({ type: "mcq", prompt: "", options: "", correctAnswer: "", marks: 1 });
  };

  const createExam = async () => {
    await examService.create(form);
    push("Exam created", "success");
    setForm({ title: "", date: "", durationMinutes: 60, totalMarks: 100, course: "", questions: [] });
    load();
  };

  if (loading) return <LoadingState label="Loading exams..." />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Faculty Exams" title="Create tests and question banks" description="Schedule exams, add MCQ and descriptive questions, and publish for students." />
      <SectionCard title="Create Exam">
        <div className="grid gap-3 md:grid-cols-2">
          <FormField label="Exam title"><input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Date & time"><input className="input" type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></FormField>
          <FormField label="Course"><select className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}><option value="">Select course</option>{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></FormField>
          <FormField label="Duration (minutes)"><input className="input" type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} /></FormField>
          <FormField label="Total marks"><input className="input" type="number" value={form.totalMarks} onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })} /></FormField>
        </div>
        <div className="mt-5 rounded-3xl bg-slate-50 p-5">
          <p className="font-display text-xl font-bold text-ink">Add Question</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <FormField label="Question type"><select className="input" value={question.type} onChange={(e) => setQuestion({ ...question, type: e.target.value })}><option value="mcq">MCQ</option><option value="subjective">Subjective</option></select></FormField>
            <FormField label="Marks"><input className="input" type="number" value={question.marks} onChange={(e) => setQuestion({ ...question, marks: Number(e.target.value) })} /></FormField>
            <div className="md:col-span-2"><FormField label="Prompt"><textarea className="input min-h-24" value={question.prompt} onChange={(e) => setQuestion({ ...question, prompt: e.target.value })} /></FormField></div>
            {question.type === "mcq" ? (
              <>
                <FormField label="Options"><input className="input" placeholder="Option A, Option B" value={question.options} onChange={(e) => setQuestion({ ...question, options: e.target.value })} /></FormField>
                <FormField label="Correct answer"><input className="input" value={question.correctAnswer} onChange={(e) => setQuestion({ ...question, correctAnswer: e.target.value })} /></FormField>
              </>
            ) : null}
          </div>
          <button onClick={addQuestion} className="btn-primary mt-4">Add Question</button>
        </div>
        <div className="mt-4 space-y-2">
          {form.questions.map((item, index) => <div key={`${item.prompt}-${index}`} className="rounded-2xl bg-orange-50 p-3 text-sm">Q{index + 1}. {item.prompt}</div>)}
        </div>
        <button onClick={createExam} className="btn-secondary mt-4">Publish Exam</button>
      </SectionCard>
      <SectionCard title="Scheduled Exams">
        <div className="space-y-3">
          {exams.length ? exams.map((exam) => (
            <div key={exam._id} className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-semibold">{exam.title}</p>
              <p className="text-sm text-slate-600">{formatDate(exam.date, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          )) : <EmptyState title="No exams yet" description="Create your first exam above." />}
        </div>
      </SectionCard>
    </div>
  );
}
