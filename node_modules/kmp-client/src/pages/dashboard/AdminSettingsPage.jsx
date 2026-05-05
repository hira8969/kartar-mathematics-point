import { useEffect, useMemo, useState } from "react";
import FormField from "../../components/FormField";
import Modal from "../../components/Modal";
import PageHeader from "../../components/PageHeader";
import SectionCard from "../../components/SectionCard";
import { useNotifications } from "../../context/NotificationContext";
import { adminService } from "../../services/adminService";
import { INSTITUTE } from "../../utils/constants";

const initialSettings = {
  name: INSTITUTE.name,
  address: INSTITUTE.address,
  contact: INSTITUTE.contact,
  logoDataUrl: "",
  signatureDataUrl: ""
};

const cropPresets = {
  logoDataUrl: { width: 360, height: 360, label: "Logo", accent: "orange" },
  signatureDataUrl: { width: 960, height: 260, label: "Signature", accent: "emerald" }
};

const toDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error("Unable to read image file"));
  reader.readAsDataURL(file);
});

const loadImage = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("Unable to load image preview"));
  image.src = src;
});

const renderAdjustedImage = async (src, field, zoom, offsetX, offsetY) => {
  const image = await loadImage(src);
  const preset = cropPresets[field];
  const canvas = document.createElement("canvas");
  canvas.width = preset.width;
  canvas.height = preset.height;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, preset.width, preset.height);

  const baseScale = Math.max(preset.width / image.width, preset.height / image.height);
  const scale = baseScale * zoom;
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const x = (preset.width - drawWidth) / 2 + offsetX;
  const y = (preset.height - drawHeight) / 2 + offsetY;

  context.drawImage(image, x, y, drawWidth, drawHeight);
  return canvas.toDataURL("image/png");
};

