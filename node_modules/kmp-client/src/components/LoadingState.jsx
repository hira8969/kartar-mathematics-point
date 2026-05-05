export default function LoadingState({ label = "Loading..." }) {
  return (
    <div className="card flex min-h-48 items-center justify-center p-8 text-sm font-semibold text-slate-500">
      {label}
    </div>
  );
}
