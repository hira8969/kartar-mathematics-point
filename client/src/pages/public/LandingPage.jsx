import { Link } from "react-router-dom";
import { INSTITUTE } from "../../utils/constants";

const highlights = [
  "Structured Bihar Board mathematics coaching for Classes 6 to 12",
  "Student, Faculty, and Admin portals in one learning management system",
  "Assignments, EMS exams, attendance, course materials, and announcements"
];

export default function LandingPage() {
  return (
    <div className="bg-app text-ink">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 md:px-6">
        <div>
          <p className="font-display text-2xl font-extrabold">{INSTITUTE.name}</p>
          <p className="text-sm text-slate-600">{INSTITUTE.address}</p>
        </div>
        <div className="flex gap-3">
          <Link to="/verify-certificate/KMP-CERT-DEMO" className="rounded-2xl border border-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-700">Verify Certificate</Link>
          <Link to="/login" className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Login</Link>
          <Link to="/register" className="btn-secondary">Register</Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[1.1fr_0.9fr] md:px-6 md:py-20">
        <section>
          <div className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-saffron shadow-sm">{INSTITUTE.tagline}</div>
          <h1 className="mt-5 max-w-3xl font-display text-5xl font-extrabold leading-tight md:text-6xl">
            Front desk, classroom, exam hall, and academic office in one digital campus.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            Built for Bihar Board mathematics coaching with clear role-based access for students, faculty, and admin teams.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary">Get Started</Link>
            <Link to="/contact" className="rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Contact Us</Link>
            <Link to="/verify-certificate/KMP-CERT-DEMO" className="rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">Verify a Certificate</Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item} className="card p-5 text-sm font-semibold text-slate-700">{item}</div>
            ))}
          </div>
        </section>

        <aside className="card overflow-hidden p-0">
          <div className="bg-ink px-8 py-8 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-200">Institute Snapshot</p>
            <h2 className="mt-3 font-display text-3xl font-bold">Bihar Board Mathematics Specialists</h2>
          </div>
          <div className="space-y-6 p-8">
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <p className="mt-1 font-semibold">{INSTITUTE.address}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Contact</p>
              <p className="mt-1 text-4xl font-extrabold text-saffron">{INSTITUTE.contact}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Owner</p>
              <p className="mt-1 font-semibold">{INSTITUTE.ownerName}</p>
              <p className="text-slate-600">{INSTITUTE.ownerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Specialization</p>
              <p className="mt-1 font-semibold">{INSTITUTE.specialization}</p>
            </div>
          </div>
        </aside>
      </main>

      <footer className="border-t border-white/60 bg-white/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 md:flex-row md:items-center md:justify-between md:px-6">
          <p>{INSTITUTE.name} | {INSTITUTE.address}</p>
          <p className="font-bold text-ink">Call {INSTITUTE.contact}</p>
        </div>
      </footer>
    </div>
  );
}
