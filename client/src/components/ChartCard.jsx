export default function ChartCard({ title, items }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="card p-6">
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100">
              <div className="h-3 rounded-full bg-saffron" style={{ width: `${(item.value / maxValue) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
