# Materi dari Sesi Belajar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menyiapkan konvensi dan template agar agent dapat menulis draf materi baru dari sesi tutor tanpa mengubah jalur belajar atau UI yang sudah terverifikasi.

**Architecture:** Draf berupa file Markdown di `materi-baru/`, tidak pernah dimuat oleh aplikasi. Template dan dokumen konvensi menjadi acuan agent; satu tes Node memeriksa bentuk draf dan memastikan aplikasi tidak mereferensikan draf sebagai materi aktif.

**Tech Stack:** Markdown, Node built-in `assert` dan `fs`, tanpa dependency baru.

**Spec:** `docs/superpowers/specs/2026-11-25-materi-dari-sesi-design.md`

## Global Constraints

- Draf disimpan di `materi-baru/YYYY-MM-DD-<slug>.md`; template di `materi-baru/_TEMPLATE.md`.
- Draf tidak boleh direferensikan oleh `index.html` atau `lessons.js`.
- Level hanya `pemula`, `menengah`, `mahir`.
- Field wajib draf: `Level:`, `Saran penempatan:`, `Sumber sesi:`, `## Item`, `## Prompt latihan`, `## Kunci jawaban statis`, `## Checklist koreksi`.
- Aturan isi per level mengikuti tiga `SKILL.md`; tidak ada perubahan pada skill, UI, `lessons.js`, atau workflow deploy.

## Review Focus

- `Level:` di luar tiga nilai yang diizinkan → draf ditolak oleh `tests/materi-check.mjs`.
- Draf tanpa salah satu field wajib → ditolak oleh tes yang sama.
- Draf tanpa satu pun baris `- en:` → ditolak; sesi tanpa materi baru tidak boleh menghasilkan file kosong.
- Draf bertanda `Level: mahir` memakai `Arti:` atau `cara baca` → ditolak, karena skill lanjut mewajibkan bahasa Inggris penuh.
- File draf tersebut di `index.html` atau `lessons.js` → ditolak; draf bukan materi aktif dan tidak boleh mengubah jalur berurutan.

---

### Task 1: Konvensi, template, dan tes draf

**Files:**
- Create: `materi-baru/_TEMPLATE.md`
- Create: `docs/agents/materi-dari-sesi.md`
- Modify: `AGENTS.md`
- Test: `tests/materi-check.mjs`

**Interfaces:**
- Consumes: spec desain dan aturan pada tiga `SKILL.md`.
- Produces: template dengan tujuh field wajib; konvensi penulisan dan penggabungan draf; pointer di `AGENTS.md`; `tests/materi-check.mjs` yang memvalidasi semua draf di `materi-baru/`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/materi-check.mjs` dengan Node `assert` yang:
- membaca `materi-baru/_TEMPLATE.md` dan memastikan ketujuh field wajib ada;
- membaca semua `materi-baru/*.md` kecuali `_TEMPLATE.md`, lalu untuk tiap file memastikan ketujuh field ada, nilai `Level:` termasuk `pemula`/`menengah`/`mahir`, dan ada minimal satu baris `- en:`;
- untuk draf dengan `Level: mahir`, memastikan tidak ada `Arti:` maupun `cara baca`;
- memastikan `index.html` dan `lessons.js` tidak memuat teks `materi-baru/`;
- memastikan `AGENTS.md` memuat `docs/agents/materi-dari-sesi.md`.

- [ ] **Step 2: Jalankan tes untuk melihat kegagalan**

Run: `node tests/materi-check.mjs`
Expected: FAIL karena direktori `materi-baru/` belum ada.

- [ ] **Step 3: Buat template, dokumen konvensi, dan pointer**

Buat `materi-baru/_TEMPLATE.md` dengan tujuh field wajib. Untuk `## Item`, cantumkan contoh field per level sebagai komentar Markdown: Pemula `en`/`meaning`/`say`, Menengah `en`/`meaning`/`note`, Mahir `en`/`meaning: ""`/`note`. Di `## Checklist koreksi`, cantumkan lima nomor urut sebagai placeholder.

Buat `docs/agents/materi-dari-sesi.md` yang menjelaskan: kapan agent menulis draf, nama file, tujuh field wajib, aturan isi per level, bahwa agent tidak mengubah progres/urutan topik, dan alur saat pengguna meminta penggabungan ke `lessons.js` (termasuk pembaruan `tests/ui-check.mjs` bila topik baru ditambahkan).

Tambahkan satu baris pointer di `AGENTS.md` di bawah `## Konvensi` yang mengarah ke dokumen tersebut. Jangan mengubah baris pemilihan tutor.

- [ ] **Step 4: Jalankan tes sampai lolos, bersama tes yang sudah ada**

Run: `node tests/materi-check.mjs && node tests/ui-check.mjs && node tests/path-check.mjs && node tests/path-behavior-check.mjs`
Expected: semua PASS. Perbaiki file baru atau tes, bukan materi/tutor yang sudah terverifikasi.

- [ ] **Step 5: Commit**

```bash
git add materi-baru/_TEMPLATE.md docs/agents/materi-dari-sesi.md AGENTS.md tests/materi-check.mjs
git commit -m "docs: add session-material draft convention and checker"
```
