# UI Belajar Bahasa Inggris Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun satu halaman statis `index.html` untuk memilih level, membaca materi, berlatih, dan menyimpan progres di browser.

**Architecture:** Satu file HTML dengan Tailwind CDN, CSS variables ala shadcn/ui, dan JavaScript vanilla. Seluruh data materi dan logika progress berada di dalam file yang sama. Tes struktural dijalankan dengan Node; perilaku interaktif diverifikasi lewat Playwright terhadap URL `file://`.

**Tech Stack:** HTML, Tailwind CDN, CSS variables, vanilla JavaScript, Node built-in `assert`, Playwright (alat browser eksekutor).

**Spec:** `docs/superpowers/specs/2026-11-25-ui-belajar-design.md`

## Global Constraints

- Satu file aplikasi: `index.html` di root project; tidak ada `package.json`, bundler, atau server.
- Tailwind lewat CDN; komponen bergaya shadcn ditulis dengan utility classes.
- Kunci localStorage persis: `learn-english-progress-v1`.
- Bentuk progress persis: `{ level, xp, streak, completedTopics, lastVisited }`.
- Tiga level persis: `pemula`, `menengah`, `mahir` dengan label A1–A2, B1–B2, C1–C2.
- Tidak ada umpan balik AI, tidak ada API call, tidak ada perubahan pada skill yang sudah ada.

## Review Focus

- Level tidak tersimpan saat pengguna berganti level → progres kembali ke level awal setelah reload.
- Tombol "Saya paham" tidak menandai topik selesai → XP dan daftar topik selesai tidak berubah.
- Data lama/rusak di localStorage → halaman error saat dibuka; perlu fallback ke progress kosong.
- Materi level lanjut masih memakai bahasa Indonesia → melanggar aturan skill advanced.
- Kunci jawaban menampilkan koreksi AI → melanggar batas static HTML; kunci harus statis.

---

### Task 1: Kontrak struktural dan `index.html`

**Files:**
- Create: `tests/ui-check.mjs`
- Create: `index.html`

**Interfaces:**
- Consumes: spec desain UI.
- Produces: `index.html` dengan elemen ber-ID stabil yang dipakai Task 2 untuk interaksi browser.

- [ ] **Step 1: Tulis tes struktural yang gagal**

Buat `tests/ui-check.mjs` dengan Node `assert`, membaca `index.html`, dan memeriksa:
`id="level-pemula"`, `id="level-menengah"`, `id="level-mahir"`, `id="topic-list"`,
`id="lesson-card"`, `id="exercise-input"`, `id="check-answer"`, `id="feedback"`,
`id="progress-xp"`, `id="progress-streak"`, `id="progress-topics"`,
`id="mark-done"`, `id="reset-progress"`, `id="export-progress"`,
string `learn-english-progress-v1`, dan `progressStore`.

- [ ] **Step 2: Jalankan tes untuk melihat kegagalan**

Run: `node tests/ui-check.mjs`
Expected: FAIL karena `index.html` belum ada.

- [ ] **Step 3: Bangun `index.html` minimal**

Isi: Tailwind CDN, CSS variables bertema shadcn, header dengan tiga tombol level, panel
materi, panel latihan, panel progres, data tiga level sesuai aturan skill, dan objek
`progressStore` dengan baca/tulis `localStorage`, fallback progress kosong, serta
fungsi render untuk level, topik, latihan, dan progres.

- [ ] **Step 4: Jalankan tes sampai lolos**

Run: `node tests/ui-check.mjs`
Expected: PASS. Jika gagal, perbaiki `index.html`, bukan tes.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/ui-check.mjs
git commit -m "feat: add static English learning UI"
```

### Task 2: Verifikasi perilaku browser dan persistensi

**Files:**
- Modify: `index.html` (hanya bila verifikasi menemukan kegagalan)

**Interfaces:**
- Consumes: ID elemen dari Task 1 dan kunci `learn-english-progress-v1`.
- Produces: perilaku terverifikasi: ganti level, pilih topik, cek jawaban, tandai selesai, reload.

- [ ] **Step 1: Tulis ekspektasi skenario browser**

Sebelum menjalankan, catat ekspektasi: setelah klik level Menengah dan reload, tombol
Menengah tetap aktif; setelah pilih topik, `#lesson-card` memuat materi; setelah isi
`#exercise-input` dan klik `#check-answer`, `#feedback` menampilkan kunci jawaban;
setelah klik `#mark-done`, XP bertambah dan topik masuk daftar selesai; setelah reload,
keduanya tetap ada.

- [ ] **Step 2: Jalankan skenario dengan Playwright**

Buka `file:///Users/ametsuramet/AMETORY/learn-english/index.html` memakai
`tools.playwright.browser_navigate`, lalu gunakan `browser_snapshot`, `browser_click`,
`browser_type`, dan `browser_evaluate` untuk memeriksa tiap ekspektasi di atas.

Expected: semua ekspektasi terpenuhi, tidak ada error di konsol.

- [ ] **Step 3: Perbaiki kegagalan apa pun di `index.html`**

Gunakan `browser_console_messages` bila ada error. Ulangi Step 2 sampai semua ekspektasi lolos.

- [ ] **Step 4: Commit perbaikan bila ada**

```bash
git add index.html
git commit -m "fix: correct browser interaction in learning UI"
```

Langkah ini boleh dilewati bila tidak ada perbaikan.
