# Materi dari Sesi Belajar — Design

## Intent

Sesi belajar bareng agent di chat sering memunculkan hal yang tidak ada di `lessons.js`: idiom yang ternyata sering dipakai, cara baca yang lebih mudah, atau penjelasan mengapa kalimat terasa kaku. Hal itu harus bisa ditangkap sebagai draf materi, dibaca dan disetujui dulu, baru masuk ke UI. Agent tidak perlu mengelola progres atau membuka topik berikutnya.

## Goals

- Agent menulis draf materi baru ke repo saat sesi tutor menghasilkan hal yang layak dipakai ulang.
- Draf mengikuti aturan tutor sesuai level sehingga bisa langsung dikonversi menjadi entri `lessons.js`.
- Pembelajar melihat materi itu di UI setelah draf disetujui dan digabung.

## Non-goals

- Mencatat progres, menandai topik selesai, atau mengatur urutan belajar dari chat.
- Publikasi otomatis dari draf ke `lessons.js`.
- Mengubah ketiga `SKILL.md`, logika UI, atau tombol progres.
- Sinkronisasi langsung dengan `localStorage` browser.

## Constraints

- UI tetap statis; satu-satunya sumber materi yang dibaca UI adalah `lessons.js`.
- Draf bukan materi aktif: tidak boleh dimuat oleh `index.html` atau `lessons.js`.
- Level: `pemula`, `menengah`, `mahir`. Kunci topik tetap `level:id`.
- Aturan isi mengikuti skill masing-masing: Pemula `en`/`meaning`/`say` + lima langkah koreksi bahasa Indonesia; Menengah `en`/`meaning`/`note` + label *Perbaikan Grammar*, *Versi Lebih Natural*, *Penjelasan Singkat*; Mahir seluruhnya bahasa Inggris + *Precision & Style*, *Collocations & Idiomatic Expressions*, *Subtle Errors*.

## Approaches

1. **Draf dulu, gabung setelah disetujui** — dipilih. Agent menulis file Markdown baru; materi masuk `lessons.js` setelah ada perintah gabung. Trade-off: butuh satu langkah ekstra, tetapi jalur belajar yang sudah terverifikasi tidak berubah.
2. **Langsung menambah topik ke `lessons.js`** — ditolak. Sekali push langsung live, tetapi mengubah jumlah/urutan topik dan kontrak tes 12 topik tanpa tinjauan.
3. **Bank materi opsional yang langsung tampil di UI** — ditolak untuk sekarang. Tidak mengganggu urutan, tetapi memerlukan file script baru, perubahan UI, dan tes baru; lebih besar dari yang diminta.

## Design

### Lokasi dan nama

- Draf disimpan di `materi-baru/YYYY-MM-DD-<slug>.md`.
- Template di `materi-baru/_TEMPLATE.md`.
- Satu file untuk satu sesi atau satu kelompok item yang masih bertema.

### Isi draf

Template berisi:

- `Level:` salah satu dari `pemula`, `menengah`, `mahir`.
- `Saran penempatan:` ID topik yang sudah ada, atau `topik baru: <judul>`.
- `Sumber sesi:` tanggal dan topik percakapan.
- `## Item` — tiga item dengan field sesuai level (lihat Constraints).
- `## Prompt latihan`, `## Kunci jawaban statis`, `## Checklist koreksi` — lima poin sesuai aturan level.

### Kapan agent menulis

- Di akhir sesi, bila muncul hal baru yang bisa dipakai ulang, agent menulis satu file draf lalu memberi tahu lokasinya.
- Bila tidak ada hal baru, tidak ada file dibuat.
- Agent tidak menyarankan perubahan progres atau urutan topik.

### Alur penggabungan

- Saat pengguna berkata “gabungkan draf …”, agent membaca file, memvalidasi isinya terhadap aturan level, lalu menulis entri ke `lessons.js`.
- Jika draf menambah topik baru, agent memperbarui `tests/ui-check.mjs` (jumlah dan daftar judul topik) agar kontrak tetap benar.
- Jika draf hanya menambah item ke topik existing, kontrak tes tidak berubah.
- Commit dibuat setelah penggabungan; workflow Pages yang sudah ada otomatis men-deploy.

### Dokumentasi dan tes

- `docs/agents/materi-dari-sesi.md` menjelaskan konvensi ini; `AGENTS.md` menambahkan satu pointer ke dokumen itu.
- `tests/materi-check.mjs` memeriksa template ada dan setiap draf memiliki `Level:`, `## Item`, `## Prompt latihan`, `## Kunci jawaban statis`, dan `## Checklist koreksi`. Tes ini tidak menjalankan atau memuat draf sebagai materi aktif.

## What's left to builder

- Membuat `materi-baru/_TEMPLATE.md` dan `docs/agents/materi-dari-sesi.md`.
- Menambahkan pointer di `AGENTS.md`.
- Membuat `tests/materi-check.mjs` dan menjalankannya bersama tes yang sudah ada.
- Tidak ada perubahan pada `index.html`, `lessons.js`, ketiga `SKILL.md`, atau workflow deploy.
