import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { dashboardPathByRole } from "../../utils/roleConfig";
import { INSTITUTE } from "../../utils/constants";

export default function LoginPage() {
  const { login } = useAuth();
  const { push } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const user = await login(form);
      push("Login successful", "success");
      navigate(location.state?.from?.pathname || dashboardPathByRole[user.role]);
    } catch (err) {
      const message = err.response?.data?.message || (err.request ? "Unable to reach backend API" : "Login failed");
      setError(message);
      push(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-app flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-saffron">{INSTITUTE.tagline}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Login to your portal</h1>
        <p className="mt-2 text-sm text-slate-500">Use the email and password shared by admin.</p>
        <div className="mt-6 space-y-4">
          <input className="input" type="email" placeholder="Email address" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
        <button disabled={submitting} className="btn-primary mt-6 w-full">{submitting ? "Signing in..." : "Login"}</button>
        <p className="mt-4 text-sm text-slate-600">Need access? <Link className="font-semibold text-saffron" to="/register">Register request</Link></p>
      </form>
    </div>
  );
}
