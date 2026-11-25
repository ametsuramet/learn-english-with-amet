# Mobile Topic Drawer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sembunyikan sidebar topik di layar < 768px dan ganti dengan drawer kiri yang dibuka tombol hamburger, memakai satu `#topic-list` yang sama.

**Architecture:** Sidebar existing diberi kelas responsive: `fixed`/`translate-x-full` di mobile dan `md:static`/`md:translate-x-0` di desktop. Satu blok fungsi di dalam inline script mengelola state buka/tutup, backdrop, scroll lock, fokus, dan breakpoint; `renderTopics()` tetap menjadi satu-satunya pengisi daftar topik. Tidak ada file JS baru, state tersimpan, atau perubahan `lessons.js`.

**Tech Stack:** Static HTML, Tailwind CDN (`darkMode: "class"`), Font Awesome CDN, classic `<script>` (`lessons.js`), Node `vm` + `assert` untuk tes.

**Spec:** `docs/superpowers/specs/2026-11-25-mobile-topic-drawer-design.md`

## Global Constraints

- Breakpoint harus `md` / `window.matchMedia("(max-width: 767px)")`.
- Harus tetap satu elemen `id="topic-list"`; `renderTopics()` tidak boleh diganti.
- Tetap satu file `index.html`, tanpa build step/server/npm; `<script src="lessons.js"></script>` dan tanpa `fetch(`.
- Ikon memakai Font Awesome CDN yang sudah ada: `fa-bars`, `fa-xmark`.
- Warna memakai token existing: `bg-card`, `border-border`, `bg-black/50`, `text-foreground`; jangan ubah token tema atau `preferences.theme`.
- Drawer selalu tertutup saat halaman dimuat; tidak ada kunci `localStorage` baru.
- Z-index: backdrop `z-40`, drawer `z-50`.

## Review Focus

- Jendela melebar ke `md` saat drawer terbuka → backdrop, scroll lock, dan `aria-expanded` harus bersih tanpa memindahkan fokus. Diuji Task 1 langkah 1 (`resize` assertion).
- Preferensi tema `light`/`dark` tidak boleh berubah saat drawer dipakai → diuji Task 2 langkah 4 lewat `tests/theme-check.mjs` yang tetap hijau.
- Topik terkunci tidak boleh menutup drawer → diuji Task 2 langkah 1 (assert urutan `if (!unlocked) return;` sebelum `closeTopicDrawer()` di handler klik topik).
- Modal nama saat first-open tidak boleh bertabrakan dengan drawer → diuji Task 1 langkah 4 lewat `tests/path-check.mjs` dan `tests/path-behavior-check.mjs` yang tetap hijau.
- Skenario `file://` / tanpa jaringan → diuji Task 1 langkah 1 (`assert.doesNotMatch(html, /fetch\(/)` dan satu `<script src="lessons.js">`).

---

### Task 1: Drawer structure, open/close, and breakpoint reset

**Files:**
- Modify: `index.html` (header around lines 68-87, `<main>` around lines 89-110, insertion after progress normalization around lines 291-295, handler wiring near lines 452-455)
- Create: `tests/drawer-check.mjs`

**Interfaces:**
- Consumes: `byId(id)`, `window.matchMedia`, `document.body`, `progressStore` (tidak diubah).
- Produces (didefinisikan di dalam marker `// DRAWER_BEHAVIOR_START` … `// DRAWER_BEHAVIOR_END`): `isMobileDrawer()`, `openTopicDrawer()`, `closeTopicDrawer({ returnFocus = true } = {})`, `syncTopicDrawerBreakpoint()`, `onTopicDrawerKeydown(event)`. Task 2 memakai `onTopicDrawerKeydown` dan `closeTopicDrawer`.

- [ ] **Step 1: Write the failing test**

Buat `tests/drawer-check.mjs` dengan structur assertions ini:

```js
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)].map((m) => m[1]).at(-1);

for (const token of [
  'id="topic-toggle"', 'id="topic-sidebar"', 'id="topic-close"', 'id="topic-backdrop"',
  'aria-controls="topic-sidebar"', 'aria-expanded="false"', "fa-bars", "fa-xmark",
  "translate-x-full", "md:translate-x-0", "md:static", "z-40", "z-50",
  "// DRAWER_BEHAVIOR_START", "// DRAWER_BEHAVIOR_END",
  'byId("topic-toggle").addEventListener("click", openTopicDrawer)',
  'byId("topic-backdrop").addEventListener("click"',
  'document.addEventListener("keydown"',
]) {
  assert.ok(html.includes(token), `missing: ${token}`);
}
assert.equal((html.match(/id="topic-list"/g) || []).length, 1);
assert.doesNotMatch(html, /fetch\(/);

const start = app.indexOf("// DRAWER_BEHAVIOR_START");
const end = app.indexOf("// DRAWER_BEHAVIOR_END");
assert.ok(start >= 0 && end > start, "drawer behavior markers not found");
const drawerSource = app.slice(start, end);
```

