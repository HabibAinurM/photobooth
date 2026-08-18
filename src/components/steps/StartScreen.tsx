"use client";

import { motion } from "framer-motion";
import { Camera, Maximize2, ShieldCheck, Ticket } from "lucide-react";
import { useEffect } from "react";
import Button from "@/components/ui/Button";
import BatikPattern from "@/components/ui/BatikPattern";
import { useBoothStore } from "@/store/useBoothStore";
import { EventSettings } from "@/types";
import { recordVisitor } from "@/lib/stats";

export default function StartScreen({ settings }: { settings: EventSettings }) {
  const startNewSession = useBoothStore((s) => s.startNewSession);
  const queueNumber = useBoothStore((s) => s.queueNumber);
  useEffect(() => {
    recordVisitor();
  }, []);

  const toggleKiosk = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-red-700 via-red-600 to-red-800 text-white flex flex-col items-center justify-center px-6 py-10">
      <BatikPattern className="absolute inset-0 text-white" />
      <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent" />

      {settings.kioskModeEnabled && (
        <button
          onClick={toggleKiosk}
          aria-label="Mode layar penuh"
          className="absolute top-4 right-4 z-20 rounded-full bg-white/15 p-2.5 text-white/80 backdrop-blur hover:bg-white/25"
        >
          <Maximize2 size={18} />
        </button>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex w-full max-w-sm flex-col items-center text-center"
      >
        <div className="mb-3 flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-medium tracking-wide backdrop-blur">
          <Ticket size={14} />
          Nomor antrean berikutnya: <span className="font-bold">{queueNumber}</span>
        </div>

        <span className="text-6xl drop-shadow-sm">🇮🇩</span>

        <h1 className="font-display mt-4 text-3xl font-bold leading-tight drop-shadow-sm sm:text-4xl">
          {settings.eventTitle}
        </h1>

        <p className="font-shout mt-3 text-2xl text-amber-200 sm:text-3xl">
          {settings.eventSubtitle}
        </p>

        <div className="mt-5 flex flex-col items-center gap-1 text-sm text-white/85">
          <p className="font-medium">{settings.villageName}</p>
          <p>{settings.eventDate}</p>
        </div>

        <Button
          onClick={startNewSession}
          size="lg"
          variant="dark"
          className="mt-10 w-full !bg-white !text-red-700 hover:!bg-amber-50"
        >
          <Camera size={20} />
          Mulai Foto
        </Button>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-white/70">
          <ShieldCheck size={14} />
          Foto diproses langsung di browser kamu — tidak dikirim ke server
        </p>
      </motion.div>
    </div>
  );
}
