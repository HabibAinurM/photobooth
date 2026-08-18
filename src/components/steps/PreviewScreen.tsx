"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, RotateCcw, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { useBoothStore } from "@/store/useBoothStore";
import { composeResult } from "@/lib/compose";
import { FRAMES, STICKERS } from "@/lib/frames";
import { EventSettings, StickerId } from "@/types";

export default function PreviewScreen({ settings }: { settings: EventSettings }) {
  const { frameId, printSize, photos, name, stickers, composedImage } =
    useBoothStore();
  const setName = useBoothStore((s) => s.setName);
  const toggleSticker = useBoothStore((s) => s.toggleSticker);
  const selectFrame = useBoothStore((s) => s.selectFrame);
  const setComposedImage = useBoothStore((s) => s.setComposedImage);
  const retakeAll = useBoothStore((s) => s.retakeAll);
  const goTo = useBoothStore((s) => s.goTo);

  const [rendering, setRendering] = useState(true);
  const frame = FRAMES.find((f) => f.id === frameId) ?? FRAMES[0];
  const validPhotos = photos.filter((p): p is string => Boolean(p));

  useEffect(() => {
    let cancelled = false;
    if (validPhotos.length === 0) return;
    setRendering(true);
    composeResult({
      frame,
      printSize,
      photos: validPhotos,
      name,
      stickers,
      settings,
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setComposedImage(dataUrl);
          setRendering(false);
        }
      })
      .catch(() => !cancelled && setRendering(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameId, printSize, name, stickers, photos]);

  return (
    <div className="min-h-dvh bg-krem px-5 py-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => goTo("camera")}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-merah-tua/70 hover:text-merah-tua"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <h2 className="font-display text-2xl font-bold text-merah-tua">
          Preview Hasil
        </h2>

        <div className="relative mx-auto mt-5 max-w-[260px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
          {rendering && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70">
              <Loader2 className="animate-spin text-merah" size={28} />
            </div>
          )}
          {composedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={composedImage} alt="Hasil photobooth" className="w-full" />
          )}
        </div>

        <div className="mt-6">
          <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Tambah Nama
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 30))}
            placeholder="Nama kamu (opsional)"
            className="mt-1.5 w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm outline-none focus:border-merah"
          />
        </div>

        {settings.stickersEnabled && (
          <div className="mt-5">
            <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
              Stiker
            </label>
            <div className="mt-1.5 flex gap-2">
              {STICKERS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggleSticker(s.id as StickerId)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-xl transition ${
                    stickers.includes(s.id)
                      ? "border-merah bg-red-50"
                      : "border-stone-200"
                  }`}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">
            Ganti Frame
          </label>
          <div className="mt-1.5 flex gap-2 overflow-x-auto pb-1">
            {FRAMES.map((f) => (
              <button
                key={f.id}
                onClick={() => selectFrame(f.id)}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-xl ${
                  frameId === f.id ? "border-merah bg-red-50" : "border-stone-200"
                }`}
                title={f.name}
              >
                {f.emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            variant="secondary"
            onClick={retakeAll}
            className="flex-1"
          >
            <RotateCcw size={16} />
            Ulangi Semua
          </Button>
          <Button
            onClick={() => goTo("download")}
            disabled={rendering}
            className="flex-1"
          >
            Lanjut
            <ArrowRight size={16} />
          </Button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-stone-400">
          <Sparkles size={12} />
          Kamu bisa ulang foto tertentu dari langkah kamera sebelumnya
        </p>
      </div>
    </div>
  );
}
