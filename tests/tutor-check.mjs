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
  "## Alur Wajib per Topik (Wizard 5 Step)",
  "### Step 1 — Pengantar (Indonesia)",
  "### Step 2 — Materi",
  "### Step 3 — Kosakata",
  "### Step 4 — Contoh",
  "### Step 5 — Latihan",
  "Lanjut ke materi",
  "Lanjut ke kosakata",
  "Lanjut ke contoh",
  "Lanjut ke latihan",
  "tool `question`",
  "Jika pengguna bertanya di tengah wizard",
  "teks polos",
];

const stepOrder = [
  "### Step 1 — Pengantar (Indonesia)",
  "### Step 2 — Materi",
  "### Step 3 — Kosakata",
  "### Step 4 — Contoh",
  "### Step 5 — Latihan",
];

for (const [level, text] of Object.entries(skills)) {
  for (const token of required) {
    assert.ok(text.includes(token), `${level}: missing ${token}`);
  }
  assert.match(text, /Tidak ada pertanyaan latihan di step ini/i, `${level}: Step 1 must not ask an exercise`);
  assert.match(text, /Jangan menampilkan isi\s+step berikutnya/i, `${level}: must not leak later steps`);

  let previous = -1;
  for (const heading of stepOrder) {
    const index = text.indexOf(heading);
    assert.ok(index > previous, `${level}: ${heading} must follow the previous step`);
    previous = index;
  }

  assert.match(text, /di luar topik course/i, `${level}: must exempt short off-topic questions`);
  assert.match(text, /ketik ["“']?lanjut/i, `${level}: typed "lanjut" must advance the wizard`);

  assert.doesNotMatch(text, /setiap respons ditutup dengan satu latihan/i, `${level}: no per-response exercise`);
  assert.doesNotMatch(text, /Akhiri setiap respons/i, `${level}: no per-response exercise`);
  assert.doesNotMatch(text, /Respons diakhiri .*tanpa latihan/i, `${level}: no per-response exercise`);
}

assert.match(skills.pemula, /jenis kata/i, "pemula must name the word class simply");
assert.match(skills.menengah, /kelas kata/i, "menengah must name the word class");
assert.match(skills.lanjut, /kelas kata/i, "lanjut must name the word class");
for (const [level, text] of Object.entries(skills)) {
  assert.match(text, /kolokasi|kombinasi kata/i, `${level}: vocabulary step must cover collocations`);
}

assert.match(skills.pemula, /cara baca/i, "pemula must keep pronunciation");
assert.match(skills.pemula, /arti bahasa Indonesia/i, "pemula must keep Indonesian meanings");
assert.match(skills.menengah, /Gunakan bahasa Indonesia untuk pengantar topik/, "menengah rule must open in Indonesian");
assert.doesNotMatch(skills.menengah, /Sapaan dan contoh Inggris sederhana/, "menengah must not prescribe an English greeting");
assert.doesNotMatch(skills.lanjut, /Komunikasi Penuh Bahasa Inggris/);
assert.doesNotMatch(skills.lanjut, /Seluruh respons dalam bahasa Inggris/);
assert.match(skills.lanjut, /Pengantar[\s\S]{0,120}bahasa Indonesia/i);
assert.match(skills.lanjut, /Penjelasan materi[\s\S]{0,80}bahasa Indonesia/i);
assert.match(skills.lanjut, /Materi[\s\S]{0,120}Inggris/i);
assert.match(skills.lanjut, /catatan nuansa[\s\S]{0,40}bahasa Indonesia/i);

console.log("PASS: tutor wizard contract");
