import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const data = readFileSync(new URL("../lessons.js", import.meta.url), "utf8");

const required = [
  'id="level-pemula"',
  'id="level-menengah"',
  'id="level-mahir"',
  'id="topic-list"',
  'id="lesson-card"',
  'id="exercise-input"',
  'id="check-answer"',
  'id="feedback"',
  'id="progress-xp"',
  'id="progress-streak"',
  'id="progress-topics"',
  'id="mark-done"',
  'id="reset-progress"',
  'id="export-progress"',
  "learn-english-progress-v1",
  "progressStore",
];

for (const token of required) {
  assert.ok(html.includes(token), `missing: ${token}`);
}

assert.match(html, /A1[\s\S]{0,80}A2/);
assert.match(html, /B1[\s\S]{0,80}B2/);
assert.match(html, /C1[\s\S]{0,80}C2/);

assert.match(html, /<script src="lessons\.js"><\/script>/);
assert.doesNotMatch(html, /const LESSONS = \{/);

assert.match(data, /window\.LESSONS = \{/);
for (const level of ["pemula", "menengah", "mahir"]) {
  assert.ok(data.includes(`${level}: {`), `missing level: ${level}`);
}

const topicCount = (data.match(/id: "/g) || []).length;
assert.equal(topicCount, 15, `expected 15 topics, got ${topicCount}`);

const titles = [
  "Belanja di supermarket",
  "Sapaan sederhana",
  "Di restoran",
  "Keluarga",
  "Waktu dan jam",
  "Bekerja",
  "Sekolah",
  "Berlibur",
  "Menyatakan pendapat",
  "Membuat janji",
  "Bercerita tentang pengalaman",
  "Meminta bantuan di kantor",
  "Raising objections tactfully",
  "Negotiating scope",
  "Academic hedging",
];
for (const title of titles) {
  assert.ok(data.includes(`title: "${title}"`), `missing topic: ${title}`);
}

const mahir = data.slice(data.indexOf("mahir: {"));
assert.doesNotMatch(mahir, /Arti:/);
assert.doesNotMatch(mahir, /cara baca/);
assert.doesNotMatch(mahir, /\bdengan\b/);
assert.doesNotMatch(mahir, /\buntuk\b/);

console.log("PASS: UI structural contract");
