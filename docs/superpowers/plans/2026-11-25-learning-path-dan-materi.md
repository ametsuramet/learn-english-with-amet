# Learning Path Berurutan & Pemisahan Materi Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memisahkan materi ke `lessons.js`, memperbanyak topik, dan memaksa pembelajar menyelesaikan level serta topik secara berurutan setelah mengisi nama di modal.

**Architecture:** Materi menjadi file data statis yang dimuat sebagai classic script, sehingga `index.html` tetap bisa dibuka lewat `file://` tanpa `fetch`. Status terbuka tidak disimpan sebagai flag, melainkan dihitung ulang dari `completedTopics` setiap render; modal nama dan progres tetap memakai satu kunci `localStorage`.

**Tech Stack:** HTML statis, Tailwind CDN, JavaScript vanilla, Node built-in `assert`, Playwright (alat browser eksekutor).

**Spec:** `docs/superpowers/specs/2026-11-25-learning-path-dan-pemisahan-materi-design.md`

## Global Constraints

- `index.html` tetap statis; `lessons.js` dimuat dengan `<script src="lessons.js"></script>` sebelum script aplikasi.
- `window.LESSONS` berisi tiga kunci level dengan `topics` berurutan; tiap topik memuat `id`, `title`, `items`, `prompt`, `answer`, `checks`.
- Kunci penyimpanan tetap `learn-english-progress-v1`.
- Bentuk progress: `{ name, level, xp, streak, completedTopics, lastVisited, preferences }`.
- Level: `pemula`, `menengah`, `mahir`. Kunci topik: `level:topik`.
- Materi level `mahir` seluruhnya bahasa Inggris, termasuk judul topik, catatan, dan checklist.
- Tanpa `fetch()`, YAML, server produksi, build step, atau npm.

## Review Focus

- Pembelajar baru tanpa nama → modal muncul dan tidak bisa ditutup sampai nama valid diisi (Task 2, Playwright + `tests/path-check.mjs`).
- Topik ke-2 diklik sebelum topik ke-1 selesai → tidak berpindah; tombol dalam keadaan terkunci (Task 2, Playwright).
- Level Menengah diklik sebelum semua topik Pemula selesai → tidak berpindah; tombol terkunci (Task 2, Playwright).
- Data lama/rusak mengklaim level Mahir terbuka → halaman tetap mengunci dan jatuh ke level terbuka tertinggi (Task 2, Playwright dengan injeksi `localStorage`).
- Setelah reload → nama, XP, topik selesai, dan status kunci tetap sesuai urutan (Task 2, Playwright).

---

### Task 1: Pemisahan dan perluasan materi

**Files:**
- Create: `lessons.js`
- Modify: `index.html`
- Modify: `tests/ui-check.mjs`

**Interfaces:**
- Consumes: spec desain dan daftar topik di bawah.
- Produces: `window.LESSONS` dengan tiga level dan 12 topik berurutan; `index.html` memuat file itu dan tidak lagi mendefinisikan `LESSONS` secara inline.
- ID topik tetap: `belanja`, `sapaan`, `restoran`, `keluarga`, `waktu` (Pemula); `pendapat`, `janji`, `pengalaman`, `kantor` (Menengah); `proposal`, `negotiating-scope`, `academic-hedging` (Mahir).

- [ ] **Step 1: Perluas tes struktural agar menuntut file materi terpisah**

Ubah `tests/ui-check.mjs` sehingga membaca `index.html` dan `lessons.js`, lalu memeriksa:
- `index.html` memuat `<script src="lessons.js"></script>` dan **tidak** memuat `const LESSONS = {`.
- Seluruh ID UI lama tetap ada (`level-pemula`, `level-menengah`, `level-mahir`, `topic-list`, `lesson-card`, `exercise-input`, `check-answer`, `feedback`, `progress-xp`, `progress-streak`, `progress-topics`, `mark-done`, `reset-progress`, `export-progress`), beserta `learn-english-progress-v1` dan `progressStore`.
- `lessons.js` memuat `window.LESSONS = {`, ketiga kunci level, dan tepat 12 kemunculan `id: "`.
- Judul topik berikut hadir persis di `lessons.js`: `Belanja di supermarket`, `Sapaan sederhana`, `Di restoran`, `Keluarga`, `Waktu dan jam`, `Menyatakan pendapat`, `Membuat janji`, `Bercerita tentang pengalaman`, `Meminta bantuan di kantor`, `Raising objections tactfully`, `Negotiating scope`, `Academic hedging`.
- Bagian `mahir` tidak memuat `Arti:`, `cara baca`, `dengan`, atau `untuk`.

