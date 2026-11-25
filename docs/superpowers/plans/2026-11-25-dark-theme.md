# Dark Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan mode gelap yang mengikuti OS secara default dan bisa di-override lewat tombol ikon, dengan preferensi tersimpan di `progress.preferences.theme`.

**Architecture:** Satu `index.html` tetap dipakai. Tailwind CDN diberi `darkMode: "class"`, token HSL didefinisikan ulang di `.dark`, dan tombol di header mengubah satu nilai preferensi lalu menerapkan class `dark` pada `<html>`. Fungsi inti tema ditulis sebagai pure functions di dalam script agar bisa diuji lewat `vm` seperti tes perilaku jalur belajar.

**Tech Stack:** HTML, Tailwind CDN, CSS variables, Font Awesome Free CDN, Node built-in `assert`/`fs`/`vm`.

**Spec:** `docs/superpowers/specs/2026-11-25-dark-theme-design.md`

## Global Constraints

- Satu file aplikasi: `index.html`; tidak ada build step, server, npm, atau ES module untuk `lessons.js`.
- Kunci penyimpanan tetap `learn-english-progress-v1`; bentuk progress tetap `{ name, level, xp, streak, completedTopics, lastVisited, preferences }`.
- Nilai `preferences.theme` hanya `"system"`, `"light"`, `"dark"`; default `"system"`.
- Ikon memakai Font Awesome CDN lewat `<link>` CSS; tidak boleh menambah script `module`/`nomodule`.
- Tidak mengubah `lessons.js`, urutan topik, aturan unlock, atau tiga `SKILL.md`.
- Tombol tema harus punya `id="theme-toggle"` dan berada di header dekat `#edit-name`.

## Review Focus

- OS berubah ke gelap saat preferensi `system` → tampilan harus mengikuti tanpa klik; diuji `themeUiState("system", true).effective === "dark"` di Task 2.
- Pengguna memilih `light` atau `dark` sementara OS berlawanan → pilihan harus menang; diuji `themeUiState("light", true).effective === "light"` dan `themeUiState("dark", false).effective === "dark"` di Task 2.
- Progress lama tanpa `preferences.theme` atau berisi nilai asing → tidak boleh error, jatuh ke `system`; diuji `themePreference({})` dan `themePreference({ theme: "bogus" })` di Task 2.
- Reset progres → tema kembali ke `system`; diuji lewat `themePreference({ theme: "system" })` dan pemeriksaan bahwa sumber `empty()` memuat `preferences: { theme: "system" }` di Task 2.
- Teks sekunder di mode gelap (arti/cara baca/catatan/footer/error) → tidak boleh gelap di atas gelap; diuji keberadaan `dark:text-slate-400`, `dark:text-slate-300`, `dark:text-red-400` di Task 1.

---

### Task 1: Token tema dan markup tombol

**Files:**
- Modify: `index.html` (tailwind config, blok `:root`/`.dark`, header, kelas teks sekunder)
- Create: `tests/theme-check.mjs`
- Modify: `tests/ui-check.mjs`

**Interfaces:**
- Consumes: desain di `docs/superpowers/specs/2026-11-25-dark-theme-design.md`.
- Produces: kontrak struktural tema; elemen `#theme-toggle` dengan ikon `<i>`; kelas `.dark` pada stylesheet; varian `dark:` pada teks sekunder; token `id="theme-toggle"` dan `darkMode: "class"` di `tests/ui-check.mjs`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/theme-check.mjs` dengan `node:assert/strict` yang membaca `index.html` dan memastikan:
- `darkMode: "class"` ada di konfigurasi Tailwind;
- blok `.dark { ... }` ada dan memuat `--background`, `--foreground`, `--card`, `--muted`, `--primary`, `--border`;
- ada `<link>` stylesheet Font Awesome dengan URL mengandung `font-awesome`;
- ada `id="theme-toggle"`, `fa-circle-half-stroke`, `fa-sun`, `fa-moon`, dan `prefers-color-scheme`;
- ada `dark:text-slate-400`, `dark:text-slate-300`, dan `dark:text-red-400`.

Tambahkan `id="theme-toggle"` dan `darkMode: "class"` ke array `required` di `tests/ui-check.mjs`.

- [ ] **Step 2: Jalankan tes untuk melihat kegagalan**

Run: `node tests/theme-check.mjs && node tests/ui-check.mjs`
Expected: FAIL karena token tema belum ada di `index.html`.

- [ ] **Step 3: Tambah konfigurasi, token, dan markup**

Di `tailwind.config`, tambah `darkMode: "class"`. Di `<style>`, setelah `:root`, tambah blok `.dark` dengan nilai HSL:
`--background: 222 47% 7%`, `--foreground: 210 40% 96%`, `--card: 222 47% 11%`,
`--muted: 217 33% 17%`, `--primary: 217 91% 60%`, `--border: 217 33% 24%`.

Tambah `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />` di `<head>`.

Bungkus tombol existing `#edit-name` dalam `<div class="flex items-center gap-2">`, dan tambah sebelum tombol itu:

