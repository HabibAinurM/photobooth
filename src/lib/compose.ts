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

  // Background - flat red like the image
  ctx.fillStyle = "#E41B23"; // Red background
  ctx.fillRect(0, 0, width, height);

  const pad = width * 0.08;

  // Header is empty in the requested image, but we reserve top padding
  const headerBottom = pad * 0.5; // Small padding at top
  const footerHeight = printSize === "strip" ? 130 : 250;
  const gap = width * 0.05;

  const images = await Promise.all(photos.map((p) => loadImage(p)));

  if (printSize === "strip") {
    const slotW = width - pad * 2;
    const availH = height - headerBottom - footerHeight;
    const slotH = (availH - gap * (images.length - 1)) / images.length;
    images.forEach((img, i) => {
      const y = headerBottom + i * (slotH + gap);
      // Draw white background block
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(pad - 4, y - 4, slotW + 8, slotH + 8);
      drawCoverImage(ctx, img, pad, y, slotW, slotH, 0);
    });
  } else {
    // 4R Layout
    const cols = 2;
    const rows = 3; // Fixed 3 rows to match the 6-photo layout
    const slotW = (width - pad * 2 - gap) / cols;
    const availH = height - headerBottom - footerHeight;
    const slotH = (availH - gap * (rows - 1)) / rows;
    
    // Draw empty white slots if there are not enough photos
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = pad + col * (slotW + gap);
      const y = headerBottom + row * (slotH + gap);
      
      // White border block
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(x - 8, y - 8, slotW + 16, slotH + 16);
      
      if (i < images.length) {
        drawCoverImage(ctx, images[i], x, y, slotW, slotH, 0);
      }
    }
  }

  // Draw custom graphical elements to match the image
  ctx.save();
  
  if (printSize === "4r") {
    // 1. MERDEKA!! Text Center Right
    ctx.save();
    ctx.translate(width - 280, height * 0.39);
    ctx.rotate(-5 * Math.PI / 180);
    ctx.textAlign = "center"; // Center it so it doesn't overflow right
    ctx.font = '900 75px "Plus Jakarta Sans", sans-serif';
    // Red shadow
    ctx.fillStyle = "#8B0000";
    ctx.fillText("MERDEKA!!", 6, 6);
    // White border
    ctx.lineWidth = 14;
    ctx.strokeStyle = "#FFFFFF";
    ctx.strokeText("MERDEKA!!", 0, 0);
    // Red text
    ctx.fillStyle = "#E41B23";
    ctx.fillText("MERDEKA!!", 0, 0);
    ctx.restore();

    // 3. Center logo 
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(width / 2, height * 0.38, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#E41B23";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.font = '900 40px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = "#E41B23";
    ctx.textAlign = "center";
    ctx.fillText("81", width / 2, height * 0.38 + 15);

    // 4. Semangat Merdeka Center Left
    ctx.save();
    ctx.translate(220, height * 0.62);
    ctx.rotate(-15 * Math.PI / 180);
    // Box
    ctx.fillStyle = "#991B1B";
    ctx.beginPath();
    ctx.roundRect(-180, -60, 360, 110, 20);
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 6;
    ctx.stroke();
    // Text
    ctx.fillStyle = "#FFFFFF";
    ctx.font = '900 40px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = "center";
    ctx.fillText("SEMANGAT", -10, -10);
    ctx.fillText("MERDEKA", -10, 35);
    // Flag
    ctx.font = "50px sans-serif";
    ctx.fillText("🇮🇩", 140, -15);
    ctx.restore();

    // 5. Starburst Bottom Right
    ctx.font = "120px sans-serif";
    ctx.fillText("💥", width - 120, height * 0.65);

    // 6. Smiley Bottom Left
    ctx.font = "130px sans-serif";
    ctx.fillText("😃", 140, height - footerHeight + 20);
  }
  
  ctx.restore();

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
  
  const titleSize = printSize === "strip" ? 26 : 56;
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `600 ${titleSize}px "Fraunces", serif`;
  ctx.fillText(`Dirgahayu Indonesia ke-81`, width / 2, footerTop + titleSize + 20);

  ctx.fillText(
    "Jatirejo Josjis",
    width / 2,
    footerTop + titleSize * 2.1 + 10
  );

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
