# Learning Path Berurutan & Pemisahan Materi — Design

Supersedes bagian dari `2026-11-25-ui-belajar-design.md` yang menyatakan aplikasi satu file dan level bisa dipilih bebas.

## Intent

Materi perlu mudah ditambah tanpa menyunting logika UI, dan perjalanan belajar perlu terasa seperti kursus: pembelajar dikenali dari nama, lalu menyelesaikan level dan topik secara berurutan. Semua keadaan tetap berada di browser tanpa server.

## Goals

- Memindahkan seluruh materi ke `lessons.js` yang dimuat sebagai classic script, sehingga `index.html` bisa tetap dibuka dengan double-click.
- Menambah topik: Pemula 5 (dari 2), Menengah 4 (dari 1), Lanjut 3 (dari 1). Isi tiap topik mengikuti aturan skill tutor tingkatnya.
- Mengunci level: Menengah terbuka setelah semua topik Pemula selesai; Lanjut terbuka setelah semua topik Menengah selesai.
- Mengunci topik: topik ke-2 dalam satu level terbuka setelah topik ke-1 selesai, dan seterusnya. Urutan ditentukan oleh urutan array di `lessons.js`.
- Modal nama wajib diisi pada kunjungan pertama; nama dipakai untuk menyapa dan bisa diubah lewat header.
- Menyimpan nama, preferensi, dan progres di `localStorage`.

## Non-goals

- Umpan balik AI, backend, sinkronisasi lintas perangkat, atau akun.
- Penguncian langkah di dalam satu topik (baca → cek jawaban → selesai) — pengguna boleh memilih urutan itu sendiri.
- `fetch()` ke `.json`, parser YAML, build step, npm, atau server produksi.
- Perubahan pada ketiga `SKILL.md` yang sudah terverifikasi.

## Constraints

- `index.html` tetap statis; `lessons.js` dimuat dengan `<script src="lessons.js"></script>` sebelum script aplikasi.
- `window.LESSONS` berisi tiga kunci level dengan `topics` berurutan; tiap topik memuat `id`, `title`, `items`, `prompt`, `answer`, `checks`.
- Kunci penyimpanan tetap `learn-english-progress-v1`.
- Bentuk progress diperluas menjadi `{ name, level, xp, streak, completedTopics, lastVisited, preferences }`.
- Level: `pemula`, `menengah`, `mahir`. Kunci topik: `level:topik`.
- Materi level `mahir` tetap seluruhnya bahasa Inggris, termasuk judul topik, catatan, dan checklist.

## Approaches

1. **`lessons.js` classic script** — dipilih: pemisahan file nyata, tanpa `fetch`/parser, tetap bisa double-click. Trade-off: data ditulis sebagai object JS, bukan JSON murni.
2. `lessons.json` + `fetch()` — ditolak: gagal pada `file://` karena CORS; butuh server lokal atau hosting.
3. JSON dalam `<script type="application/json">` — ditolak: bukan pemisahan file nyata.

## Design

### Status terbuka (derived, bukan disimpan)

- `isTopicUnlocked(level, index)`: `true` untuk index 0, atau topik sebelumnya dalam level itu ada di `completedTopics`.
- `isLevelUnlocked(level)`: `true` untuk Pemula; Menengah jika semua topik Pemula selesai; Mahir jika semua topik Menengah selesai.
- Status dihitung ulang dari `completedTopics` setiap render. Flag tersimpan yang bertentangan tidak dipercaya, sehingga data lama/rusak tidak bisa membuka level terkunci.
- Tombol terkunci memakai `disabled`, label kunci, dan `aria-disabled="true"`.

### Modal nama

- Muncul otomatis bila `progress.name` kosong; tidak bisa ditutup sebelum nama diisi.
- Input wajib non-empty; disimpan ke `progress.name` dan `progressStore.save()`.
- Header menampilkan sapaan memakai nama dan tombol "Ubah nama" untuk membuka modal lagi.
- Modal ditutup dengan tombol "Mulai belajar".

### Navigasi awal & perpindahan

- Saat muat: pilih level terbuka tertinggi, lalu topik pertama yang belum selesai di level itu.
- Bila level tersimpan terkunci karena data lama, jatuhkan ke level terbuka tertinggi.
- Memilih topik atau level hanya bisa dilakukan pada opsi yang terbuka.

### Progres

- `markDone()` tetap idempoten: topik baru menambah 10 XP, memasukkan `level:topik`, memperbarui streak dan `lastVisited`.
- Menyelesaikan topik terakhir suatu level otomatis membuka level berikutnya lewat perhitungan status di atas.
- `preferences` disimpan sebagai objek; saat ini belum ada field selain nama, sehingga objek kosong disiapkan untuk kebutuhan berikutnya.

### Materi

- Pemula: + Di restoran, Keluarga, Waktu dan jam.
- Menengah: + Membuat janji, Bercerita tentang pengalaman, Meminta bantuan di kantor.
- Lanjut: + Negotiating scope, Academic hedging.
- Tiap topik: tiga item (pemula disertai cara baca; menengah disertai idiom/konteks; lanjut Inggris penuh dengan register), satu prompt, satu kunci jawaban statis, dan checklist sesuai level.

## What's left to builder

- Membuat `lessons.js` dan memindahkan `LESSONS` dari `index.html`.
- Menambah logika modal nama, derived unlock, dan inisialisasi level/topik pada `index.html`.
- Memperbarui `tests/ui-check.mjs` untuk membaca kedua file dan memeriksa kontrak baru.
- Mengulang verifikasi browser: modal nama, urutan topik, kunci level, dan persistensi setelah reload.
