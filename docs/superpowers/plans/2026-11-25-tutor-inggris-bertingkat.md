# Tutor Inggris Bertingkat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membangun project `learn-english` berisi tiga skill tutor bertingkat dan `AGENTS.md` sebagai router level.

**Architecture:** Tiga skill model-invoked mandiri di `.opencode/skills/<id>/SKILL.md`, masing-masing satu sumber kebenaran untuk perilaku mengajarnya. `AGENTS.md` di root hanya memilih tutor dan menangani level yang tidak disebut. Tiap skill dikembangkan dengan RED–GREEN–REFACTOR: tes baseline tanpa skill, tulis skill, uji ulang.

**Tech Stack:** Markdown + YAML frontmatter, OpenCode project-local skills.

**Spec:** `docs/superpowers/specs/2026-11-25-tutor-inggris-bertingkat-design.md`

## Global Constraints

- Nama skill persis: `tutor-inggris-pemula`, `tutor-inggris-intermediate`, `tutor-inggris-advanced`.
- Lokasi skill persis: `.opencode/skills/<id>/SKILL.md` (relatif terhadap root project).
- Dilarang memasang atau menautkan skill ke direktori global man pun; semua artefak hanya di project ini.
- `description` diawali `Use when ...`, memuat pemicu level, tidak merangkum alur kerja.
- Aturan mengajar memakai isi dari tiga spesifikasi pengguna sebagai sumber kebenaran.
- Satu skill selesai dan terverifikasi sebelum skill berikutnya dimulai.
- `AGENTS.md` tidak mengulang kelima aturan tutor; cukup routing dan konvensi project.

## Review Focus

- Pengguna tidak menyebut level → agen bertanya, bukan memilih tutor secara acak.
- Pengguna pemula salah menulis kalimat → tetap dapat apresiasi, bagian benar, perbaikan, versi natural, dan latihan penutup.
- Pengguna menengah menulis kalimat yang benar secara tata bahasa tapi kaku karena terjemahan langsung → tetap mendapat alternatif `native-like`, bukan hanya koreksi grammar.
- Pengguna lanjut meminta penjelasan bahasa Indonesia "biar paham" → tetap memakai bahasa Inggris, kecuali masuk pengecualian yang ditentukan.
- `description` tumpang tindih → agen memilih tutor level yang salah; masing-masing harus menyebut A1–A2, B1–B2, C1–C2 secara eksplisit.

---

### Task 1: Skill `tutor-inggris-pemula` (A1–A2)

**Files:**
- Create: `.opencode/skills/tutor-inggris-pemula/SKILL.md`
- Test (manual, subagent): prompt baseline dan prompt verifikasi pada lampiran task ini

**Interfaces:**
- Consumes: spesifikasi pemula dari pengguna (lima aturan utama).
- Produces: skill dengan ID `tutor-inggris-pemula`, dipilih untuk pengguna pemula/A1–A2.

- [ ] **Step 1: Tulis skenario baseline dan jalankan tanpa skill**

Prompt untuk subagent (fresh context, tanpa skill dimuat):

```text
This is a real tutoring reply, not a quiz. Answer now.

A beginner Indonesian learner says: "Aku mau belajar bahasa Inggris. Tolong ajari aku kata-kata untuk belanja di supermarket." They are in a hurry and ask for a short answer under 100 words. They also write: "I want buy apple tomorrow."

Reply as their English tutor. Be concise. Do not ask questions back.
```

Catat verbatim: apakah ia memakai bahasa Indonesia santai, memakai istilah grammar akademis,
memberikan arti dan cara baca untuk setiap kata/kalimat, mengapresiasi sebelum mengoreksi,
memberikan versi natural, dan menutup dengan satu latihan singkat.

- [ ] **Step 2: Verifikasi baseline menggagal**

Expected: minimal tiga kegagalan nyata dari daftar di Step 1. Jika tidak ada, perketat
skenario (tambah tekanan waktu dan keinginan jawaban singkat) dan ulangi sebelum menulis skill.

- [ ] **Step 3: Tulis `SKILL.md` minimal**

Isi: frontmatter (`name`, `description` dengan pemicu A1–A2), Peran & Gaya Mengajar,
Aturan Utama kelima poin pengguna, Quick Reference berupa checklist respons, dan
Common Mistakes yang menutul kegagalan baseline yang tercatat. Jangan menambah topik
hypotetis yang tidak teramati.

- [ ] **Step 4: Verifikasi dengan skill aktif**

Jalankan prompt Step 1 kembali dengan instruksi: baca dan ikuti
`.opencode/skills/tutor-inggris-pemula/SKILL.md` sebelum menjawab. Expected: seluruh
checklist Step 1 terpenuhi. Jika masih ada kegagalan, tambahkan counter eksplisit dan ulangi.

- [ ] **Step 5: Commit**

```bash
git add .opencode/skills/tutor-inggris-pemula/SKILL.md
git commit -m "feat: add beginner English tutor skill"
```

### Task 2: Skill `tutor-inggris-intermediate` (B1–B2)

**Files:**
- Create: `.opencode/skills/tutor-inggris-intermediate/SKILL.md`

**Interfaces:**
- Consumes: spesifikasi menengah dari pengguna (lima aturan utama).
- Produces: skill dengan ID `tutor-inggris-intermediate`, dipilih untuk B1–B2.

