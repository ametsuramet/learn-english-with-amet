# Tutor Materi-Dulu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah ketiga tutor agar setiap topik dimulai dengan wizard empat langkah — pengantar Indonesia, materi, contoh, lalu latihan — bukan langsung pertanyaan.

**Architecture:** Tambahkan blok `Alur Wajib per Topik (Wizard 4 Step)` yang sama strukturnya ke tiga `SKILL.md`, lalu sesuaikan aturan bahasa masing-masing level. Tidak ada perubahan pada situs statis, `lessons.js`, atau `AGENTS.md`.

**Tech Stack:** Markdown skill files di `.opencode/skills/`, Node `assert` + `readFileSync` untuk pemeriksaan struktural.

**Spec:** `docs/superpowers/specs/2026-11-26-tutor-materi-dulu-design.md`

## Global Constraints

- Ketiga level memakai urutan: Step 1 Pengantar (Indonesia) → Step 2 Materi → Step 3 Contoh → Step 4 Latihan.
- Setiap step disajikan lewat tool `question`; isi step berikutnya tidak boleh muncul sebelum pengguna memilih opsi lanjut.
- Opsi navigasi persis: `Lanjut ke materi`, `Lanjut ke contoh`, `Lanjut ke latihan`.
- Step 1 tidak boleh berisi pertanyaan latihan.
- Pemula: semua penjelasan Indonesia; setiap item Inggris disertai arti dan cara baca.
- Menengah: pengantar dan nuansa dalam bahasa Indonesia; contoh dan latihan bahasa Inggris.
- Lanjut: pengantar bahasa Indonesia; materi, contoh, latihan, dan umpan balik bahasa Inggris.
- `AGENTS.md` tetap hanya mengatur pemilihan tutor; `lessons.js` dan `index.html` tidak berubah.

## Review Focus

- Pengguna mengetik “lanjut” di Step 1 → harus mendapat Step 2 materi, bukan latihan. Diuji Task 1 langkah 1 lewat token Step 1 “Tidak ada pertanyaan latihan” dan larangan menampilkan step berikutnya.
- Lanjut memakai pengantar Indonesia tetapi materi Inggris → diuji Task 1 langkah 1 lewat `doesNotMatch` aturan lama “Komunikasi Penuh Bahasa Inggris” dan regex aturan bahasa baru.
- Pemula tetap mendapat arti dan cara baca → diuji Task 1 langkah 1 lewat `assert.match(pemula, /cara baca/i)`.
- Pengguna bertanya di tengah wizard → jawab lalu kembali ke tahap berjalan; diuji Task 1 langkah 1 lewat token “Jika pengguna bertanya di tengah wizard”.
- Situs statis tidak ikut berubah → diuji Task 1 langkah 4 lewat seluruh suite situs yang tetap hijau.

---

### Task 1: Wizard empat langkah di ketiga skill

**Files:**
- Create: `tests/tutor-check.mjs`
- Modify: `.opencode/skills/tutor-inggris-pemula/SKILL.md`
- Modify: `.opencode/skills/tutor-inggris-intermediate/SKILL.md`
- Modify: `.opencode/skills/tutor-inggris-advanced/SKILL.md`

**Interfaces:**
- Consumes: tidak ada kode runtime; hanya teks skill dan `readFileSync`.
- Produces: struktur markdown yang sama di ketiga skill; tidak ada fungsi atau tipe yang dipakai task lain.

- [ ] **Step 1: Write the failing test**

Buat `tests/tutor-check.mjs`:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (id) =>
  readFileSync(new URL(`../.opencode/skills/${id}/SKILL.md`, import.meta.url), "utf8");

const skills = {
  pemula: read("tutor-inggris-pemula"),
  menengah: read("tutor-inggris-intermediate"),
  lanjut: read("tutor-inggris-advanced"),
};

const required = [
  "## Alur Wajib per Topik (Wizard 4 Step)",
  "### Step 1 — Pengantar (Indonesia)",
  "### Step 2 — Materi",
  "### Step 3 — Contoh",
  "### Step 4 — Latihan",
  "Lanjut ke materi",
  "Lanjut ke contoh",
  "Lanjut ke latihan",
  "tool `question`",
  "Jika pengguna bertanya di tengah wizard",
];

for (const [level, text] of Object.entries(skills)) {
  for (const token of required) {
    assert.ok(text.includes(token), `${level}: missing ${token}`);
  }
  assert.match(text, /Tidak ada pertanyaan latihan di step ini/i, `${level}: Step 1 must not ask an exercise`);
  assert.match(text, /Jangan menampilkan isi\s+step berikutnya/i, `${level}: must not leak later steps`);
}

assert.match(skills.pemula, /cara baca/i, "pemula must keep pronunciation");
assert.match(skills.pemula, /arti bahasa Indonesia/i, "pemula must keep Indonesian meanings");
assert.match(skills.menengah, /bahasa Indonesia/i, "menengah must keep Indonesian explanations");
assert.doesNotMatch(skills.lanjut, /Komunikasi Penuh Bahasa Inggris/);
assert.doesNotMatch(skills.lanjut, /Seluruh respons dalam bahasa Inggris/);
assert.match(skills.lanjut, /Pengantar[\s\S]{0,120}bahasa Indonesia/i);
assert.match(skills.lanjut, /Materi[\s\S]{0,120}Inggris/i);

console.log("PASS: tutor wizard contract");
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/tutor-check.mjs`
Expected: FAIL with `pemula: missing ## Alur Wajib per Topik (Wizard 4 Step)`.

- [ ] **Step 3: Add the shared wizard block and adjust language rules**

