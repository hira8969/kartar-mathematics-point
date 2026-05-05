import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { dashboardPathByRole } from "../../utils/roleConfig";

export default function RegisterPage() {
  const { register } = useAuth();
  const { push } = useNotifications();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "student",
    studentClass: "10",
    subjectsTaught: "Mathematics"
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload = {
        ...form,
        subjectsTaught: form.role === "faculty"
          ? form.subjectsTaught.split(",").map((item) => item.trim()).filter(Boolean)
          : []
      };
      const user = await register(payload);
      push("Registration successful", "success");
      navigate(dashboardPathByRole[user.role]);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
      push("Unable to register", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-app flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="card w-full max-w-2xl p-8">
        <h1 className="font-display text-3xl font-bold text-ink">Register as Student or Faculty</h1>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
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
            <input className="input" placeholder="Subjects taught, comma separated" value={form.subjectsTaught} onChange={(e) => setForm({ ...form, subjectsTaught: e.target.value })} />
          )}
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
        <button disabled={submitting} className="btn-secondary mt-6 w-full">{submitting ? "Creating account..." : "Register"}</button>
        <p className="mt-4 text-sm text-slate-600">Already have an account? <Link className="font-semibold text-saffron" to="/login">Login</Link></p>
      </form>
    </div>
  );
}
