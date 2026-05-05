export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 px-4 py-8">
      <div className="card w-full max-w-2xl p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
          <button onClick={onClose} className="rounded-full border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-600">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}