- [ ] **Step 2: Jalankan tes untuk melihat kegagalan**

Run: `node tests/ui-check.mjs`
Expected: FAIL karena `lessons.js` belum ada.

- [ ] **Step 3: Buat `lessons.js` dan ubah `index.html` agar memuatnya**

Buat `lessons.js` berisi `window.LESSONS = { pemula: {...}, menengah: {...}, mahir: {...} }` dengan urutan topik seperti pada Interfaces. Salin apa adanya empat topik yang sudah ada (`belanja`, `sapaan`, `pendapat`, `proposal`) dari blok `LESSONS` di `index.html`, lalu tambahkan delapan topik baru.

Bentuk tiap topik: `id` (string), `title` (string), `items` (array), `prompt` (string), `answer` (string statis), `checks` (array of string). Aturan isi:
- Pemula: tiap item `{ en, meaning, say }`; `checks` berisi lima poin bahasa Indonesia sesuai aturan apresiasi → bagian benar → perbaikan → versi natural → satu latihan.
- Menengah: tiap item `{ en, meaning, note }`; `checks` berisi lima poin dengan label `Perbaikan Grammar`, `Versi Lebih Natural`, `Penjelasan Singkat`, kosakata/idiom, dan pertanyaan terbuka.
- Mahir: tiap item `{ en, meaning: "", note }`; seluruh teks Inggris; `checks` berisi lima poin dengan label `Precision & Style`, `Collocations & Idiomatic Expressions`, `Subtle Errors`, register, dan paraphrase.

Pada `index.html`, hapus blok `const LESSONS = {...}` dan tambahkan `<script src="lessons.js"></script>` tepat sebelum `<script>` aplikasi. Kode aplikasi tetap memakai variabel global `LESSONS`.

- [ ] **Step 4: Jalankan tes sampai lolos**

Run: `node tests/ui-check.mjs`
Expected: PASS. Perbaiki `lessons.js` atau `index.html`, bukan tes.

- [ ] **Step 5: Commit**

```bash
git add lessons.js index.html tests/ui-check.mjs
git commit -m "feat: separate and expand lesson content"
```

### Task 2: Modal nama dan learning path berurutan

**Files:**
- Modify: `index.html`
- Create: `tests/path-check.mjs`

**Interfaces:**
- Consumes: `window.LESSONS` dari Task 1 dan `progressStore` yang sudah ada.
- Produces: `isTopicUnlocked(level, index)`, `isLevelUnlocked(level)`, `highestUnlockedLevel()`, `firstIncompleteTopic(level)`; ID baru `name-modal`, `name-input`, `name-submit`, `name-error`, `greeting`, `edit-name`.
- Progress yang dibaca/ditulis: `{ name, level, xp, streak, completedTopics, lastVisited, preferences }`.

- [ ] **Step 1: Tulis tes struktural yang gagal**

Buat `tests/path-check.mjs` dengan Node `assert` yang membaca `index.html` dan memeriksa:
- Keenam ID baru di atas hadir sebagai `id="<nama>"`.
- Fungsi `isTopicUnlocked`, `isLevelUnlocked`, `highestUnlockedLevel`, `firstIncompleteTopic` didefinisikan sebagai `function <nama>`.
- `progressStore.empty()` memuat `name: ""` dan `preferences: {}`.
- Tidak ada `fetch(` di `index.html`.

- [ ] **Step 2: Jalankan tes untuk melihat kegagalan**

Run: `node tests/path-check.mjs`
Expected: FAIL karena ID dan fungsi belum ada.

- [ ] **Step 3: Implementasi modal dan status terbuka di `index.html`**