Sisipkan blok berikut setelah `## Aturan Utama` di **setiap** skill, dengan baris khusus level menggantikan `{LEVEL_LINE_2}` dan `{LEVEL_LINE_3}`:

```markdown
## Alur Wajib per Topik (Wizard 4 Step)

Setiap topik baru wajib disajikan sebagai wizard empat langkah. Jangan menampilkan isi
step berikutnya sebelum pengguna memilih opsi lanjut. Gunakan tool `question` untuk
setiap step.

### Step 1 — Pengantar (Indonesia)

- 1–2 kalimat bahasa Indonesia: topik, mengapa penting, dan latihan yang akan dilakukan.
- Tidak ada pertanyaan latihan di step ini.
- Opsi singkat: `Lanjut ke materi`.

### Step 2 — Materi

- 2–3 item inti; setiap item memuat frasa/kata Inggris, makna atau nuansa, dan catatan register/penggunaan.
- {LEVEL_LINE_2}
- Opsi singkat: `Lanjut ke contoh`.

### Step 3 — Contoh

- 2–3 kalimat kontekstual yang memakai item materi.
- {LEVEL_LINE_3}
- Opsi singkat: `Lanjut ke latihan`.

### Step 4 — Latihan

- Tepat satu tugas setelah materi dan contoh.
- Sajikan lewat tool `question`: satu opsi singkat (misalnya `Beri petunjuk` atau `Give me a hint`) dan biarkan jawaban diketik lewat kolom bebas.
- Umpan balik baru diberikan setelah jawaban masuk, memakai format level ini.

Jika pengguna bertanya di tengah wizard, jawab pertanyaannya, lalu tawarkan kembali tahap yang sedang berjalan.
```

Isi baris level:

- Pemula — `{LEVEL_LINE_2}`: `Setiap item wajib disertai arti bahasa Indonesia dan cara baca sederhana.`
  `{LEVEL_LINE_3}`: `Setiap contoh disertai terjemahan bahasa Indonesia.`
- Menengah — `{LEVEL_LINE_2}`: `Jelaskan nuansa atau register dalam bahasa Indonesia.`
  `{LEVEL_LINE_3}`: `Tambahkan catatan nuansa singkat dalam bahasa Indonesia.`
- Lanjut — `{LEVEL_LINE_2}`: `Materi berbahasa Inggris; bahasa Indonesia hanya untuk padanan istilah yang diminta.`
  `{LEVEL_LINE_3}`: `Contoh berbahasa Inggris; catatan nuansa tetap berbahasa Inggris.`

Ubah aturan bahasa yang bertentangan:

- **Pemula:** ganti judul aturan 5 menjadi `**Latihan Interaktif di Step 4:**` dan tambahkan `Latihan hanya muncul setelah Step 2 dan Step 3 selesai.` di akhir aturan itu.
- **Menengah:** ganti aturan 1 menjadi:
  `**Bahasa Pengantar dan Penjelasan:** Gunakan bahasa Indonesia untuk pengantar topik dan penjelasan nuansa; gunakan bahasa Inggris untuk contoh dan latihan.`
- **Lanjut:** ganti aturan 1 menjadi:
  `**Bahasa Pengantar, Materi, dan Umpan Balik:** Gunakan bahasa Indonesia untuk pengantar topik (Step 1). Materi, contoh, latihan, dan umpan balik berbahasa Inggris. Bahasa Indonesia hanya dipakai untuk tiga hal: padanan istilah spesifik yang diminta, terjemahan bernuansa budaya, atau perbandingan langsung antarbahasa.`

Perbarui juga Quick Reference:

- **Pemula:** baris pertama menjadi `Sapaan dan pengantar singkat dalam bahasa Indonesia.`; tambahkan `Materi dan contoh disajikan bertahap; latihan di Step 4.`
- **Menengah:** baris pertama menjadi `Pengantar topik dalam bahasa Indonesia; contoh dan latihan dalam bahasa Inggris sederhana; nuansa dan alasan dalam bahasa Indonesia.`
- **Lanjut:** baris pertama menjadi `Pengantar dalam bahasa Indonesia; materi, contoh, latihan, dan umpan balik dalam bahasa Inggris; bahasa Indonesia hanya untuk tiga pengecualian yang disebut di Aturan 1.`

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
node tests/tutor-check.mjs && node tests/drawer-check.mjs && node tests/theme-check.mjs && node tests/ui-check.mjs && node tests/materi-check.mjs && node tests/path-check.mjs && node tests/path-behavior-check.mjs && node tests/workflow-check.mjs
```

Expected: 8 baris `PASS`, tanpa error.

- [ ] **Step 5: Commit**

```bash
git add tests/tutor-check.mjs .opencode/skills/tutor-inggris-pemula/SKILL.md .opencode/skills/tutor-inggris-intermediate/SKILL.md .opencode/skills/tutor-inggris-advanced/SKILL.md docs/superpowers/specs/2026-11-26-tutor-materi-dulu-design.md docs/superpowers/plans/2026-11-26-tutor-materi-dulu.md
git commit -m "feat: teach every tutor topic through a four-step wizard"
```

## Self-review

- Spec coverage: wizard empat langkah, pengantar Indonesia, bahasa per level, pengecualian pertanyaan singkat, dan larangan situs berubah — semuanya ada di Task 1.
- Review Focus: kelima input punya pemeriksaan di Task 1 langkah 1 atau suite situs di langkah 4.
- Type/name consistency: tidak ada fungsi baru; label step dan opsi navigasi memakai string yang sama di test, plan, dan skill.
