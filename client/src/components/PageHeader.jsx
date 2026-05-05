export default function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-ink px-6 py-7 text-white shadow-xl shadow-slate-200 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.3em] text-orange-200">{eyebrow}</p> : null}
        <h1 className="mt-2 font-display text-3xl font-extrabold md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-sm text-slate-200">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
