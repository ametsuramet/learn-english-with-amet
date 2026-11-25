# Materi dari Sesi Belajar

Saat sesi tutor di chat memunculkan hal baru yang layak dipakai ulang, agent boleh menulis draf materi. Draf ini **bukan** materi aktif: UI hanya membaca `lessons.js`, dan draf tidak boleh dimuat oleh `index.html` maupun `lessons.js`.

## Kapan menulis

- Di akhir sesi, jika muncul item baru: idiom yang sering dipakai, cara baca yang lebih mudah, penjelasan mengapa kalimat terasa kaku, atau contoh kalimat yang lebih natural.
- Jika tidak ada hal baru, jangan buat file.
- Agent tidak mencatat progres, tidak menandai topik selesai, dan tidak membuka topik berikutnya. Urutan belajar tetap menjadi urusan UI.

## Nama file

`materi-baru/YYYY-MM-DD-<slug>.md`, satu file untuk satu sesi atau satu kelompok item yang masih bertema. Salin `materi-baru/_TEMPLATE.md` sebagai awal.

## Field wajib

Tujuh label ini harus ada dan tidak diganti:

- `Level:` — hanya `pemula`, `menengah`, atau `mahir`.
- `Saran penempatan:` — ID topik yang sudah ada (mis. `pemula:belanja`) atau `topik baru: <judul>`.
- `Sumber sesi:` — tanggal dan topik percakapan singkat.
- `## Item` — tiga item baru.
- `## Prompt latihan` — satu latihan statis.
- `## Kunci jawaban statis` — kunci jawaban, tanpa umpan balik AI.
- `## Checklist koreksi` — lima poin sesuai aturan level.

## Isi per level

- **pemula**: setiap item memuat `en` / `meaning` / `say`; penjelasan dan koreksi dalam bahasa Indonesia santai; koreksi berurutan apresiasi → bagian benar → perbaikan + alasan singkat → versi natural; tutup satu latihan singkat.
- **menengah**: setiap item memuat `en` / `meaning` / `note`; 2–3 kosakata/phrasal verb/idiom dengan konteks; koreksi berlabel **Perbaikan Grammar** → **Versi Lebih Natural** → **Penjelasan Singkat**; tutup pertanyaan terbuka/skenario untuk jawaban 3–4 kalimat.
- **mahir**: setiap item memuat `en` / `meaning: ""` / `note`; koreksi memakai *Precision & Style* → *Collocations & Idiomatic Expressions* → *Subtle Errors*; sertakan register; tutup simulasi/debat atau tantangan *paraphrasing*. Hapus blok contoh level lain dari template. Konvensi ini sengaja mempersempit tiga pengecualian bahasa Indonesia pada skill mahir: draf tidak memuat catatan atau terjemahan Indonesia.

Label field di atas adalah metadata tetap dan boleh tetap dalam bahasa Indonesia. Untuk `mahir`, semua isi di dalam bagian — item, catatan, latihan, kunci jawaban, dan checklist — wajib bahasa Inggris.

## Menggabung ke UI

1. Pengguna meminta gabung draf tertentu.
2. Agent membaca file, memvalidasi tujuh field dan aturan level di atas.
3. Agent menulis entri ke `lessons.js`: menambah item ke topik yang sudah ada, atau membuat topik baru dengan kunci `level:id`.
4. Jika topik baru dibuat, perbarui `tests/ui-check.mjs` untuk jumlah dan daftar judul topik. Jika hanya menambah item, kontrak tes tidak berubah.
5. Jalankan `node tests/materi-check.mjs && node tests/ui-check.mjs && node tests/path-check.mjs && node tests/path-behavior-check.mjs`.
6. Commit. Workflow Pages yang sudah ada otomatis men-deploy.

## Tes

`node tests/materi-check.mjs` mengabaikan teks di dalam komentar HTML, lalu menolak draf tanpa field wajib, `Level:` di luar tiga nilai yang diizinkan, jumlah item `- en:` bukan tepat tiga, draf mahir yang memakai `Arti:`, `cara baca`, `meaning:` terisi, atau tanpa ketiga label koreksi tingkat lanjut, serta referensi `materi-baru/` di `index.html` atau `lessons.js`. Pemeriksaan ini dijalankan manual saat penggabungan; workflow Pages tidak menjalankan tes.
