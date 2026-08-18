"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  FileDown,
  Home,
  MessageCircle,
  QrCode,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import Button from "@/components/ui/Button";
import { useBoothStore } from "@/store/useBoothStore";
import { recordDownload, recordSessionComplete } from "@/lib/stats";
import { EventSettings } from "@/types";

export default function DownloadScreen({ settings }: { settings: EventSettings }) {
  const { composedImage, printSize, frameId, queueNumber } = useBoothStore();
  const reset = useBoothStore((s) => s.reset);
  const goTo = useBoothStore((s) => s.goTo);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loggedDone, setLoggedDone] = useState(false);

  useEffect(() => {
    if (!composedImage) return;
    if (!loggedDone && frameId) {
      recordSessionComplete(frameId);
      setLoggedDone(true);
    }
    
    const uploadImage = async () => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            image: composedImage,
            filename: `photobooth-${queueNumber}-${Date.now()}.png`
          }),
        });

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          if (data.success && data.url) {
            setQrUrl(data.url);
          } else {
            throw new Error(data.error || "Gagal mengunggah foto");
          }
        } else {
          // Server returned HTML (usually 500 error page due to missing package/crash)
          throw new Error("Sistem server gagal (Error 500). Cek log terminal Anda.");
        }
      } catch (err: unknown) {
        setUploadError(err instanceof Error ? err.message : String(err));
        // Fallback to local blob URL if upload fails
        fetch(composedImage)
          .then((r) => r.blob())
          .then((blob) => setQrUrl(URL.createObjectURL(blob)))
          .catch(() => setQrUrl(null));
      } finally {
        setIsUploading(false);
      }
    };

    uploadImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [composedImage]);

  const fileBase = useMemo(
    () => `photobooth-hutri81-${queueNumber}`,
    [queueNumber]
  );

  const handleDownloadPng = () => {
    if (!composedImage) return;
    const a = document.createElement("a");
    a.href = composedImage;
    a.download = `${fileBase}.png`;
    a.click();
    recordDownload();
  };

  const handleDownloadPdf = () => {
    if (!composedImage) return;
    const isStrip = printSize === "strip";
    const pdfW = isStrip ? 2 : 4;
    const pdfH = 6;
    
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [pdfW, pdfH],
    });
    pdf.addImage(composedImage, "PNG", 0, 0, pdfW, pdfH);
    pdf.save(`${fileBase}.pdf`);
    recordDownload();
  };

  const handleDownloadPdfDouble = () => {
    if (!composedImage) return;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "in",
      format: [4, 6], // 4R Size
    });
    // Draw two 2x6 strips side-by-side on 4x6 inch canvas
    pdf.addImage(composedImage, "PNG", 0, 0, 2, 6);
    pdf.addImage(composedImage, "PNG", 2, 0, 2, 6);
    pdf.save(`${fileBase}-double-4r.pdf`);
    recordDownload();
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById("qr-canvas") as HTMLCanvasElement;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR-${fileBase}.png`;
    a.click();
  };

  const handleShareWhatsapp = async () => {
    if (!composedImage) return;
    recordDownload();
    try {
      const res = await fetch(composedImage);
      const blob = await res.blob();
      const file = new File([blob], `${fileBase}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: settings.eventTitle,
          text: `Hasil foto Semarak HUT RI 81 - ${settings.villageName}`,
        });
        return;
      }
    } catch {
      // fall through to link share
    }
    const text = encodeURIComponent(
      `Ini hasil foto photobooth HUT RI 81 di ${settings.villageName}! Downloadnya lewat browser lalu bagikan gambarnya ya 🇮🇩`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  return (
    <div className="min-h-dvh bg-krem px-5 py-8">
      <div className="mx-auto max-w-md">
        <button
          onClick={() => goTo("preview")}
          className="mb-4 flex items-center gap-1.5 text-sm font-medium text-merah-tua/70 hover:text-merah-tua"
        >
          <ArrowLeft size={16} /> Kembali
        </button>

        <h2 className="font-display text-2xl font-bold text-merah-tua">
          Hasil Kamu Siap!
        </h2>
        <p className="mt-1 text-sm text-stone-600">
          Nomor antrean {queueNumber} — simpan atau cetak hasil foto kamu.
        </p>

        <div className="mx-auto mt-5 max-w-[240px] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl">
          {composedImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={composedImage} alt="Hasil photobooth" className="w-full" />
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <Button onClick={handleDownloadPng} size="lg" className="w-full">
            <Download size={18} />
            Download PNG
          </Button>
          {printSize === "strip" ? (
            <>
              <Button
                onClick={handleDownloadPdfDouble}
                size="lg"
                className="w-full !bg-amber-600 hover:!bg-amber-700 text-white"
              >
                <FileDown size={18} />
                Cetak PDF (Double Strip di Kertas 4R)
              </Button>
              <Button
                onClick={handleDownloadPdf}
                variant="secondary"
                size="lg"
                className="w-full"
              >
                <FileDown size={18} />
                Cetak PDF (Single Strip 2×6 in)
              </Button>
            </>
          ) : (
            <Button
              onClick={handleDownloadPdf}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <FileDown size={18} />
              Cetak PDF (Foto 4R, 300 DPI)
            </Button>
          )}
          <Button
            onClick={handleShareWhatsapp}
            variant="secondary"
            size="lg"
            className="w-full !border-green-600/30 !text-green-700"
          >
            <MessageCircle size={18} />
            Share WhatsApp
          </Button>
        </div>

        {isUploading ? (
          <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-200 border-t-merah-tua mb-3"></div>
            <p className="text-sm font-medium text-stone-600">Sedang mengunggah ke Cloud...</p>
            <p className="text-xs text-stone-400 mt-1">Harap tunggu untuk memunculkan QR</p>
          </div>
        ) : uploadError ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-red-200 bg-red-50 p-4">
             <p className="text-sm font-semibold text-red-600">Upload ke Cloud Gagal</p>
             <p className="text-xs text-red-500 text-center mt-1">{uploadError}</p>
             <p className="text-[11px] text-stone-500 text-center mt-3">Menampilkan QR Lokal sementara (Hanya bisa di-scan dari browser perangkat ini).</p>
             {qrUrl && <div className="mt-4"><QRCodeCanvas id="qr-canvas" value={qrUrl} size={120} /></div>}
          </div>
        ) : qrUrl && (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white p-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-stone-500">
              <QrCode size={14} /> Scan untuk mengunduh foto
            </p>
            <QRCodeCanvas id="qr-canvas" value={qrUrl} size={120} />
            <button 
              onClick={handleDownloadQR}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-merah hover:text-merah-tua hover:underline"
            >
              <Download size={14} /> Unduh Gambar QR
            </button>
            <p className="mt-2 text-center text-[11px] text-stone-400">
              QR ini sekarang tertaut ke foto Anda di Google Drive.
            </p>
          </div>
        )}

        <Button
          onClick={reset}
          variant="ghost"
          size="lg"
          className="mt-8 w-full"
        >
          <Home size={18} />
          Selesai &amp; Kembali ke Awal
        </Button>
      </div>
    </div>
  );
}