Perluas `progressStore.empty()` dan `progressStore.load()`: `name` harus string (kosong jika bukan), `preferences` harus objek (kosong jika bukan). Biarkan `save()` dan `clear()` apa adanya.

Tambahkan markup modal overlay dengan ID di Interfaces: input teks, tombol submit, dan elemen error yang sembunyi jika tidak ada error. Tambahkan `<span id="greeting">` dan tombol `<button id="edit-name">` di header.

Terapkan fungsi dengan kontrak ini:
- `isTopicUnlocked(level, index)`: `true` jika `index === 0`; selain itu `true` jika `completedTopics` memuat `level:id` topik pada `index - 1` dari `LESSONS[level].topics`.
- `isLevelUnlocked(level)`: `true` untuk `pemula`; untuk level lain, `true` jika semua topik level sebelumnya ada di `completedTopics`. Urutan level: `pemula`, `menengah`, `mahir`.
- `highestUnlockedLevel()`: level terakhir dalam urutan yang lolos `isLevelUnlocked`.
- `firstIncompleteTopic(level)`: topik pertama di level itu yang belum ada di `completedTopics`, atau topik terakhir jika semuanya selesai.

Ubah render dan aksi:
- `renderLevels()` menandai level terkunci dengan `disabled` dan `aria-disabled="true"`.
- `renderTopics()` menandai topik terkunci dengan `disabled` dan `aria-disabled="true"`; tombol tidak memasang handler yang mengubah topik saat terkunci.
- `selectLevel(level)` mengabaikan level yang terkunci.
- `markDone()` hanya berjalan pada topik yang terbuka, tetap idempoten, memberi 10 XP, dan menyimpan `level:id`.
- Saat inisialisasi: jika `name` kosong, tampilkan modal; pilih `highestUnlockedLevel()` sebagai level aktif bila level tersimpan terkunci; pilih `firstIncompleteTopic(level)` sebagai topik aktif; lalu `renderAll()`.
- Submit modal: `trim()` input; jika kosong, tampilkan `name-error` dan biarkan modal terbuka; jika valid, simpan `progress.name`, tutup modal, perbarui `greeting`. Tombol `edit-name` membuka modal lagi dengan nama saat ini.

- [ ] **Step 4: Jalankan tes struktural sampai lolos**

Run: `node tests/path-check.mjs`
Expected: PASS.

- [ ] **Step 5: Verifikasi perilaku di browser**

Jalankan server lokal sementara (`python3 -m http.server 8765 --bind 127.0.0.1`) karena alat Playwright memblokir `file://`. Buka `http://127.0.0.1:8765/index.html`, lalu periksa:
1. `localStorage.clear()` + reload → `#name-modal` terlihat; klik `#name-submit` dengan input kosong → modal masih terlihat dan `#name-error` tampil.
2. Isi `#name-input` dengan `Amet`, klik submit → modal tersembunyi, `#greeting` memuat `Amet`, `localStorage` memuat `name: "Amet"`.
3. `#topic-list button:nth-child(2)` dalam keadaan `disabled`; selesaikan topik pertama lewat `#check-answer` lalu `#mark-done` → tombol kedua aktif.
4. `#level-menengah` masih `disabled`; selesaikan sisa topik Pemula secara berurutan → Menengah aktif; klik Menengah → level berpindah.
5. Injeksi data rusak: `localStorage.setItem("learn-english-progress-v1", JSON.stringify({name:"Amet",level:"mahir",xp:999,streak:99,completedTopics:[],lastVisited:"",preferences:{}}))` lalu reload → `#level-mahir` tetap `disabled` dan level aktif kembali ke Pemula.
6. Klik `#edit-name`, ubah menjadi `Budi`, submit → `#greeting` memuat `Budi` dan tersimpan.
7. Reload → nama, XP, topik selesai, dan status kunci bertahan; error konsol = 0 (peringatan Tailwind CDN diabaikan).

Expected: ketujuh skenario lolos. Perbaiki `index.html` bila ada yang gagal, lalu ulangi.

- [ ] **Step 6: Commit**

```bash
git add index.html tests/path-check.mjs
git commit -m "feat: add name modal and sequential learning path"
```

Matikan server lokal setelah verifikasi selesai.