Tambahkan harness VM dengan bentuk fake DOM berikut (fokus diwakili `doc.activeElement`):

```js
function harness({ matches = true, legacyListener = false } = {}) {
  const bodyClasses = new Set();
  const sidebarClasses = new Set(["translate-x-full"]);
  const toggle = { attrs: {}, setAttribute(k, v) { this.attrs[k] = v; }, focus() { doc.activeElement = this; } };
  const close = { focus() { doc.activeElement = this; } };
  const backdrop = { hidden: true };
  const sidebar = {
    classList: { add: (c) => sidebarClasses.add(c), remove: (c) => sidebarClasses.delete(c) },
    querySelectorAll: () => [close],
  };
  const doc = {
    activeElement: null,
    body: { classList: { add: (c) => bodyClasses.add(c), remove: (c) => bodyClasses.delete(c) } },
  };
  const media = { matches };
  const register = (cb) => { media.listener = cb; };
  if (legacyListener) media.addListener = register;
  else media.addEventListener = (_name, cb) => register(cb);
  const context = {
    window: {
      matchMedia: (query) => {
        assert.equal(query, "(max-width: 767px)");
        return media;
      },
    },
    document: doc,
    byId: (id) => ({
      "topic-toggle": toggle, "topic-sidebar": sidebar,
      "topic-backdrop": backdrop, "topic-close": close,
    })[id],
  };
  vm.createContext(context);
  vm.runInContext(
    `${drawerSource}\nthis.__drawer = { isMobileDrawer, openTopicDrawer, closeTopicDrawer, syncTopicDrawerBreakpoint, onTopicDrawerKeydown };`,
    context
  );
  return { ...context.__drawer, toggle, close, backdrop, sidebarClasses, bodyClasses, media, doc };
}
```

Tambahkan assertions (semua harus gagal sebelum implementasi):

```js
{
  const h = harness();
  assert.equal(h.isMobileDrawer(), true);
  h.openTopicDrawer();
  assert.equal(h.backdrop.hidden, false);
  assert.ok(h.sidebarClasses.has("translate-x-0"));
  assert.ok(!h.sidebarClasses.has("translate-x-full"));
  assert.equal(h.toggle.attrs["aria-expanded"], "true");
  assert.ok(h.bodyClasses.has("overflow-hidden"));
  assert.equal(h.doc.activeElement, h.close);

  h.closeTopicDrawer();
  assert.equal(h.backdrop.hidden, true);
  assert.ok(h.sidebarClasses.has("translate-x-full"));
  assert.equal(h.toggle.attrs["aria-expanded"], "false");
  assert.ok(!h.bodyClasses.has("overflow-hidden"));
  assert.equal(h.doc.activeElement, h.toggle);
}
{
  const h = harness();
  h.openTopicDrawer();
  h.onTopicDrawerKeydown({ key: "Escape", preventDefault() {} });
  assert.equal(h.backdrop.hidden, true, "Esc must close drawer");
}
{
  const h = harness();
  h.openTopicDrawer();
  h.media.matches = false;
  h.media.listener({ matches: false });
  assert.equal(h.backdrop.hidden, true, "resize to md must close drawer");
  assert.equal(h.doc.activeElement, h.close, "resize reset must not move focus");
  assert.ok(!h.bodyClasses.has("overflow-hidden"));
}
{
  const h = harness({ matches: false });
  h.openTopicDrawer();
  assert.equal(h.backdrop.hidden, true, "openTopicDrawer must no-op on desktop");
}
{
  const h = harness({ legacyListener: true });
  h.openTopicDrawer();
  h.media.matches = false;
  h.media.listener({ matches: false });
  assert.equal(h.backdrop.hidden, true, "legacy addListener fallback must work");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/drawer-check.mjs`
Expected: FAIL with `missing: id="topic-toggle"` / `drawer behavior markers not found`.

- [ ] **Step 3: Implement markup, state helpers, and wiring in `index.html`**

Tambahkan di header sebelum `#theme-toggle`:

```html
<button id="topic-toggle" type="button" class="rounded-md border border-border px-3 py-2 text-sm md:hidden" aria-label="Buka daftar topik" aria-expanded="false" aria-controls="topic-sidebar">
  <i class="fa-solid fa-bars" aria-hidden="true"></i>
</button>
```

