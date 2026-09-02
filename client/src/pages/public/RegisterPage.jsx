import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";
import { INSTITUTE } from "../../utils/constants";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  role: "student",
  studentClass: "10",
  subjectsTaught: ""
};

export default function RegisterPage() {
  const { push } = useNotifications();
  const [form, setForm] = useState(initialForm);

  const requestBody = useMemo(() => {
    const lines = [
      "New portal access request:",
      "",
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      `Phone: ${form.phone || "Not provided"}`,
      `Role: ${form.role}`,
      form.role === "student" ? `Class: ${form.studentClass}` : `Subjects: ${form.subjectsTaught || "Not provided"}`
    ];

    return lines.join("\n");
  }, [form]);

  const onSubmit = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      push("Name and email are required", "error");
      return;
    }

    const subject = encodeURIComponent(`${INSTITUTE.name} portal access request`);
    const body = encodeURIComponent(requestBody);
    window.location.href = `mailto:${INSTITUTE.ownerEmail}?subject=${subject}&body=${body}`;
    push("Registration request prepared for admin", "success");
  };

  return (
    <div className="bg-app flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="card w-full max-w-2xl p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-saffron">{INSTITUTE.tagline}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Request portal access</h1>
        <p className="mt-2 text-sm text-slate-500">Admin will create your account and share the login password.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" type="email" placeholder="Email address" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone optional" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
          </select>
          {form.role === "student" ? (
            <select className="input" value={form.studentClass} onChange={(e) => setForm({ ...form, studentClass: e.target.value })}>
              {Array.from({ length: 7 }, (_, index) => index + 6).map((value) => (
                <option key={value} value={String(value)}>Class {value}</option>
              ))}
            </select>
          ) : (
            <input className="input md:col-span-2" placeholder="Subjects taught" value={form.subjectsTaught} onChange={(e) => setForm({ ...form, subjectsTaught: e.target.value })} />
          )}
        </div>

        <button className="btn-primary mt-6 w-full">Send Request</button>
        <p className="mt-4 text-sm text-slate-600">Already have an account? <Link className="font-semibold text-saffron" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
