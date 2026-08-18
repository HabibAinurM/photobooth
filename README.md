# Photobooth HUT RI 81 — Desa Jatirejo

Aplikasi photobooth digital untuk acara Semarak Kemerdekaan, dibangun dengan Next.js 15 + React 19 + Tailwind CSS 4 + TypeScript, sesuai PRD.

## Fitur

- **Halaman awal** bertema merah-putih dengan nomor antrean digital otomatis.
- **Pilih frame**: 4 frame utama (Merah Putih Classic, Semarak Kemerdekaan, Lomba 17 Agustus, Gold Edition) + 4 template khusus lomba (Balap Karung, Tarik Tambang, Makan Kerupuk, Jalan Sehat).
- **Pilih ukuran cetak**: Photo Strip (2×6 in) atau Foto 4R (10×15 cm), diekspor 300 DPI.
- **Kamera** (`react-webcam`) dengan hitung mundur 3-2-1 dan efek flash, mengambil 4 foto berurutan dengan progress indicator.
- **Preview & edit**: ganti frame, tambah nama, tambah stiker, ulangi satu/semua foto — hasil disusun otomatis lewat HTML5 Canvas.
- **Unduh**: PNG, PDF siap cetak (`jspdf`), share ke WhatsApp (Web Share API dengan fallback link), dan **QR Code** (`qrcode.react`) untuk mengunduh cepat di perangkat yang sama.
- **Mode Kiosk**: tombol layar penuh untuk laptop yang terhubung ke printer foto di lokasi acara (aktifkan lewat Admin).
- **Dashboard Admin** (`/admin`, password demo: `hutri81`): statistik foto/download/pengunjung hari ini, frame terfavorit, ubah tema acara (judul, subjudul, nama desa, tanggal), aktif/nonaktifkan stiker & mode kiosk, serta upload pratinjau frame baru.

## Menjalankan secara lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000` untuk alur photobooth, dan `http://localhost:3000/admin` untuk dashboard admin.

> Browser akan meminta izin akses kamera. Jalankan di `https://` (atau `localhost`) karena API kamera browser mensyaratkan koneksi aman.

## Build produksi & deploy

```bash
npm run build
npm start
```

Proyek ini siap di-deploy ke **Vercel** — cukup hubungkan repo lalu deploy, tanpa konfigurasi tambahan.

## Catatan implementasi & batasan versi ini

- Semua pemrosesan foto terjadi **di browser** (privasi terjaga, tidak ada foto yang dikirim ke server).
- Statistik dashboard admin dan pengaturan tema disimpan di `localStorage` perangkat masing-masing — untuk penggunaan multi-perangkat/multi-panitia yang tersinkronisasi, tambahkan backend (mis. database + API routes Next.js).
- QR Code hasil foto mengarah ke *object URL* browser sehingga hanya berfungsi untuk mengunduh ulang di perangkat/sesi yang sama. Untuk berbagi lintas perangkat (scan dari HP tamu), perlu penyimpanan file di server/object storage (mis. Vercel Blob, S3).
- Upload "frame baru" di admin saat ini hanya pratinjau sisi klien (belum menambahkan frame baru secara permanen ke aplikasi) — implementasi penuh memerlukan penyimpanan gambar & daftar frame dinamis dari server.
- Galeri hasil peserta belum tersedia karena memerlukan penyimpanan server.

## Struktur proyek

```
src/
  app/
    page.tsx           # Alur utama booth (state machine langkah)
    admin/page.tsx      # Dashboard admin
    layout.tsx, globals.css
  components/
    steps/               # StartScreen, FrameSelectScreen, CameraScreen, PreviewScreen, DownloadScreen
    ui/                   # Button, BatikPattern
  lib/
    frames.ts             # Definisi frame & stiker
    compose.ts             # Penyusun canvas hasil akhir
    settings.ts, stats.ts   # Pengaturan & statistik berbasis localStorage
  store/
    useBoothStore.ts        # Zustand store untuk alur sesi foto
  types/index.ts
```