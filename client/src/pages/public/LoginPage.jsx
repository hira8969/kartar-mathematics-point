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
      setError(err.response?.data?.message || "Login failed");
      push("Unable to login", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-app flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={onSubmit} className="card w-full max-w-md p-8">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-saffron">{INSTITUTE.tagline}</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-ink">Login to your portal</h1>
        <p className="mt-2 text-sm text-slate-500">Use email or phone with your password.</p>
        <div className="mt-6 space-y-4">
          <input className="input" placeholder="Email or phone" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} />
          <input className="input" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
        <button disabled={submitting} className="btn-primary mt-6 w-full">{submitting ? "Signing in..." : "Login"}</button>
        <p className="mt-4 text-sm text-slate-600">New here? <Link className="font-semibold text-saffron" to="/register">Create account</Link></p>
      </form>
    </div>
  );
}
