export default function StatCard({ label, value, accent = "bg-ink", helper }) {
  return (
    <div className="card p-5">
      <div className={`mb-4 h-3 w-20 rounded-full ${accent}`} />
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-extrabold text-ink">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
