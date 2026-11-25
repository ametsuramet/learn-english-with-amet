# Dark Theme — Design

## Intent

Menambahkan mode gelap ke UI belajar supaya nyaman dipakai di kondisi cahaya redup,
tanpa mengubah cara kerja materi, latihan, atau progress.

## Goals

- Default mengikuti preferensi sistem operasi (`prefers-color-scheme`).
- Pengguna bisa mengambil alih lewat tombol ikon di header.
- Pilihan pengguna bertahan setelah halaman dimuat ulang.
- Tetap satu file `index.html`, tanpa build step/server/npm.

## Non-goals

- Tidak mengubah isi `lessons.js`, jalur unlock, atau aturan tutor.
- Tidak mengganti palet shadcn secara menyeluruh; cukup token warna yang sudah ada.
- Tidak menambahkan pengaturan warna buatan (custom accent picker).

## Constraints

- Tailwind CDN dipakai lewat `<script>` yang sudah ada; tidak bisa memakai `@media` Tailwind bawaan
  karena konfigurasi `darkMode` harus di-set di `tailwind.config`.
- Token warna saat ini berupa CSS variables HSL di `:root` dan dipetakan di `tailwind.config`.
- State tersimpan di objek `progress.preferences` pada kunci `learn-english-progress-v1`.
- Ikon memakai Font Awesome CDN (link CSS di `<head>`), bukan library JS/module.

## Approaches

1. **Ionicons CDN** — ditolak: butuh script `module`/`nomodule` dan berisiko saat `file://`.
2. **Inline SVG** — ditolak: bukan library ikon yang diminta pengguna.
3. **Font Awesome CDN + Tailwind `darkMode: 'class'` + `preferences.theme`** — dipilih pengguna:
   satu link CSS, satu class `dark` di `<html>`, dan state yang bisa di-override.

## Design

### Token dan konfigurasi

- `tailwind.config` ditambah `darkMode: "class"`.
- `:root` tetap berisi nilai terang seperti sekarang.
- `.dark` mendefinisikan ulang `--background`, `--foreground`, `--card`, `--muted`,
  `--primary`, `--border` dengan nilai HSL gelap yang kontras.
- Kelas hard-coded `text-slate-500/600/400` dan `text-red-600` diberi varian `dark:`
  supaya teks tetap terbaca di latar gelap. `text-white` pada tombol primary tetap dipertahankan.

### State dan tombol

- `preferences.theme` bernilai `"system"` (default bila belum ada), `"light"`, atau `"dark"`.
- Fungsi `applyTheme()` menentukan mode efektif:
  - `system` → ikuti `window.matchMedia("(prefers-color-scheme: dark)").matches`;
  - `light`/`dark` → pakai nilai tersebut.
- Fungsi menambah/menghapus class `dark` pada `document.documentElement`, lalu mengubah ikon,
  `title`, dan `aria-label` tombol agar sesuai mode efektif.
- Tombol di header (sebelah "Ubah nama") bersiklus `system → light → dark → system`.
- `matchMedia` dipasang listener; bila OS berubah dan mode = `system`, tema langsung mengikuti.
- Setiap klik tombol menyimpan `preferences.theme` lewat `progressStore.save(progress)`.
- Reset progres mengembalikan tema ke `system` karena seluruh `preferences` ikut terhapus.

### Ikon Font Awesome

- Link CSS Font Awesome Free di `<head>`.
- Ikon: `fa-circle-half-stroke` untuk system, `fa-sun` untuk light, `fa-moon` untuk dark.
- Tombol tetap memakai utility Tailwind yang sama seperti "Ubah nama".

## What's left to builder

- Tulis tes kontrak tema (gagal lebih dulu) untuk: `darkMode: "class"`, blok `.dark`,
  tombol tema, `preferences.theme`, dan pemakaian Font Awesome.
- Ubah `index.html` sesuai desain ini.
- Jalankan seluruh tes, commit, push, deploy, dan verifikasi halaman live.
