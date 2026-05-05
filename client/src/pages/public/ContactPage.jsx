import { INSTITUTE } from "../../utils/constants";

export default function ContactPage() {
  return (
    <div className="bg-app min-h-screen px-4 py-16 md:px-6">
      <div className="mx-auto max-w-5xl card p-8 md:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-saffron">Contact & Admission</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-ink">{INSTITUTE.name}</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">Address</p>
            <p className="mt-2 text-lg font-semibold">{INSTITUTE.address}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Phone</p>
            <p className="mt-2 text-4xl font-extrabold text-saffron">{INSTITUTE.contact}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Owner</p>
            <p className="mt-2 text-lg font-semibold">{INSTITUTE.ownerName}</p>
            <p className="text-slate-600">{INSTITUTE.ownerEmail}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Specialization</p>
            <p className="mt-2 text-lg font-semibold">{INSTITUTE.specialization}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