```html
<button id="theme-toggle" type="button" class="rounded-md border border-border px-3 py-2 text-sm" aria-label="Ubah tema" title="Tema: system">
  <i class="fa-solid fa-circle-half-stroke" aria-hidden="true"></i>
</button>
```

Ganti kelas teks sekunder berikut di seluruh file (termasuk string di `renderLesson`): `text-slate-500` → `text-slate-500 dark:text-slate-400`, `text-slate-600` → `text-slate-600 dark:text-slate-300`, `text-slate-400` → `text-slate-400 dark:text-slate-500`, `text-red-600` → `text-red-600 dark:text-red-400`. Biarkan `text-white` pada tombol primary apa adanya.

- [ ] **Step 4: Jalankan tes sampai lolos, bersama suite existing**

Run: `node tests/theme-check.mjs && node tests/ui-check.mjs && node tests/materi-check.mjs && node tests/path-check.mjs && node tests/path-behavior-check.mjs && node tests/workflow-check.mjs`
Expected: semua PASS; `theme-check.mjs` lolos berkat perubahan markup, tes lain tetap lolos.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/theme-check.mjs tests/ui-check.mjs docs/superpowers/specs/2026-11-25-dark-theme-design.md docs/superpowers/plans/2026-11-25-dark-theme.md
git commit -m "feat: add dark theme tokens and toggle markup"
```

### Task 2: State preferensi dan perilaku tombol

**Files:**
- Modify: `index.html` (helper tema, `progressStore.empty()`, `applyTheme()`, listener, handler klik, pemanggilan saat render)
- Modify: `tests/theme-check.mjs`

**Interfaces:**
- Consumes: `#theme-toggle` dan ikon dari Task 1; `progressStore.save(progress)` yang sudah ada.
- Produces: `themePreference(preferences)`, `effectiveTheme(preference, systemDark)`, `nextTheme(preference)`, `themeUiState(preference, systemDark)`; `applyTheme()`; kunci `preferences.theme`.

- [ ] **Step 1: Tambah tes perilaku yang gagal**

Append ke `tests/theme-check.mjs`: potong blok helper dari script terakhir `index.html` antara marker `// THEME_HELPER_START` dan `// THEME_HELPER_END`, jalankan dengan `vm.runInContext` pada context `{ window: { matchMedia: () => ({ matches: true }) } }`.

Tulis assertions:
- `themePreference({})` dan `themePreference({ theme: "bogus" })` sama dengan `"system"`;
- `themePreference({ theme: "system" })` sama dengan `"system"`;
- `effectiveTheme("system", false) === "light"`, `effectiveTheme("system", true) === "dark"`, `effectiveTheme("light", true) === "light"`, `effectiveTheme("dark", false) === "dark"`;
- `nextTheme("system") === "light"`, `nextTheme("light") === "dark"`, `nextTheme("dark") === "system"`;
- `themeUiState("system", true)` menghasilkan `{ effective: "dark", icon: "fa-circle-half-stroke" }` dan label mengandung `"dark"`;
- `themeUiState("light", true).icon === "fa-sun"` dan `themeUiState("dark", false).icon === "fa-moon"`.

