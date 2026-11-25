# Mobile Topic Drawer — Design

## Intent

Menyembunyikan sidebar daftar topik pada tampilan mobile dan menggantinya dengan
drawer yang dibuka lewat tombol hamburger, tanpa mengubah materi, latihan,
progres, atau aturan unlock.

## Goals

- Di layar < 768px, daftar topik tidak mengambil ruang di alur halaman.
- Hamburger di header membuka/menutup drawer kiri yang berisi daftar topik yang sama.
- Drawer bisa ditutup lewat tombol close, backdrop, `Esc`, atau setelah memilih topik.
- Fokus keyboard masuk ke drawer saat dibuka dan kembali ke hamburger saat ditutup.
- Tetap satu file `index.html`, satu `#topic-list`, tanpa build step/server/npm.

## Non-goals

- Tidak mengubah `lessons.js`, urutan level/topik, atau isi materi.
- Tidak menambah state baru ke `localStorage` (drawer selalu tertutup saat muat halaman).
- Tidak mengubah tombol tema, modal nama, atau ekspor/reset progres.
- Tidak membuat daftar topik duplikat untuk mobile.

## Constraints

- Layout sudah memakai grid `md:grid-cols-3`; breakpoint `md` (768px) dipakai agar
  perilaku desktop tidak berubah.
- `renderTopics()` mengisi `#topic-list` secara langsung; elemen ini harus tetap satu.
- Tailwind CDN dipakai lewat `<script>` yang sudah ada, dengan `darkMode: "class"`.
- Ikon memakai Font Awesome CDN yang sudah dimuat (`fa-bars`, `fa-xmark`).
- Warna memakai token yang sudah ada (`bg-card`, `border-border`, `bg-black/50`).

## Approaches

1. **Satu list dipakai ulang** — dipilih pengguna. Sidebar yang sama berubah menjadi
   drawer di mobile lewat kelas responsif; `renderTopics()` tidak perlu diubah.
2. **Drawer + list duplikat** — ditolak: dua DOM list harus dijaga sinkronnya.
3. **Popover accordion** — ditolak: bukan drawer geser yang diminta.

## Design

### Markup

- Tombol `#topic-toggle` ditaruh di header, sebelum `#theme-toggle`, dengan kelas
  `md:hidden`, `aria-label`, `aria-expanded="false"`, dan `aria-controls="topic-sidebar"`.
  Ikon: `fa-bars`.
- `<section id="topic-sidebar">` tetap menjadi anak `<main>`, diberi kelas drawer mobile:
  `fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs -translate-x-full overflow-y-auto`
  plus transisi; pada `md` dikembalikan ke `static`, lebar penuh grid, tanpa
  `translate`, tanpa `overflow`, dan dengan border/shadow seperti sekarang.
- Tombol close `#topic-close` ada di dalam sidebar, bersifat `md:hidden`, ikon `fa-xmark`.
- Backdrop `#topic-backdrop` berupa elemen `fixed inset-0 z-40 bg-black/50 md:hidden`,
  awalnya tersembunyi. Urutan z-index: backdrop 40, drawer 50.
- Judul "Topik" dan `#topic-list` tetap berada di dalam section yang sama.

### Perilaku

- `isMobileDrawer()` memakai `window.matchMedia("(max-width: 767px)").matches`.
- `openTopicDrawer()` (hanya saat mobile):
  - menghapus `-translate-x-full` dan menambah `translate-x-0` pada sidebar;
  - menampilkan backdrop;
  - men-set `aria-expanded="true"` pada hamburger;
  - mencegah scroll halaman dengan `overflow-hidden` pada `<body>`;
  - memfokuskan `#topic-close` (atau tombol topik pertama bila tombol close tidak ada).
- `closeTopicDrawer()` membalik semua perubahan di atas, memulihkan scroll,
  men-set `aria-expanded="false"`, dan mengembalikan fokus ke hamburger.
- Penutupan dipicu oleh: `#topic-close`, klik backdrop, `Esc`, dan klik tombol topik
  yang berhasil dipilih. Klik topik yang terkunci tidak menutup drawer.
- Saat jendela melebar ke `md`, state drawer di-reset tanpa memindahkan fokus:
  backdrop tersembunyi, scroll dipulihkan, `aria-expanded="false"`.
- Drawer selalu tertutup saat halaman dimuat ulang; tidak ada preferensi tersimpan.

### Aksesibilitas dan tema

- Fokus dijaga di dalam drawer saat terbuka: `Tab`/`Shift+Tab` bersiklus di antara
  `#topic-close` dan tombol topik yang tidak disabled.
- `Esc` ditangani hanya saat drawer terbuka.
- `aria-expanded` dan `aria-controls` pada hamburger mengikuti state drawer.
- Tidak memakai `inert` pada `#app-content` karena drawer berada di dalamnya.
- Semua warna mengikuti token tema yang sudah ada, sehingga mode terang/gelap
  dan preferensi `system` tetap bekerja tanpa kode tambahan.

## What's left to builder

- Tulis tes kontrak dan perilaku drawer yang gagal lebih dulu (tombol, backdrop,
  kelas responsif, fokus/Esc, reset saat resize, dan kompatibilitas tema).
- Ubah `index.html` sesuai desain ini tanpa menyentuh `lessons.js`.
- Jalankan seluruh tes, commit, push, deploy, dan verifikasi halaman live.
