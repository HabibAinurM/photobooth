"use client";

import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Button from "@/components/ui/Button";
import { useBoothStore } from "@/store/useBoothStore";
import { FRAMES } from "@/lib/frames";
import { PrintSize, FrameDef } from "@/types";

const SIZE_OPTIONS: { id: PrintSize; label: string; sub: string }[] = [
  { id: "strip", label: "Photo Strip", sub: "2 × 6 inci" },
  { id: "4r", label: "Foto 4R", sub: "10 × 15 cm" },
];

export default function FrameSelectScreen() {
  const frameId = useBoothStore((s) => s.frameId);
  const printSize = useBoothStore((s) => s.printSize);
  const selectFrame = useBoothStore((s) => s.selectFrame);
  const setPrintSize = useBoothStore((s) => s.setPrintSize);
  const goTo = useBoothStore((s) => s.goTo);

  const utama = FRAMES.filter((f) => f.category === "utama");
  const lomba = FRAMES.filter((f) => f.category === "lomba");
  
  const selectedFrame = FRAMES.find((f) => f.id === frameId);

  return (
    <div className="min-h-dvh bg-krem px-5 py-8">
      <div className="mx-auto max-w-lg">
        <button
          onClick={() => goTo("start")}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-merah-tua/70 hover:text-merah-tua"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <h2 className="font-display text-2xl font-bold text-merah-tua">
          Pilih Frame
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Pilih bingkai yang sesuai dengan suasana acara kamu.
        </p>

        {selectedFrame ? (
          <FramePreview frame={selectedFrame} printSize={printSize} />
        ) : (
          <div className="my-6 flex justify-center items-center h-[200px] rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/50">
            <p className="text-sm font-medium text-stone-400">Pilih frame untuk melihat preview</p>
          </div>
        )}

        <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Frame Utama
        </p>
        <div className="grid grid-cols-2 gap-3">
          {utama.map((frame) => (
            <FrameCard
              key={frame.id}
              active={frameId === frame.id}
              swatch={frame.swatch}
              emoji={frame.emoji}
              name={frame.name}
              onClick={() => selectFrame(frame.id)}
            />
          ))}
        </div>

        <p className="mt-6 mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Template Lomba 17-an
        </p>
        <div className="grid grid-cols-2 gap-3">
          {lomba.map((frame) => (
            <FrameCard
              key={frame.id}
              active={frameId === frame.id}
              swatch={frame.swatch}
              emoji={frame.emoji}
              name={frame.name}
              onClick={() => selectFrame(frame.id)}
            />
          ))}
        </div>

        <p className="mt-8 mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Ukuran Cetak
        </p>
        <div className="grid grid-cols-2 gap-3">
          {SIZE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPrintSize(opt.id)}
              className={`rounded-2xl border-2 px-4 py-3 text-left transition ${
                printSize === opt.id
                  ? "border-merah bg-red-50"
                  : "border-stone-200 bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-merah-tua">{opt.label}</p>
              <p className="text-xs text-stone-500">{opt.sub}</p>
            </button>
          ))}
        </div>

        <Button
          onClick={() => goTo("camera")}
          disabled={!frameId}
          size="lg"
          className="mt-8 w-full"
        >
          Lanjut ke Kamera
          <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}

function FrameCard({
  active,
  swatch,
  name,
  onClick,
}: {
  active: boolean;
  swatch: string;
  name: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border-2 p-3 text-left transition ${
        active ? "border-merah ring-2 ring-merah/30" : "border-stone-200"
      }`}
    >
      <div
        className={`mb-2 h-16 rounded-xl bg-gradient-to-br ${swatch}`}
      />
      <p className="text-xs font-semibold text-merah-tua">{name}</p>
      {active && (
        <span className="absolute right-2 top-2 rounded-full bg-merah p-1 text-white">
          <Check size={12} />
        </span>
      )}
    </motion.button>
  );
}

function FramePreview({ frame, printSize }: { frame: FrameDef; printSize: PrintSize }) {
  const isStrip = printSize === "strip";
  
  return (
    <div className="my-6 flex justify-center">
      <motion.div 
        key={frame.id + printSize}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="shadow-xl overflow-hidden flex flex-col transition-all duration-300"
        style={{
          width: isStrip ? '120px' : '220px',
          height: isStrip ? '360px' : '330px',
          background: `linear-gradient(to bottom, ${frame.colors.background}, ${frame.colors.backgroundAlt || frame.colors.background})`,
          border: `4px solid ${frame.colors.border}`,
          borderRadius: '8px',
          padding: isStrip ? '10px' : '14px',
        }}
      >
        <div className="text-center shrink-0 mb-2">
           <div style={{ color: frame.colors.text, fontSize: isStrip ? '10px' : '15px', fontWeight: 800, lineHeight: 1.2, fontFamily: '"Fraunces", serif' }}>
             DIRGAHAYU RI 81
           </div>
           <div style={{ color: frame.colors.text, fontSize: isStrip ? '10px' : '15px', fontWeight: 800, lineHeight: 1.2, fontFamily: '"Fraunces", serif', marginTop: '2px' }}>
             Jatirejo Josjis
           </div>
        </div>

        <div 
          className="flex-1 flex gap-1.5" 
          style={{ 
            flexDirection: isStrip ? 'column' : 'row', 
            flexWrap: isStrip ? 'nowrap' : 'wrap',
            alignContent: 'stretch'
          }}
        >
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className="bg-black/10 relative overflow-hidden flex items-center justify-center" 
              style={{ 
                border: '2px solid rgba(255,255,255,0.9)', 
                borderRadius: '6px',
                flex: isStrip ? '1 1 0' : '1 1 45%',
                minHeight: isStrip ? 0 : '45%' 
              }}
            >
               <span className="text-black/20 text-xs">📷</span>
            </div>
          ))}
        </div>

        <div className="text-center shrink-0 mt-3">
           <div style={{ color: '#FFFFFF', fontSize: isStrip ? '7px' : '9px', fontWeight: 600 }}>
             Nama Kamu
           </div>
           <div style={{ color: '#FFFFFF', fontSize: isStrip ? '6px' : '8px', marginTop: '2px' }}>
             Desa & Tanggal
           </div>
        </div>
      </motion.div>
    </div>
  );
}