export default function AdminSettingsPage() {
  const { push } = useNotifications();
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editor, setEditor] = useState({ open: false, field: "logoDataUrl", source: "", zoom: 1, offsetX: 0, offsetY: 0, preview: "" });

  useEffect(() => {
    adminService.getInstituteSettings()
      .then((data) => setSettings({
        name: data.name || INSTITUTE.name,
        address: data.address || INSTITUTE.address,
        contact: data.contact || INSTITUTE.contact,
        logoDataUrl: data.logoDataUrl || "",
        signatureDataUrl: data.signatureDataUrl || ""
      }))
      .catch((error) => push(error.response?.data?.message || "Unable to load institute settings", "error"))
      .finally(() => setLoading(false));
  }, [push]);

  useEffect(() => {
    if (!editor.open || !editor.source) {
      return undefined;
    }

    let cancelled = false;
    renderAdjustedImage(editor.source, editor.field, editor.zoom, editor.offsetX, editor.offsetY)
      .then((preview) => {
        if (!cancelled) {
          setEditor((current) => ({ ...current, preview }));
        }
      })
      .catch((error) => {
        if (!cancelled) {
          push(error.message || "Unable to build image preview", "error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [editor.open, editor.source, editor.field, editor.zoom, editor.offsetX, editor.offsetY, push]);

  const editorPreset = useMemo(() => cropPresets[editor.field], [editor.field]);

  const openEditor = async (field, file) => {
    if (!file) {
      return;
    }

    try {
      const source = await toDataUrl(file);
      setEditor({ open: true, field, source, zoom: 1, offsetX: 0, offsetY: 0, preview: source });
    } catch (error) {
      push(error.message || "Unable to prepare image", "error");
    }
  };

  const applyEditedImage = () => {
    setSettings((current) => ({ ...current, [editor.field]: editor.preview }));
    setEditor({ open: false, field: "logoDataUrl", source: "", zoom: 1, offsetX: 0, offsetY: 0, preview: "" });
  };

  const submit = async () => {
    setSaving(true);
    try {
      const saved = await adminService.updateInstituteSettings(settings);
      setSettings({
        name: saved.name || INSTITUTE.name,
        address: saved.address || INSTITUTE.address,
        contact: saved.contact || INSTITUTE.contact,
        logoDataUrl: saved.logoDataUrl || "",
        signatureDataUrl: saved.signatureDataUrl || ""
      });
      push("Institute settings saved successfully", "success");
    } catch (error) {
      push(error.response?.data?.message || "Unable to save institute settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <PageHeader eyebrow="Settings" title="Admin settings" description="Manage institute branding for certificates and tune uploaded images before saving them." />
        <SectionCard title="Institute Details">
          {loading ? <p className="text-sm text-slate-500">Loading settings...</p> : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <FormField label="Institute Name">
                  <input className="input" value={settings.name} onChange={(e) => setSettings({ ...settings, name: e.target.value })} />
                </FormField>
                <FormField label="Institute Contact">
                  <input className="input" value={settings.contact} onChange={(e) => setSettings({ ...settings, contact: e.target.value })} />
                </FormField>
                <FormField label="Institute Address">
                  <input className="input" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} />
                </FormField>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">Institute Logo</p>
                      <p className="text-sm text-slate-500">Upload, preview, crop, and resize your real institute logo before saving.</p>
                    </div>
                    {settings.logoDataUrl ? <img src={settings.logoDataUrl} alt="Institute logo preview" className="h-24 w-24 rounded-2xl border border-slate-200 bg-white object-contain p-2" /> : <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-xs text-slate-400">Default</div>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <input type="file" accept="image/*" onChange={(e) => openEditor("logoDataUrl", e.target.files?.[0])} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:font-semibold file:text-orange-700" />
                    <button type="button" onClick={() => setSettings((current) => ({ ...current, logoDataUrl: "" }))} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Use Default Logo</button>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink">Admin Signature</p>
                      <p className="text-sm text-slate-500">Upload a scanned signature and fine-tune it before it appears on certificates.</p>
                    </div>
                    {settings.signatureDataUrl ? <img src={settings.signatureDataUrl} alt="Signature preview" className="h-24 w-44 rounded-2xl border border-slate-200 bg-white object-contain p-2" /> : <div className="flex h-24 w-44 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-xs text-slate-400">Default</div>}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <input type="file" accept="image/*" onChange={(e) => openEditor("signatureDataUrl", e.target.files?.[0])} className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-2xl file:border-0 file:bg-emerald-100 file:px-4 file:py-2 file:font-semibold file:text-emerald-700" />
                    <button type="button" onClick={() => setSettings((current) => ({ ...current, signatureDataUrl: "" }))} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Use Default Signature</button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={submit} disabled={saving} className="btn-primary disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving..." : "Save Settings"}</button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <Modal open={editor.open} title={`Adjust ${editorPreset?.label || "Image"}`} onClose={() => setEditor({ open: false, field: "logoDataUrl", source: "", zoom: 1, offsetX: 0, offsetY: 0, preview: "" })}>
        <div className="space-y-5">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Live Output Preview</p>
              <div className="flex min-h-[260px] items-center justify-center rounded-3xl bg-white p-4">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-inner" style={{ width: editor.field === "signatureDataUrl" ? 280 : 220, height: editor.field === "signatureDataUrl" ? 110 : 220 }}>
                  {editor.preview ? <img src={editor.preview} alt="Adjusted output preview" className="h-full w-full object-contain" /> : null}
                </div>
              </div>
            </div>
            <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <FormField label="Zoom">
                <input type="range" min="1" max="3" step="0.05" value={editor.zoom} onChange={(e) => setEditor((current) => ({ ...current, zoom: Number(e.target.value) }))} className="w-full" />
              </FormField>
              <FormField label="Horizontal Position">
                <input type="range" min="-260" max="260" step="2" value={editor.offsetX} onChange={(e) => setEditor((current) => ({ ...current, offsetX: Number(e.target.value) }))} className="w-full" />
              </FormField>
              <FormField label="Vertical Position">
                <input type="range" min="-260" max="260" step="2" value={editor.offsetY} onChange={(e) => setEditor((current) => ({ ...current, offsetY: Number(e.target.value) }))} className="w-full" />
              </FormField>
              <p className="text-xs text-slate-500">Use these sliders to crop and resize the uploaded image before it is saved to certificate settings.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEditor({ open: false, field: "logoDataUrl", source: "", zoom: 1, offsetX: 0, offsetY: 0, preview: "" })} className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button>
            <button type="button" onClick={applyEditedImage} className="btn-primary">Apply Image</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
