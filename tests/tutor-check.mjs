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