Ganti section Topik dengan:

```html
<section id="topic-sidebar" class="fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs translate-x-full overflow-y-auto rounded-none border-r border-border bg-card p-5 shadow-xl transition-transform duration-200 md:static md:z-auto md:w-auto md:max-w-none md:translate-x-0 md:overflow-visible md:rounded-lg md:border md:shadow-sm">
  <div class="mb-3 flex items-center justify-between">
    <h2 class="text-lg font-semibold">Topik</h2>
    <button id="topic-close" type="button" class="rounded-md border border-border px-2 py-1 text-sm md:hidden" aria-label="Tutup daftar topik">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
  </div>
  <div id="topic-list" class="flex flex-col gap-2"></div>
</section>
```

Tambahkan setelah `</main>` (sebelum section Progres):

```html
<div id="topic-backdrop" class="fixed inset-0 z-40 bg-black/50 md:hidden" hidden></div>
```

Sisipkan blok ini setelah blok normalisasi `if (!isLevelUnlocked(progress.level)) { ... }` dan sebelum `activeTopicId = ...`:

```js
    // DRAWER_BEHAVIOR_START
    const drawerQuery = window.matchMedia("(max-width: 767px)");
    let topicDrawerOpen = false;
    function isMobileDrawer() {
      return drawerQuery.matches;
    }
    function drawerFocusables() {
      return Array.from(byId("topic-sidebar").querySelectorAll("button:not([disabled])"));
    }
    function openTopicDrawer() {
      if (!isMobileDrawer()) return;
      const sidebar = byId("topic-sidebar").classList;
      sidebar.remove("translate-x-full");
      sidebar.add("translate-x-0");
      byId("topic-backdrop").hidden = false;
      byId("topic-toggle").setAttribute("aria-expanded", "true");
      document.body.classList.add("overflow-hidden");
      topicDrawerOpen = true;
      byId("topic-close").focus();
    }
    function closeTopicDrawer({ returnFocus = true } = {}) {
      const sidebar = byId("topic-sidebar").classList;
      sidebar.remove("translate-x-0");
      sidebar.add("translate-x-full");
      byId("topic-backdrop").hidden = true;
      byId("topic-toggle").setAttribute("aria-expanded", "false");
      document.body.classList.remove("overflow-hidden");
      topicDrawerOpen = false;
      if (returnFocus) byId("topic-toggle").focus();
    }
    function onTopicDrawerKeydown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeTopicDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = drawerFocusables();
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    function syncTopicDrawerBreakpoint() {
      if (!drawerQuery.matches) closeTopicDrawer({ returnFocus: false });
    }
    if (typeof drawerQuery.addEventListener === "function") {
      drawerQuery.addEventListener("change", syncTopicDrawerBreakpoint);
    } else if (typeof drawerQuery.addListener === "function") {
      drawerQuery.addListener(syncTopicDrawerBreakpoint);
    }
    // DRAWER_BEHAVIOR_END
```

Tambahkan wiring di dekat listener level:

```js
    byId("topic-toggle").addEventListener("click", openTopicDrawer);
    byId("topic-close").addEventListener("click", () => closeTopicDrawer());
    byId("topic-backdrop").addEventListener("click", () => closeTopicDrawer());
    document.addEventListener("keydown", (event) => {
      if (topicDrawerOpen) onTopicDrawerKeydown(event);
    });
```

