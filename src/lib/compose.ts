import { EventSettings, FrameDef, PrintSize, StickerId } from "@/types";
import { STICKERS } from "@/lib/frames";

export interface ComposeOptions {
  frame: FrameDef;
  printSize: PrintSize;
  photos: string[];
  name: string;
  stickers: StickerId[];
  settings: EventSettings;
}

const SIZES: Record<PrintSize, { width: number; height: number }> = {
  strip: { width: 600, height: 1800 },
  "4r": { width: 1200, height: 1800 },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const imgRatio = img.width / img.height;
  const boxRatio = w / h;
  let drawW = w;
  let drawH = h;
  if (imgRatio > boxRatio) {
    drawH = h;
    drawW = h * imgRatio;
  } else {
    drawW = w;
    drawH = w / imgRatio;
  }
  const dx = x + (w - drawW) / 2;
  const dy = y + (h - drawH) / 2;
  ctx.drawImage(img, dx, dy, drawW, drawH);
  ctx.restore();

  ctx.save();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  roundRect(ctx, x, y, w, h, radius);
  ctx.stroke();
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function composeResult({
  frame,
  printSize,
  photos,
  name,
  stickers,
  settings,
}: ComposeOptions): Promise<string> {
  const { width, height } = SIZES[printSize];
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak didukung di browser ini");

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, frame.colors.background);
  grad.addColorStop(1, frame.colors.backgroundAlt ?? frame.colors.background);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Outer border
  const borderW = width * 0.03;
  ctx.strokeStyle = frame.colors.border;
  ctx.lineWidth = borderW;
  ctx.strokeRect(borderW / 2, borderW / 2, width - borderW, height - borderW);

  const pad = width * 0.08;

  // Header
  const titleSize = printSize === "strip" ? 26 : 40;
  ctx.textAlign = "center";
  ctx.fillStyle = frame.colors.text;
  ctx.font = `700 ${titleSize}px "Fraunces", serif`;
  ctx.fillText(`DIRGAHAYU RI 81`, width / 2, pad + titleSize);

  ctx.fillText(
    "Jatirejo Josjis",
    width / 2,
    pad + titleSize * 2.2
  );

  const headerBottom = pad + titleSize * 2.2 + 28;
  const footerHeight = printSize === "strip" ? 130 : 150;
  const gap = width * 0.05;

  const images = await Promise.all(photos.map((p) => loadImage(p)));

  if (printSize === "strip") {
    const slotW = width - pad * 2;
    const availH = height - headerBottom - footerHeight;
    const slotH = (availH - gap * (images.length - 1)) / images.length;
    images.forEach((img, i) => {
      const y = headerBottom + i * (slotH + gap);
      drawCoverImage(ctx, img, pad, y, slotW, slotH, 14);
    });
  } else {
    const cols = 2;
    const rows = Math.ceil(images.length / cols);
    const slotW = (width - pad * 2 - gap) / cols;
    const availH = height - headerBottom - footerHeight;
    const slotH = (availH - gap * (rows - 1)) / rows;
    images.forEach((img, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (slotW + gap);
      const y = headerBottom + row * (slotH + gap);
      drawCoverImage(ctx, img, x, y, slotW, slotH, 18);
    });
  }

  // Stickers (decorative corners)
  const activeStickers = STICKERS.filter((s) => stickers.includes(s.id));
  const stickerSize = printSize === "strip" ? 28 : 42;
  ctx.font = `${stickerSize}px sans-serif`;
  ctx.textAlign = "left";
  activeStickers.forEach((s, i) => {
    const positions: [number, number][] = [
      [pad * 0.4, headerBottom - 6],
      [width - pad * 0.4 - stickerSize, headerBottom - 6],
      [pad * 0.4, height - footerHeight - stickerSize * 0.4],
      [width - pad * 0.4 - stickerSize, height - footerHeight - stickerSize * 0.4],
    ];
    const pos = positions[i % positions.length];
    ctx.fillText(s.emoji, pos[0], pos[1]);
  });

  // Footer
  const footerTop = height - footerHeight;
  ctx.textAlign = "center";
  const nameSize = printSize === "strip" ? 16 : 22;
  if (name.trim()) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `600 ${nameSize}px "Plus Jakarta Sans", sans-serif`;
    ctx.fillText(name.trim(), width / 2, footerTop + nameSize + 6);
  }

  const infoSize = printSize === "strip" ? 14 : 19;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `500 ${infoSize}px "Plus Jakarta Sans", sans-serif`;
  const infoY = footerTop + (name.trim() ? nameSize + 30 : 24);
  ctx.fillText(settings.villageName, width / 2, infoY);
  ctx.fillText(settings.eventDate, width / 2, infoY + infoSize + 6);

  // Watermark
  const wmSize = printSize === "strip" ? 9 : 12;
  ctx.font = `400 ${wmSize}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillStyle = "rgba(245, 245, 245, 0.35)";
  ctx.fillText(
    `Semarak HUT RI Ke-81 ${settings.villageName} – ${settings.eventDate}`,
    width / 2,
    height - 12
  );

  return canvas.toDataURL("image/png", 1.0);
}

export function getCanvasSize(printSize: PrintSize) {
  return SIZES[printSize];
}
