# Tutor Inggris Bertingkat — Design

## Intent

Menjadikan direktori `learn-english` sebagai project belajar bahasa Inggris yang
bisa dipakai bersama agen. Pengguna memulai dari level mana pun dan mendapat
tutor dengan gaya, bahasa pengantar, dan kedalaman umpan balik yang sesuai.

## Goals

- Tiga tutor bertingkat: A1–A2 (pemula), B1–B2 (menengah), C1–C2 (lanjut).
- Gradasi bahasa pengantar yang jelas: Indonesia penuh → campuran → Inggris penuh.
- Tiap tutor punya aturan perilaku yang tegas dan bisa diuji, bukan sekadar deskripsi.
- Agen dapat memilih tutor otomatis dari level yang disebut pengguna.
- Project tetap mudah dikembangkan: pengguna akan menambah/mengupdate level lain kemudian.

## Non-goals

- Kurikulum, daftar materi, atau bank latihan terstruktur.
- Integrasi API, aplikasi web, atau sistem pelacakan progres.
- Menimpa skill global pengguna di luar direktori project ini.

## Constraints

- Isi aturan tutor berasal verbatim dari tiga spesifikasi yang diberikan pengguna.
- Nama skill memakai kebab-case: `tutor-inggris-pemula`, `tutor-inggris-intermediate`, `tutor-inggris-advanced`.
- Skill ditempatkan di `.opencode/skills/<id>/SKILL.md` agar ikut project dan lebih tinggi
  precedensnya daripada skill global.
- Tidak ada instalasi global, tidak ada symlink ke `~/.config/opencode/skills`,
  `~/.claude/skills`, atau `~/.agents/skills`. Semua artefak tinggal di direktori project ini.
- `description` diawali "Use when...", berisi pemicu level saja, tanpa merangkum alur kerja.
- `AGENTS.md` hanya berisi routing dan konvensi project; detail perilaku tetap satu sumber
  kebenaran di masing-masing `SKILL.md`.

## Approaches

1. **Satu skill dengan router level internal.** Satu file, agen memilih level di awal.
   Lebih sedikit file, tetapi campuran tiga gaya pengantar dalam satu badan dokumen mudah
   melahirkan drift, dan aturan level tertentu mudah terlewat saat diedit.
2. **Tiga skill model-invoked terpisah + `AGENTS.md` sebagai router.** (Dipilih.)
   Tiap level punya satu file, satu sumber kebenaran, dan `description` sendiri sehingga
   agen bisa memilih otomatis. `AGENTS.md` memberi indeks manusia dan aturan footing
   tanpa menggandakan isi skill.
3. **Tiga skill user-invoked.** Nol biaya konteks, tetapi agen tidak bisa memilih sendiri
   dan pengguna harus mengingat tiga nama skill — bertentangan dengan tujuan belajar.

## Design

- `.opencode/skills/tutor-inggris-pemula/SKILL.md` — penjelasan Indonesia penuh, tanpa
  istilah akademis, tiap kosakata/kalimat memuat arti + cara baca, koreksi apresiatif,
  ditutup satu latihan singkat.
- `.opencode/skills/tutor-inggris-intermediate/SKILL.md` — bilingual, anti-`Indonesian-isms`,
  2–3 kosakata/idiom per topik, koreksi tiga bagian, ditutup pertanyaan terbuka/skenario
  3–4 kalimat.
- `.opencode/skills/tutor-inggris-advanced/SKILL.md` — Inggris penuh, fokus diksi/tone/register,
  umpan balik tiga lensa, simulasi/debat, ditutup tantangan analitis atau *paraphrasing*.
- `AGENTS.md` — aturan memilih tutor, bagaimana menangani level yang tidak disebut, dan
  penunjuk ke direktori skill. Tetap pendek; tidak mengulang kelima aturan tiap tutor.
- `description` tiap skill menyebut pemicu level dan gejala (misal pengguna menulis kalimat
  dengan terjemahan langsung dari Indonesia) supaya agen memilih tanpa perlu dibantu.

## What's left to builder

- Menjalankan tes baseline tanpa skill untuk menangkap kegagalan nyata sebelum menulis.
- Menulis tiap skill minimal sesuai kegagalan yang teramati, lalu menguji ulang.
- Menulis `AGENTS.md` setelah ketiga skill terverifikasi.
