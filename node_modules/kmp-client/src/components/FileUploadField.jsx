export default function FileUploadField({ label, onChange, accept }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="mt-2 text-xs text-slate-500">Upload PDF, notes, or assignment files</span>
      <input className="hidden" type="file" accept={accept} onChange={onChange} />
    </label>
  );
}