Catatan: `openTopicDrawer()` no-op di desktop, tetapi `closeTopicDrawer()` reset tanpa syarat supaya `syncTopicDrawerBreakpoint()` tetap membersihkan state setelah jendela melebar ke `md`.

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
node tests/drawer-check.mjs && node tests/theme-check.mjs && node tests/ui-check.mjs && node tests/materi-check.mjs && node tests/path-check.mjs && node tests/path-behavior-check.mjs && node tests/workflow-check.mjs
```

Expected: 7 baris `PASS`, tanpa error.

- [ ] **Step 5: Commit**

```bash
git add index.html tests/drawer-check.mjs
git commit -m "feat: add mobile topic drawer with hamburger toggle"
```

---

### Task 2: Topic-select close, focus trap, and live verification

**Files:**
- Modify: `tests/drawer-check.mjs`
- Modify: `index.html` (`renderTopics()` click handler around lines 340-346)

**Interfaces:**
- Consumes: `onTopicDrawerKeydown(event)`, `closeTopicDrawer({ returnFocus })`, `drawerFocusables()` dari Task 1, `isMobileDrawer()` dari Task 1.
- Produces: perilaku klik topik menutup drawer hanya di mobile; Tab/Shift+Tab bersiklus di dalam drawer.

- [ ] **Step 1: Write the failing tests**

Ubah harness di Task 1: tambahkan `let focusables = [close];` di dalam `harness()`, ganti `querySelectorAll: () => [close]` menjadi `querySelectorAll: () => focusables`, dan kembalikan `setFocusables: (items) => { focusables = items; }` bersama nilai lainnya.

Tambahkan assertions berikut ke `tests/drawer-check.mjs`:

```js
{
  const h = harness();
  const first = { focus() { h.doc.activeElement = this; } };
  const last = { focus() { h.doc.activeElement = this; } };
  h.setFocusables([first, last]);
  h.doc.activeElement = last;
  h.onTopicDrawerKeydown({ key: "Tab", shiftKey: false, preventDefault() { this.prevented = true; } });
  assert.equal(h.doc.activeElement, first, "Tab from last must wrap to first");
  h.doc.activeElement = first;
  h.onTopicDrawerKeydown({ key: "Tab", shiftKey: true, preventDefault() {} });
  assert.equal(h.doc.activeElement, last, "Shift+Tab from first must wrap to last");
}
{
  const clickHandler = app.slice(app.indexOf("button.addEventListener(\"click\", () => {"), app.indexOf("container.append(button);"));
  assert.ok(clickHandler.indexOf("if (!unlocked) return;") < clickHandler.indexOf("closeTopicDrawer()"),
    "locked topic must return before drawer close");
  assert.ok(clickHandler.includes("renderLesson();"), "topic selection must still render lesson");
  assert.ok(clickHandler.includes("if (isMobileDrawer()) closeTopicDrawer();"), "selected topic must close mobile drawer");
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/drawer-check.mjs`
Expected: FAIL pada assertion wrap fokus / `closeTopicDrawer()` tidak ditemukan di handler klik.

- [ ] **Step 3: Implement the two behavior changes**

Di `renderTopics()`, di dalam handler klik topik setelah `renderLesson();`, tambahkan:

```js
          if (isMobileDrawer()) closeTopicDrawer();
```

Biarkan `if (!unlocked) return;` tetap berada sebelum perubahan state. Di `onTopicDrawerKeydown()`, pakai `drawerFocusables()` (sudah ada dari Task 1); pastikan `event.preventDefault()` hanya dipanggil saat wrap terjadi.

- [ ] **Step 4: Run full suite**

Run:

```bash
node tests/drawer-check.mjs && node tests/theme-check.mjs && node tests/ui-check.mjs && node tests/materi-check.mjs && node tests/path-check.mjs && node tests/path-behavior-check.mjs && node tests/workflow-check.mjs
```

Expected: 7 baris `PASS` (membuktikan preferensi tema dan alur unlock tidak berubah).

- [ ] **Step 5: Verify in a browser at mobile width**

Serve project lewat `python3 -m http.server 8765` dan buka `http://127.0.0.1:8765/index.html` dengan viewport ~390×844. Expected:
- hamburger terlihat, sidebar tidak terlihat dan tidak menggeser konten;
- klik hamburger → drawer kiri tampil, backdrop gelap, fokus di tombol close;
- klik topik yang terbuka → materi berubah dan drawer tertutup;
- `Esc` menutup drawer; melebar ke ≥768px mengembalikan sidebar statis;
- tombol tema tetap bersiklus dan warna dark tetap benar.

- [ ] **Step 6: Commit, push, and verify deployment**

```bash
git add index.html tests/drawer-check.mjs
git commit -m "fix: close drawer on topic selection and trap focus"
git push origin main
```

Pantau run GitHub Actions `deploy-pages.yml` untuk SHA `HEAD` lewat public REST API (tidak memakai `gh` yang belum terautentikasi), lalu verifikasi HTML live di `https://ametsuramet.github.io/learn-english-with-amet/` mengandung `id="topic-toggle"`, `id="topic-backdrop"`, dan `md:translate-x-0`.

## Self-review

- Spec coverage: breakpoint, satu list, hamburger, backdrop, close paths, fokus, resize, tema, tanpa state baru — semua ada di Task 1/2.
- Review Focus: kelima input/class punya test yang ditugaskan (lihat bagian Review Focus dan langkah terkait).
- Type/name consistency: `openTopicDrawer`, `closeTopicDrawer`, `onTopicDrawerKeydown`, `syncTopicDrawerBreakpoint`, `drawerFocusables`, `isMobileDrawer` dipakai dengan nama yang sama di kedua task.
