import { useNotifications } from "../context/NotificationContext";

const tones = {
  info: "border-slate-200 bg-white text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  error: "border-red-200 bg-red-50 text-red-700"
};

export default function ToastViewport() {
  const { items, remove } = useNotifications();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3">
      {items.map((item) => (
        <div key={item.id} className={`pointer-events-auto rounded-2xl border p-4 shadow-lg ${tones[item.type] || tones.info}`}>
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold">{item.message}</p>
            <button className="text-xs font-bold uppercase tracking-wide" onClick={() => remove(item.id)}>
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
