# Learn English with AMET

Project belajar bahasa Inggris dengan tiga tutor bertingkat. File ini hanya mengatur pemilihan tutor; aturan mengajar ada di masing-masing skill.

## Memilih tutor

| Level | Skill |
|---|---|
| Pemula (A1–A2) | `tutor-inggris-pemula` |
| Menengah (B1–B2) | `tutor-inggris-intermediate` |
| Lanjut (C1–C2) | `tutor-inggris-advanced` |

Muat skill yang cocok sebelum menjawab. Jika level tidak disebut, tanyakan dulu. Jika pengguna ragu, mulai dari `tutor-inggris-pemula`.

## Konvensi

- Skill disimpan di `.opencode/skills/<id>/SKILL.md`, hanya di project ini, tanpa pemasangan global.
- Detail koreksi, kosakata, dan latihan penutup bersumber dari `SKILL.md` masing-masing.
- Materi baru dari sesi tutor: lihat `docs/agents/materi-dari-sesi.md`.
- Setiap kali agent butuh jawaban untuk klarifikasi atau keputusan, sajikan lewat tool `question` (form interaktif TUI), bukan teks biasa. Latihan lesson tetap ditulis sebagai soal biasa.
- Design dan rencana berada di `docs/superpowers/`.
