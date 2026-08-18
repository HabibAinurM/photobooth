"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Camera,
  Download,
  Lock,
  Save,
  Settings2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { DEFAULT_SETTINGS, getSettings, saveSettings } from "@/lib/settings";
import { getFavoriteFrame, getStats } from "@/lib/stats";
import { FRAMES } from "@/lib/frames";
import { DailyStats, EventSettings } from "@/types";

const ADMIN_PASSWORD = "hutri81";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (!authed) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-malam px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (password === ADMIN_PASSWORD) {
              setAuthed(true);
            } else {
              setError("Password salah. Coba lagi.");
            }
          }}
          className="w-full max-w-xs rounded-2xl border border-emas/20 bg-stone-900 p-6 text-center"
        >
          <Lock className="mx-auto mb-3 text-emas" size={28} />
          <h1 className="font-display text-lg font-bold text-emas">
            Admin Photobooth
          </h1>
          <p className="mt-1 text-xs text-white/50">
            Masukkan password untuk mengelola acara
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="mt-4 w-full rounded-xl border border-white/15 bg-stone-800 px-4 py-2.5 text-center text-sm text-white outline-none focus:border-emas"
          />
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
          <Button type="submit" variant="dark" className="mt-4 w-full">
            Masuk
          </Button>
          <p className="mt-3 text-[10px] text-white/30">
            Password demo: {ADMIN_PASSWORD}
          </p>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [stats, setStats] = useState<DailyStats | null>(null);
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [customFrames, setCustomFrames] = useState<
    { name: string; preview: string }[]
  >([]);

  useEffect(() => {
    setStats(getStats());
    setSettings(getSettings());
    const interval = window.setInterval(() => setStats(getStats()), 4000);
    return () => window.clearInterval(interval);
  }, []);

  const favoriteId = getFavoriteFrame();
  const favorite = FRAMES.find((f) => f.id === favoriteId);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleUploadFrame = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setCustomFrames((prev) => [
        ...prev,
        { name: file.name, preview: reader.result as string },
      ]);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-dvh bg-stone-50 px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-2">
          <BarChart3 className="text-merah" size={22} />
          <h1 className="font-display text-2xl font-bold text-merah-tua">
            Dashboard Admin
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Camera size={18} />}
            label="Jumlah Foto Hari Ini"
            value={stats?.photosToday ?? 0}
          />
          <StatCard
            icon={<Download size={18} />}
            label="Jumlah Download"
            value={stats?.downloadsToday ?? 0}
          />
          <StatCard
            icon={<Users size={18} />}
            label="Pengunjung"
            value={stats?.visitorsToday ?? 0}
          />
          <StatCard
            icon={<Trophy size={18} />}
            label="Frame Terfavorit"
            value={favorite ? `${favorite.emoji} ${favorite.name}` : "—"}
            small
          />
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-merah-tua">
              <Settings2 size={16} /> Ubah Tema Acara
            </p>
            <div className="space-y-3">
              <Field
                label="Judul Acara"
                value={settings.eventTitle}
                onChange={(v) => setSettings({ ...settings, eventTitle: v })}
              />
              <Field
                label="Sub-judul"
                value={settings.eventSubtitle}
                onChange={(v) => setSettings({ ...settings, eventSubtitle: v })}
              />
              <Field
                label="Nama Desa"
                value={settings.villageName}
                onChange={(v) => setSettings({ ...settings, villageName: v })}
              />
              <Field
                label="Tanggal Acara"
                value={settings.eventDate}
                onChange={(v) => setSettings({ ...settings, eventDate: v })}
              />

              <div className="flex items-center justify-between pt-1">
                <span className="flex items-center gap-1.5 text-sm text-stone-600">
                  <Sparkles size={14} /> Fitur Stiker
                </span>
                <ToggleSwitch
                  checked={settings.stickersEnabled}
                  onChange={(v) =>
                    setSettings({ ...settings, stickersEnabled: v })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-600">Mode Kiosk</span>
                <ToggleSwitch
                  checked={settings.kioskModeEnabled}
                  onChange={(v) =>
                    setSettings({ ...settings, kioskModeEnabled: v })
                  }
                />
              </div>

              <Button onClick={handleSave} className="mt-2 w-full">
                <Save size={16} />
                {saved ? "Tersimpan!" : "Simpan Perubahan"}
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-merah-tua">
              📤 Upload Frame Baru
            </p>
            <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 py-8 text-sm text-stone-400 hover:border-merah hover:text-merah">
              Klik untuk pilih gambar frame
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadFrame(file);
                }}
              />
            </label>
            <p className="mt-2 text-[11px] text-stone-400">
              Catatan: pratinjau ini hanya tersimpan untuk sesi browser ini
              karena aplikasi belum terhubung ke server penyimpanan.
            </p>

            {customFrames.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {customFrames.map((f, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={f.preview}
                    alt={f.name}
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
            )}

            <div className="mt-6 rounded-xl bg-stone-50 p-4 text-xs text-stone-500">
              🖼️ Galeri hasil foto peserta memerlukan penyimpanan server
              (mis. object storage) yang belum diaktifkan pada versi ini.
              Statistik di atas dihitung dari aktivitas di perangkat ini.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  small,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  small?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-merah">
        {icon}
      </div>
      <p className={`font-display font-bold text-merah-tua ${small ? "text-sm" : "text-2xl"}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-stone-500">{label}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-stone-500">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-merah"
      />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${
        checked ? "bg-merah" : "bg-stone-300"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
          checked ? "left-5" : "left-0.5"
        }`}
      />
    </button>
  );
}
