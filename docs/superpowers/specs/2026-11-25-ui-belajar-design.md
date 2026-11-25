# UI Belajar Bahasa Inggris — Design

## Intent

Menyediakan permukaan belajar berbasis browser untuk project ini: pengguna memilih level,
membuka materi, mengerjakan satu latihan, dan melihat progres yang tersimpan lokal di browser.
UI menjadi pelengkap tiga skill tutor, bukan pengganti percakapan tutor.

## Goals

- Satu halaman statis yang bisa dibuka langsung dari file sistem.
- Tampilan memakai Tailwind CDN dengan token dan pola komponen ala shadcn/ui.
- Tiga level tersedia: A1–A2, B1–B2, C1–C2, dengan isi materi mengikuti aturan skill masing-masing.
- Progress bertahan setelah halaman dimuat ulang.
- Tidak ada build step, tidak ada server, tidak ada dependensi npm.

## Non-goals

- Umpan balik AI di browser (mustahil tanpa backend/API; tutor tetap lewat skill).
- Sinkronisasi lintas perangkat atau akun.
- Kurikulum lengkap, bank soal besar, atau analitik mendalam.
- Instalasi skill global atau perubahan pada tiga `SKILL.md` yang sudah terverifikasi.

## Constraints

- Satu file aplikasi: `index.html` di root project. File uji boleh berada di `tests/`.
- Tailwind CDN dimuat lewat tag `<script>`; token warna/radius didefinisikan sebagai CSS variables.
- Komponen kartu, tombol, badge, dan progress bar ditulis dengan utility Tailwind, meniru pola shadcn/ui tanpa paket shadcn.
- Progress disimpan di `localStorage` di balik objek `progressStore`.
- Kunci penyimpanan: `learn-english-progress-v1`.
- Bentuk progress: `{ level, xp, streak, completedTopics, lastVisited }`.

## Approaches

1. Vite + React + shadcn/ui — ditolak pengguna: butuh build step dan npm.
2. **Satu file HTML + Tailwind CDN + komponen bergaya shadcn** — dipilih pengguna: langsung dibuka, tanpa build.
3. Next.js + shadcn — ditolak: server tidak diperlukan untuk progress lokal.

## Design

### Struktur halaman

- Header: judul project, pemilih level (tiga tombol), ringkasan XP/streak/topik selesai.
- Panel materi: daftar topik untuk level aktif; memilih topik menampilkan kartu materi.
- Kartu materi mengikuti level:
  - Pemula: kalimat Inggris, arti Indonesia, cara baca.
  - Menengah: contoh bilingual, idiom/phrasal verb, konteks.
  - Lanjut: contoh Inggris penuh, label register.
- Panel latihan: satu prompt, textarea, kunci jawaban, checklist penilaian per level, tombol "Saya paham".
- Panel progres: daftar topik selesai, tombol reset, tombol ekspor JSON.

### Perilaku

- Mengganti level menyimpan `level` ke `progressStore` dan merender daftar topik baru.
- "Saya paham" menandai topik selesai, menambah XP, dan memperbarui `lastVisited`.
- `streak` dihitung dari hari kunjungan berurutan berdasarkan `lastVisited`.
- Ekspor JSON mengunduh isi `progressStore`; reset menghapus kunci lalu merender ulang.
- Umpan balik latihan berupa kunci jawaban dan checklist statis; tidak ada pemanggilan model.

## What's left to builder

- Menulis tes struktural yang gagal sebelum `index.html` ada.
- Membangun `index.html` minimal yang memenuhi kontrak tersebut.
- Memverifikasi interaksi nyata di browser, termasuk persistensi setelah reload.
