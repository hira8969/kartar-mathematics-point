export default function SectionCard({ title, children, action }) {
  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
