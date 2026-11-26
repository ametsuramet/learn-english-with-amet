# Tutor Materi-Dulu — Design

## Intent

Memperbaiki metode ketiga tutor agar setiap topik dimulai dengan pengantar dan materi
pembelajaran, bukan langsung pertanyaan. Pengantar memakai bahasa Indonesia; bahasa
materi dan latihan tetap disesuaikan dengan level.

## Goals

- Setiap sesi topik baru mengikuti alur: pengantar → materi → contoh → latihan → umpan balik.
- Materi dan contoh disajikan sebagai wizard empat langkah, satu layar `question` per tahap.
- Pengantar selalu berbahasa Indonesia, minimal menyebut topik, alasan pentingnya, dan
  apa yang akan dilatih.
- Tidak ada pertanyaan latihan sebelum materi dan contoh disajikan.
- Aturan bahasa dan format umpan balik tetap berbeda per level.
- Latihan tetap disajikan lewat tool `question` sesuai konvensi project.

## Non-goals

- Tidak mengubah isi `lessons.js` atau situs statis; situs sudah menampilkan materi
  sebelum latihan.
- Tidak menyamakan tingkat kesulitan atau format koreksi ketiga level.
- Tidak menambah skill baru atau dokumen metode bersama.
- Tidak memaksakan alur materi-dulu untuk pertanyaan singkat di luar topik course.

## Constraints

- Aturan mengajar harus tetap berada di masing-masing `.opencode/skills/<id>/SKILL.md`.
- `AGENTS.md` tetap hanya mengatur pemilihan tutor.
- Level Lanjut tetap C1–C2: materi, contoh, latihan, dan umpan balik berbahasa Inggris;
  bahasa Indonesia hanya untuk pengantar dan tiga pengecualian yang sudah ada.
- Level Pemula tetap menyertakan arti dan cara baca untuk setiap item Inggris.
- Level Menengah tetap memakai penjelasan nuansa dalam bahasa Indonesia.

## Approaches

1. **Blok alur di tiap skill** — dipilih pengguna. Tambahkan bagian `Alur Wajib per Topik`
   yang sama strukturnya ke tiga `SKILL.md`, lalu sesuaikan aturan bahasa masing-masing.
2. **Satu dokumen metode bersama** — ditolak: menambah file yang harus dibaca agen dan
   mengubah konvensi “aturan mengajar ada di masing-masing skill”.
3. **Skill dasar bersama** — ditolak: menambah lapisan skill dan memperumit pemilihan tutor.

## Design

### Wizard empat langkah (struktur sama di ketiga skill)

Setiap topik baru disajikan satu tahap per layar `question`. Isi tahap berikutnya tidak
boleh muncul di layar sebelumnya.

1. **Step 1 — Pengantar (Indonesia).** 1–2 kalimat: topik, mengapa penting, dan latihan
   apa yang akan dilakukan. Opsi singkat: `Lanjut ke materi`. Tidak ada pertanyaan latihan.
2. **Step 2 — Materi.** 2–3 item inti. Setiap item memuat frasa/kata Inggris, makna atau
   nuansa, dan catatan register/penggunaan. Pemula menambahkan cara baca. Opsi singkat:
   `Lanjut ke contoh`.
3. **Step 3 — Contoh.** 2–3 kalimat kontekstual yang memakai item materi. Pemula
   menambahkan arti; Menengah menambahkan catatan nuansa; Lanjut tetap Inggris. Opsi
   singkat: `Lanjut ke latihan`.
4. **Step 4 — Latihan.** Tepat satu tugas setelah materi dan contoh. Sajikan lewat tool
   `question` dengan satu opsi singkat (misalnya `Give me a hint`) dan biarkan jawaban
   diketik lewat kolom bebas.

**Umpan balik** hanya muncul setelah pengguna menjawab Step 4, memakai format level
masing-masing. Jika pengguna bertanya di tengah wizard, jawab pertanyaannya, lalu tawarkan
kembali tahap yang sedang berjalan.

### Aturan bahasa per level

- **Pemula (A1–A2):** semua penjelasan bahasa Indonesia; item Inggris disertai arti dan
  cara baca; contoh disertai terjemahan.
- **Menengah (B1–B2):** pengantar dan penjelasan nuansa bahasa Indonesia; contoh dan
  latihan bahasa Inggris; koreksi memakai tiga bagian yang sudah ada.
- **Lanjut (C1–C2):** pengantar bahasa Indonesia; materi, contoh, latihan, dan umpan balik
  bahasa Inggris; bahasa Indonesia hanya untuk padanan istilah, nuansa budaya, atau
  perbandingan langsung.

### Pengecualian

- Pertanyaan singkat di luar topik course (misalnya “apa bedanya *affect* dan *effect*?”)
  tidak perlu dipaksa memakai wizard; jawab langsung, lalu tutup dengan satu latihan kecil
  bila relevan.
- Jika pengguna meminta lanjut ke topik berikutnya, mulai lagi dari tahap pengantar.

## What's left to builder

- Perbarui ketiga `SKILL.md` dengan bagian `Alur Wajib per Topik`, wizard empat langkah,
  dan aturan bahasa yang sesuai.
- Tambahkan pemeriksaan struktural yang memastikan ketiga skill memuat urutan
  pengantar → materi → contoh → latihan, label step, opsi `Lanjut`, dan kata kunci bahasa
  Indonesia pada pengantar.
- Verifikasi dengan simulasi satu topik Lanjut: Step 1 Indonesia, Step 2–3 Inggris,
  latihan baru muncul di Step 4.