Juga pastikan sumber `index.html` memuat `preferences: { theme: "system" }` di `empty()`, `progress.preferences.theme`, `addEventListener("change"` pada `matchMedia`, dan pemanggilan `applyTheme()` di dalam handler `#theme-toggle`.

- [ ] **Step 2: Jalankan tes untuk melihat kegagalan**

Run: `node tests/theme-check.mjs`
Expected: FAIL karena marker `THEME_HELPER_START` belum ada.

- [ ] **Step 3: Implementasi helper dan wiring**

Ubah `progressStore.empty()` sehingga mengembalikan `preferences: { theme: "system" }`. Di `load()`, bila `preferences` valid, salin objeknya dan paksa `theme` ke salah satu nilai yang diizinkan, jika tidak `"system"`.

Tambah blok bermarker di dalam script utama, tepat setelah deklarasi `byId`/`LEVEL_ORDER`:

```js
    // THEME_HELPER_START
    const THEME_ORDER = ["system", "light", "dark"];
    const THEME_ICONS = { system: "fa-circle-half-stroke", light: "fa-sun", dark: "fa-moon" };
    function themePreference(preferences) { /* kembalikan nilai valid atau "system" */ }
    function effectiveTheme(preference, systemDark) { /* "system" → systemDark ? "dark" : "light" */ }
    function nextTheme(preference) { /* elemen berikutnya di THEME_ORDER, wraps */ }
    function themeUiState(preference, systemDark) { /* kembalikan effective, icon, label */ }
    // THEME_HELPER_END
```

Tambah `function applyTheme()` yang memanggil `themePreference(progress.preferences)` dan `window.matchMedia("(prefers-color-scheme: dark)").matches`, menerapkan hasil `themeUiState` ke `document.documentElement.classList.toggle("dark", ...)`, lalu mengubah `className` ikon `<i>`, `title`, dan `aria-label` tombol.

Pasang listener perubahan `matchMedia` yang memanggil `applyTheme()` hanya bila preferensi masih `"system"`. Tambah handler klik `#theme-toggle` yang menetapkan `progress.preferences.theme = nextTheme(themePreference(progress.preferences))`, menyimpan lewat `progressStore.save(progress)`, lalu memanggil `applyTheme()`. Panggil `applyTheme()` sekali sebelum `renderAll()` di inisialisasi, dan sekali lagi di handler reset setelah `progress = progressStore.empty()`.

- [ ] **Step 4: Jalankan tes sampai lolos, bersama suite penuh**

Run: `node tests/theme-check.mjs && node tests/ui-check.mjs && node tests/materi-check.mjs && node tests/path-check.mjs && node tests/path-behavior-check.mjs && node tests/workflow-check.mjs`
Expected: semua PASS.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/theme-check.mjs
git commit -m "feat: persist and apply dark theme preference"
```

### Task 3: Push, deploy, dan verifikasi live

**Files:** tidak ada perubahan file baru.

**Interfaces:**
- Consumes: dua commit dari Task 1 dan Task 2 di branch `main`.
- Produces: situs live yang menyajikan `index.html` dengan dukungan dark theme.

- [ ] **Step 1: Verifikasi lokal terakhir dan push**

Run:
```bash
node tests/theme-check.mjs && node tests/ui-check.mjs && node tests/materi-check.mjs && node tests/path-check.mjs && node tests/path-behavior-check.mjs && node tests/workflow-check.mjs
git push origin main
git status --short --branch
```
Expected: semua tes PASS; `## main...origin/main` bersih.

- [ ] **Step 2: Pantau deploy dan verifikasi konten live**

Ambil run id terbaru dengan `gh run list --repo ametsuramet/learn-english-with-amet --limit 1`, lalu `gh run watch <id> --exit-status`. Setelah sukses, fetch `https://ametsuramet.github.io/learn-english-with-amet/index.html?v=<timestamp>` dan pastikan memuat `darkMode: "class"`, `id="theme-toggle"`, dan `prefers-color-scheme`.

Expected: run sukses (bisa lewat `Deploy (attempt 2)` bila error metadata artifact muncul); ketiga token ada di HTML live.