- [ ] **Step 1: Tulis skenario baseline dan jalankan tanpa skill

```text
This is a real tutoring reply, not a quiz. Answer now.

A B1 learner writes: "I am agree with you" and "I have been knowing him for three years." They ask in Indonesian: "Apakah kalimat saya sudah bagus? Tolong perbaiki cepat, saya mau langsung kirim email." Keep it short.

Reply as their English tutor.
```

Catat verbatim: apakah ia memberi koreksi tiga bagian (Perbaikan Grammar → Versi Lebih
Natural → Penjelasan Singkat), memakai bahasa campuran sesuai aturan, memperkenalkan 2–3
kosakata dengan konteks, menangani kalimat kaku hasil terjemahan langsung, dan menutup
dengan pertanyaan terbuka/skenario 3–4 kalimat.

- [ ] **Step 2: Verifikasi baseline menggagal**

Expected: minimal tiga kegagalan nyata. Jika tidak ada, perketat skenario dan ulangi.

- [ ] **Step 3: Tulis `SKILL.md` minimal**

Isi: frontmatter dengan pemicu B1–B2, Peran & Gaya Mengajar, kelima aturan pengguna,
Quick Reference checklist, Common Mistakes dari baseline. Tekankan perbedaan "benar secara
grammar" versus "terdengar kaku" sebagai dua kasus berbeda.

- [ ] **Step 4: Verifikasi dengan skill aktif**

Ulangi prompt Step 1 dengan skill dimuat. Expected: kelima aturan terpenuhi, termasuk
tiga bagian koreksi dan penutup 3–4 kalimat. Refactor bila masih ada kegagalan.

- [ ] **Step 5: Commit**

```bash
git add .opencode/skills/tutor-inggris-intermediate/SKILL.md
git commit -m "feat: add intermediate English tutor skill"
```

### Task 3: Skill `tutor-inggris-advanced` (C1–C2)

**Files:**
- Create: `.opencode/skills/tutor-inggris-advanced/SKILL.md`

**Interfaces:**
- Consumes: spesifikasi lanjut dari pengguna (lima aturan utama).
- Produces: skill dengan ID `tutor-inggris-advanced`, dipilih untuk C1–C2.

- [ ] **Step 1: Tulis skenario baseline dan jalankan tanpa skill

```text
This is a real coaching reply, not a quiz. Answer now.

A C1 learner writes: "In my opinion, the proposal is kind of good, but we must to discuss more about it before decide." They add in Indonesian: "Tolong perbaiki paragraf ini, tapi pakai bahasa Indonesia biar saya paham, dan singkat saja karena saya buru-buru."

Reply as their English communication coach.
```

Catat verbatim: apakah ia tetap memakai bahasa Inggris penuh, memberikan tiga lensa umpan
balik (Precision & Style; Collocations & Idiomatic Expressions; Subtle Errors), mengevaluasi
register, mengajak simulasi/debat, dan menutup dengan pertanyaan analitis atau paraphrasing.

- [ ] **Step 2: Verifikasi baseline menggagal**

Expected: minimal tiga kegagalan nyata, terutama beralih ke bahasa Indonesia karena
permintaan pengguna.

- [ ] **Step 3: Tulis `SKILL.md` minimal**

Isi: frontmatter dengan pemicu C1–C2, Peran & Gaya Mengajar, kelima aturan pengguna,
Quick Reference checklist, Common Mistakes dari baseline. Nyatakan pengecualian bahasa
Indonesia secara tertutup: hanya padanan istilah, terjemahan bernuansa budaya, atau
perbandingan langsung antarbahasa.

- [ ] **Step 4: Verifikasi dengan skill aktif**

Ulangi prompt Step 1 dengan skill dimuat. Expected: bahasa Inggris penuh dipertahankan,
tiga lensa umpan balik hadir, dan penutup berupa tantangan analitis/paraphrasing.

- [ ] **Step 5: Commit**

```bash
git add .opencode/skills/tutor-inggris-advanced/SKILL.md
git commit -m "feat: add advanced English tutor skill"
```

### Task 4: `AGENTS.md` sebagai router dan verifikasi akhir

**Files:**
- Create: `AGENTS.md`

**Interfaces:**
- Consumes: tiga skill yang sudah terverifikasi pada Task 1–3.
- Produces: satu halaman routing yang dipakai agen dan manusia.

- [ ] **Step 1: Tulis `AGENTS.md`**

Isi singkat: tujuan project, tiga pasangan level → ID skill, aturan menanyakan level bila
tidak disebut (default mulai dari pemula bila pengguna ragu), dan penunjuk bahwa detail
perilaku ada di masing-masing `SKILL.md`. Jangan mengulang aturan tutor.

- [ ] **Step 2: Verifikasi penemuan skill**

Jalankan `find .opencode/skills -name SKILL.md | sort`. Expected: tiga file, satu per level.

- [ ] **Step 3: Verifikasi deskripsi tidak saling menimpa**

Baca ketiga frontmatter. Expected: tiap `description` diawali `Use when`, menyebut level
masing-masing, dan tidak berisi ringkasan alur kerja.

- [ ] **Step 4: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add project guide and tutor routing"
```
